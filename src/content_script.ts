import {highlightSelection, replayOptions, HighlightOperation, HighlightInfo} from './types'

let allHighlightOperations: HighlightOperation[] = []

const onExtensionMessage = (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  console.log('receive message')
  console.log(request)
  if (request === 'get_new_highlight_operations') {
    const highlightInfos: HighlightInfo[] = highlightSelection()
    const highlightOperations: HighlightOperation[] = highlightInfos.map(info => ({
      id: info.id,
      ops: 'create',
      info: info
    }))

    allHighlightOperations = allHighlightOperations.concat(highlightOperations)
    console.log('return highlight operations')
    console.log(allHighlightOperations)
    sendResponse({highlightOperations: allHighlightOperations});
  }
}

const initContentScript: () => void = () => {
  console.log('loading script')
  chrome.runtime.onMessage.addListener(onExtensionMessage)
  chrome.runtime.sendMessage('fetch_all_highlight_operations', (highlightOperations: HighlightOperation[]) => {
    console.log('recovering highlight infos')
    console.log(highlightOperations)
    allHighlightOperations = highlightOperations
    replayOptions(allHighlightOperations)
  })
}

initContentScript()
