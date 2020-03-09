import {HighlightInfo, saveHighlightInfo, getHighlightInfo} from "./types"

const getHighlightInfoFromTab = async (tab: chrome.tabs.Tab) => {
  console.log('Send message to get highlightInfos')
  if (tab.id && tab.url) {
    const preHighlightInfos = await getHighlightInfo(tab.url as string)
    chrome.tabs.sendMessage(tab.id, {'get_highlight_info': true}, (message: {highlightInfos: HighlightInfo[]}) => {
      if (preHighlightInfos instanceof Array) {
        saveHighlightInfo(tab.url as string, preHighlightInfos.concat(message.highlightInfos))
      } else {
        saveHighlightInfo(tab.url as string, message.highlightInfos)
      }
    })
  }
}

const sendHighlightInfoToTab = async (tab: chrome.tabs.Tab) => {
  console.log('send message to recover highlight')
  if (tab.url && tab.id) {
    const preHighlightInfos = await getHighlightInfo(tab.url)
    console.log('send back highlight info')
    console.log(preHighlightInfos)
    chrome.tabs.sendMessage(tab.id, {'recover_highlight_info': preHighlightInfos})
  }
}

const onMessageReceived = async (message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void) => {
}

const onContextMenuClicked = (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === 'highlight-text' && tab && tab.id) {
    getHighlightInfoFromTab(tab)
  }
}

const onBrowserActionClicked = () => {
  //getHighlightInfoFromTab(tab)
}

const onTabUpdated = (tabId: number, info: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  console.log('tab updated')
  console.log(tab)
  if (info.status == 'complete') {
    sendHighlightInfoToTab(tab)
  }
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

  chrome.tabs.onUpdated.addListener(onTabUpdated)
}

initBackgroundScript();
