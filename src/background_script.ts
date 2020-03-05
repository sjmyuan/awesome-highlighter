import {HighlightInfo, saveHighlightInfo} from "./types"

const sendMessageToTab = () => {
  console.log('Highlight the selected text')
  chrome.tabs.query({active: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.executeScript(tabs[0].id as number, {file: 'js/content_script.bundle.js'})
    }
    else {
      console.log('No active tab')
    }
  })
}

const onMessageReceived = async (message: HighlightInfo[],
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void) => {
  console.log('Received message:')
  console.log(message)
  if (message && sender.tab) {
    await saveHighlightInfo(sender.tab.url as string, message)
    sendResponse(true)
  } else {
    console.log('There is no highlight.')
    sendResponse(false)
  }
}

const onContextMenuClicked = (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === 'highlight-text') {
    sendMessageToTab()
  }
}

const onBrowserActionClicked = () => {
  sendMessageToTab()
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
