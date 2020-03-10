import {highlightSelection, recoverHighlight, HighlightInfo, mergeHighlightInfo} from './types'

let allHighlightInfos: HighlightInfo[] = []

const onExtensionMessage = (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  console.log('receive message')
  console.log(request)
  if (request === 'get_highlight_info') {
    const highlightInfos = highlightSelection()
    if (allHighlightInfos.length > 0) {
      let newAllHighlightInfos = allHighlightInfos

      for (let index = 0; index < highlightInfos.length; index++) {
        const mergedHighlightInfos: HighlightInfo[] = []

        for (let localIndex = 0; localIndex < newAllHighlightInfos.length; localIndex++) {
          mergedHighlightInfos.concat(mergeHighlightInfo(highlightInfos[index], newAllHighlightInfos[localIndex]))
        }

        newAllHighlightInfos = mergedHighlightInfos
      }

      allHighlightInfos = newAllHighlightInfos
    }
    else {
      allHighlightInfos = highlightInfos
    }
    console.log('return highlight information')
    console.log(allHighlightInfos)
    sendResponse({highlightInfos: allHighlightInfos});
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
