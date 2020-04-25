import {HighlightOperation, Message, HighlightStyleInfo, copyAsString, copyAsMarkdown, chromeStorage} from "./types"

const showOrHidPageAction = (tab: chrome.tabs.Tab) => {
  return chromeStorage.getActiveHighlight(tab.url as string).then(highlights => {
    if (highlights.length > 0) {
      chrome.pageAction.show(tab.id as number)
    } else {
      chrome.pageAction.hide(tab.id as number)
    }
  })
}

const getHighlightInfoFromTab = (tab: chrome.tabs.Tab, style: HighlightStyleInfo) => {
  console.log('Send message to get highlightInfos')
  console.log(tab)
  if (tab.id && tab.url) {
    chrome.tabs.sendMessage(tab.id, {id: 'get_new_highlight_operations', payload: style}, (message: {highlightOperations: HighlightOperation[]}) => {
      console.log(message)
      chromeStorage.appendHighlight(tab.url as string, message.highlightOperations).then(() => {
        return showOrHidPageAction(tab)
      })
    })
  }
}

const onMessageReceived = (message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void) => {

  if (message.id === 'fetch_all_highlight_operations' && sender.url) {
    chromeStorage.getHighlight(sender.url).then(highlightOperations => {
      console.log('send back all highlight operations')
      console.log(highlightOperations)
      sendResponse(highlightOperations)
    })
  }

  if (message.id === 'delete-highlight' && message.payload && sender.url) {
    chromeStorage.appendHighlight(sender.url as string, [{id: message.payload as string, ops: 'delete'}]).then(() => {
      return showOrHidPageAction(sender.tab as chrome.tabs.Tab).then(() => {
        sendResponse('success')
      })
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
    chromeStorage.getStyles().then(styles => {
      styles.filter(s => `highlight-text-${s.id}` === info.menuItemId).forEach(s => {
        getHighlightInfoFromTab(tab, s)
      })
    })
  }
}

const onTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (tab.url) {
    showOrHidPageAction(tab)
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
        chromeStorage.getStyles().then((styles: HighlightStyleInfo[]) => {
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

  chrome.tabs.onUpdated.addListener(onTabUpdated)

  //chromeStorage.getHighlights().then(infos => {
  //const urls = infos.map(e => e[0])
  //chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
  //console.log('regex')
  //console.log(`^(${urls.join('|').replace(/\./gi, '\\.').replace(/\//gi, '\\/')})$`)
  //chrome.declarativeContent.onPageChanged.addRules([{
  //conditions: [
  //new chrome.declarativeContent.PageStateMatcher({
  //pageUrl: {urlMatches: `^(${urls.join('|').replace(/\./gi, '\\.').replace(/\//gi, '\\/')})$`}
  //})
  //],
  //actions: [new chrome.declarativeContent.ShowPageAction()]
  //}])
  //})
  //})
}

initBackgroundScript();
