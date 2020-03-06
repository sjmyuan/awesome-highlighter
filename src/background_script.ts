import {HighlightInfo, saveHighlightInfo, getHighlightInfo} from "./types"

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

const onMessageReceived = async (message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void) => {
  console.log('Received message:')
  console.log(message)
  if ((message instanceof Array) && sender.tab && sender.tab.url) {
    const preHighlightInfos = await getHighlightInfo(sender.tab.url)
    if (preHighlightInfos instanceof Array) {
      await saveHighlightInfo(sender.tab.url, preHighlightInfos.concat(message))
    } else {
      await saveHighlightInfo(sender.tab.url, message)
    }
    sendResponse(true)
  } else if (message == 'fetch-highlight-ranges' && sender.tab && sender.tab.url) {
    console.log('receive message to recover highlight')
    const preHighlightInfos = await getHighlightInfo(sender.tab.url)
    console.log('send back highlight info')
    console.log(preHighlightInfos)
    sendResponse(preHighlightInfos)
  }
  else {
    console.log('Invalid message')
    sendResponse(false)
  }
}

const onContextMenuClicked = (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === 'highlight-text') {
    sendMessageToTab()
  }

  if (info.menuItemId === 'recover-highlight') {
    chrome.tabs.query({active: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.executeScript(tabs[0].id as number, {file: 'js/content_script_recover_highlight.bundle.js'})
      }
      else {
        console.log('No active tab')
      }
    })
  }
}

const onBrowserActionClicked = () => {
  sendMessageToTab()
}

const onTabUpdated = (tabId: number, info: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  console.log('tab updated')
  console.log(tab)
  if (info.status == 'complete') {
    chrome.tabs.query({active: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.executeScript(tabId, {file: 'js/content_script_recover_highlight.bundle.js'})
      }
      else {
        console.log('No active tab')
      }
    })
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
    chrome.contextMenus.create({
      id: 'recover-highlight',
      title: 'Recover Highlight'
    })
  });

  chrome.runtime.onMessage.addListener(onMessageReceived)

  chrome.contextMenus.onClicked.addListener(onContextMenuClicked)

  chrome.browserAction.onClicked.addListener(onBrowserActionClicked)
  chrome.tabs.onUpdated.addListener(onTabUpdated)
}

initBackgroundScript();
