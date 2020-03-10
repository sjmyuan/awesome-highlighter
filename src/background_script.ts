import {HighlightInfo, saveHighlightInfo, getHighlightInfo} from "./types"

const getHighlightInfoFromTab = (tab: chrome.tabs.Tab) => {
  console.log('Send message to get highlightInfos')
  console.log(tab)
  if (tab.id && tab.url) {
    chrome.tabs.sendMessage(tab.id, 'get_highlight_info', (message: {highlightInfos: HighlightInfo[]}) => {
      console.log(message)
      saveHighlightInfo(tab.url as string, message.highlightInfos)
    })
  }
}

const onMessageReceived = (message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void) => {

  if (message === 'fetch_historical_highlight_info' && sender.url) {
    getHighlightInfo(sender.url).then(historicalHighlightInfos => {
      console.log('send back historical highlight info')
      console.log(historicalHighlightInfos)
      sendResponse(historicalHighlightInfos)
    })
  }

  return true
}

const onContextMenuClicked = (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === 'highlight-text' && tab && tab.id) {
    getHighlightInfoFromTab(tab)
  }
}

const onBrowserActionClicked = () => {
  //getHighlightInfoFromTab(tab)
}

const initBackgroundScript = () => {
  console.log('background running');
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'highlight-text',
      title: 'Highlight The Selected Text',
      contexts: ['selection'],
    })
  });

  chrome.runtime.onMessage.addListener(onMessageReceived)

  chrome.contextMenus.onClicked.addListener(onContextMenuClicked)

  chrome.browserAction.onClicked.addListener(onBrowserActionClicked)
}

initBackgroundScript();
