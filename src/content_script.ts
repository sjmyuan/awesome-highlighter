import {highlightSelection, recoverHighlight, HighlightInfo} from './types'

let allHighlightInfos: HighlightInfo[] = []

const onExtensionMessage = (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  console.log('receive message')
  console.log(request)
  if (request === 'get_highlight_info') {
    const highlightInfos = highlightSelection()
    const newHighlightInfos = allHighlightInfos.concat(highlightInfos)
    const mergedHighlightInfos = allHighlightInfos.concat(highlightInfos)

    for (let index = 0; index < allHighlightInfos.length; index++) {
    }

    console.log('return highlight information')
    console.log(highlightInfos)
    sendResponse({highlightInfos: highlightInfos});
  }
}

const initContentScript: () => void = () => {
  console.log('loading script')
  chrome.runtime.onMessage.addListener(onExtensionMessage)
  chrome.runtime.sendMessage('fetch_historical_highlight_info', (highlightInfos: HighlightInfo[]) => {
    console.log('recovering highlight infos')
    console.log(highlightInfos)
    allHighlightInfos = highlightInfos
    recoverHighlight(highlightInfos)
  })
}

initContentScript()
