import {HighlightInfo, saveHighlightOperation, getHighlightOperation, HighlightOperation} from "./types"

const getHighlightInfoFromTab = (tab: chrome.tabs.Tab) => {
  console.log('Send message to get highlightInfos')
  console.log(tab)
  if (tab.id && tab.url) {
    chrome.tabs.sendMessage(tab.id, 'get_new_highlight_operations', (message: {highlightOperations: HighlightOperation[]}) => {
      console.log(message)
      saveHighlightOperation(tab.url as string, message.highlightOperations)
    })
  }
}

const onMessageReceived = (message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void) => {

  if (message === 'fetch_all_highlight_operations' && sender.url) {
    getHighlightOperation(sender.url).then(highlightOperations => {
      console.log('send back all highlight operations')
      console.log(highlightOperations)
      sendResponse(highlightOperations)
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
