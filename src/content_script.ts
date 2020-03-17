import {highlightSelection, replayOptions, HighlightOperation, HighlightInfo, Message, getHighlightStyles, HighlightStyleInfo} from './types'

const onExtensionMessage = (request: Message, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  console.log('receive message')
  console.log(request)
  if (request.id === 'get_new_highlight_operations') {
    const highlightInfos: HighlightInfo[] = highlightSelection(request.payload as HighlightStyleInfo)
    const highlightOperations: HighlightOperation[] = highlightInfos.map(info => ({
      id: info.id,
      ops: 'create',
      info: info
    }))

    console.log('return highlight operations')
    console.log(highlightOperations)
    sendResponse({highlightOperations: highlightOperations});
  }
}

const initContentScript: () => void = () => {
  console.log('loading script')
  chrome.runtime.onMessage.addListener(onExtensionMessage)
  chrome.runtime.sendMessage({id: 'fetch_all_highlight_operations'}, (highlightOperations: HighlightOperation[]) => {
    console.log('recovering highlight infos')
    console.log(highlightOperations)
    getHighlightStyles().then(styles => {
      replayOptions(highlightOperations, styles)
    })
  })
}

initContentScript()
