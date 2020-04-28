import {HighlightOperation, Message, HighlightStyleInfo, copyAsString, copyAsMarkdown, chromeStorage} from "./types"

const getHighlightInfoFromTab = (tab: chrome.tabs.Tab, style: HighlightStyleInfo) => {
  console.log('Send message to get highlightInfos')
  console.log(tab)
  if (tab.id && tab.url) {
    chrome.tabs.sendMessage(tab.id, {id: 'get_new_highlight_operations', payload: style}, (message: {highlightOperations: HighlightOperation[]}) => {
      console.log(message)
      if (chrome.runtime.lastError) {
        console.log(`failed to get new highlight for ${tab.url}`)
      }
      else {
        chromeStorage.appendHighlight(tab.url as string, message.highlightOperations)
      }
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
    if (info.menuItemId == 'browse-highlight') {
      chrome.tabs.create({url: chrome.runtime.getURL('browse_highlight.html')})
    } else {
      chromeStorage.getStyles().then(styles => {
        styles.filter(s => `highlight-text-${s.id}` === info.menuItemId).forEach(s => {
          getHighlightInfoFromTab(tab, s)
        })
      })
    }
  }
}

const onCommandTriggered = (command: string) => {
  if (command.startsWith('awesome-highlighter-create-highlight')) {
    const lastItem = command.split('-').pop()
    const styleIndex: number = lastItem ? +lastItem - 1 : -1
    chromeStorage.getStyles().then(styles => {
      if (styleIndex >= 0 && styleIndex < styles.length) {
        const style = styles[styleIndex]
        chrome.tabs.query({active: true, currentWindow: true}, (tabs: chrome.tabs.Tab[]) => {
          if (tabs[0]) {
            getHighlightInfoFromTab(tabs[0], style)
          }
        })
      }
    })
  }
}

const createContextMenu = () => {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'browse-highlight', title: 'Browse Highlight', contexts: ['page_action']
      })
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
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      chrome.declarativeContent.onPageChanged.addRules([
        {
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {schemes: ['http', 'https']}
            })
          ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
        }
      ]);
    });
  });

  chrome.runtime.onMessage.addListener(onMessageReceived)

  chrome.contextMenus.onClicked.addListener(onContextMenuClicked)

  chrome.commands.onCommand.addListener(onCommandTriggered);
}

initBackgroundScript();
