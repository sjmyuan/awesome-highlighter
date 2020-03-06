import {highlightSelection, recoverHighlight, RangeIndex} from './types'

const onExtensionMessage = (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  console.log('receive message ' + request)
  if (request['get_highlight_info'] != undefined) {
    const highlightInfos = highlightSelection()
    console.log('return highlight information')
    console.log(highlightInfos)
    sendResponse({highlightInfos: highlightInfos});
  }

  if (request['recover_highlight_info'] != undefined) {
    const highlightInfos: RangeIndex[] = request['recover_highlight_info'] as RangeIndex[]
    recoverHighlight(highlightInfos)
    sendResponse('success')
  }
}
const initContentScript: () => void = async () => {
  console.log('loading script')
  chrome.runtime.onMessage.addListener(onExtensionMessage);
}

initContentScript();
