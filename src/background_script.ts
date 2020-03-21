import {saveHighlightOperation, getHighlightOperation, HighlightOperation, Message, getHighlightStyles, HighlightStyleInfo, copyAsString, copyAsMarkdown, getAvailableUrls} from "./types"

const getHighlightInfoFromTab = (tab: chrome.tabs.Tab, style: HighlightStyleInfo) => {
  console.log('Send message to get highlightInfos')
  console.log(tab)
  if (tab.id && tab.url) {
    chrome.tabs.sendMessage(tab.id, {id: 'get_new_highlight_operations', payload: style}, (message: {highlightOperations: HighlightOperation[]}) => {
      console.log(message)
      getHighlightOperation(tab.url as string).then(oldHighlightOperations => {
        saveHighlightOperation(tab.url as string, oldHighlightOperations.concat(message.highlightOperations))
      })
    })
  }
}

const onMessageReceived = (message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void) => {

  if (message.id === 'fetch_all_highlight_operations' && sender.url) {
    getHighlightOperation(sender.url).then(highlightOperations => {
      console.log('send back all highlight operations')
      console.log(highlightOperations)
      sendResponse(highlightOperations)
    })
  }

  if (message.id === 'delete-highlight' && message.payload && sender.url) {
    const highlightId = message.payload as string
    getHighlightOperation(sender.url).then(highlightOperations => {
      saveHighlightOperation(sender.url as string, highlightOperations.concat({id: highlightId, ops: 'delete'}))
      sendResponse('success')
    })
  }

  if (message.id === 'refresh-context-menu') {
    createContextMenu().then(() => sendResponse('success'))
  }

  if (message.id === 'copy-as-string') {
    copyAsString(message.payload as string)
    sendResponse('success')
  }

  if (message.id === 'copy-as-markdown') {
    copyAsMarkdown(message.payload as string)
    sendResponse('success')
  }

  return true
}

const onContextMenuClicked = (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (tab && tab.id) {
    getHighlightStyles().then(styles => {
      styles.filter(s => `highlight-text-${s.id}` === info.menuItemId).forEach(s => {
        getHighlightInfoFromTab(tab, s)
      })
    })
  }
}

const createContextMenu = () => {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'highlight-text',
        title: 'Awesome Highlighter',
        contexts: ['selection'],
      }, () => {
        getHighlightStyles().then((styles: HighlightStyleInfo[]) => {
          styles.map(s => {
            chrome.contextMenus.create({
              id: `highlight-text-${s.id}`,
              title: s.label,
              parentId: 'highlight-text',
              contexts: ['selection'],
            })
          })
        }).then(() => resolve('success'))
      })
    })
  })
}

const initBackgroundScript = () => {
  console.log('background running');
  chrome.runtime.onInstalled.addListener(() => {
    createContextMenu()
  });

  chrome.runtime.onMessage.addListener(onMessageReceived)

  chrome.contextMenus.onClicked.addListener(onContextMenuClicked)

  getAvailableUrls().then(urls => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      console.log('regex')
      console.log(`^(${urls.join('|').replace(/\./gi, '\\.').replace(/\//gi, '\\/')})$`)
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {urlMatches: `^(${urls.join('|').replace(/\./gi, '\\.').replace(/\//gi, '\\/')})$`}
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }])
    })
  })
}

initBackgroundScript();
