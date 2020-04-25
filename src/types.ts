import {v4 as uuidv4} from 'uuid';
import {removeHighlight, renderNode} from './ui'
import React from 'react';
import TurndownServie from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import FileSaver from 'file-saver'

export interface RangeIndex {
  startNodeIndex: number,
  startOffset: number,
  startNodeContent: string | null,
  endNodeIndex: number,
  endOffset: number,
  endNodeContent: string | null
}

export interface HighlightInfo {
  id: string,
  styleId: string,
  url: string,
  title: string,
  highlightHTML: string,
  rangeIndex: RangeIndex
}

export interface HighlightOperation {
  id: string
  ops: 'create' | 'delete'
  info?: HighlightInfo
}

export interface Message {
  id: string
  payload?: any
}

export interface HighlightStyleInfo {
  id: string
  backgroundColor: string
  fontColor: string
  opacity: number
  label: string
}

export interface OptionAppState {
  styles: HighlightStyleInfo[]
  currentEditStyle?: HighlightStyleInfo
}

export const OptionAppContext = React.createContext<{state: OptionAppState, dispatch: (message: Message) => void}>(
  {state: {styles: []}, dispatch: (message: Message) => {}}
);

export const defaultHighlightStyles: HighlightStyleInfo[] = [{
  id: '1',
  label: 'Red',
  backgroundColor: '#FF0000',
  fontColor: '#000000',
  opacity: 1
},
{
  id: '2',
  label: 'Green',
  backgroundColor: '#00FF00',
  fontColor: '#000000',
  opacity: 1
},
{
  id: '3',
  label: 'Blue',
  backgroundColor: '#0000FF',
  fontColor: '#000000',
  opacity: 1
}]

export const getRangeContent = (range: Range) => {
  const div = document.createElement("div");
  div.appendChild(range.cloneContents());
  const highlightHTML = div.innerHTML;
  return highlightHTML
}

export const generateHighlightInfo = (range: Range, id: string, styleId: string) => {
  const rangeIndex = generateRangeIndex(range)
  const highlightHTML = getRangeContent(range)
  return {id: id, styleId: styleId, url: document.documentURI, title: document.title, rangeIndex: rangeIndex, highlightHTML: highlightHTML}
}

export const highlightSelection = (style: HighlightStyleInfo) => {
  const selection = window.getSelection()
  const highlightInfos: HighlightInfo[] = []
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index++) {
      const range = selection.getRangeAt(index)
      const id = uuidv4()
      highlightInfos.push(generateHighlightInfo(range, id, style.id))
      highlightRange(range, id, style)
    }
  }

  return highlightInfos
}

export const findIndexOfNode = (node: Node) => {

  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let index = 0
  while (treeWalker.nextNode()) {
    if (treeWalker.currentNode.textContent === node.textContent) {
      if (node.isSameNode(treeWalker.currentNode)) {
        return index
      }
      index++
    }
  }

  console.log('not found node index')
  console.log(node)

  return -1
}

export const findNodeByIndex = (index: number, content: string | null) => {
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let localIndex = 0
  while (treeWalker.nextNode()) {
    if (treeWalker.currentNode.textContent === content) {
      if (localIndex == index) {
        return treeWalker.currentNode
      }
      localIndex++
    }
  }

  console.log(`not found node ${index}`)

  return undefined
}

export const generateRangeIndex = (range: Range) => {
  console.log('range-----')
  console.log(range)
  return {
    startNodeIndex: findIndexOfNode(range.startContainer),
    startOffset: range.startOffset,
    startNodeContent: range.startContainer.textContent,
    endNodeIndex: findIndexOfNode(range.endContainer),
    endOffset: range.endOffset,
    endNodeContent: range.endContainer.textContent
  }
}

export const recoverRange = (rangeIndex: RangeIndex) => {
  const startNode = findNodeByIndex(rangeIndex.startNodeIndex, rangeIndex.startNodeContent)
  const endNode = findNodeByIndex(rangeIndex.endNodeIndex, rangeIndex.endNodeContent)
  if (startNode && endNode) {
    const range = document.createRange()
    range.setStart(startNode, rangeIndex.startOffset)
    range.setEnd(endNode, rangeIndex.endOffset)
    return range
  } else {
    return undefined
  }
}

export const recoverHighlight = (id: string, info: HighlightInfo, style?: HighlightStyleInfo) => {
  const range = recoverRange(info.rangeIndex)
  console.log('range:' + id)
  console.log(range)
  if (range) {
    highlightRange(range, id, style)
  }
}

export const replayOptions = (opsList: HighlightOperation[], styles: HighlightStyleInfo[]) => {
  opsList.forEach(o => {
    if (o.ops === "create") {
      const info = o.info
      if (info) {
        const style = styles.find(e => e.id === info.styleId)
        recoverHighlight(o.id, info, style)
      }
    } else {
      removeHighlight(o.id)
    }
  })
}

export const highlightNode = (node: Text, id: string, range: Range, style?: HighlightStyleInfo) => {
  let isStartNode: boolean = node.isSameNode(range.startContainer)
  let isEndNode: boolean = node.isSameNode(range.endContainer)

  if (isStartNode && isEndNode) {
    // -----------------
    //     start   end
    //      |      |
    // first second thrid

    const first = node
    const second = first.splitText(range.startOffset)
    const third = second.splitText(range.endOffset)
    renderNode(second, id, true, style)
  } else if (isStartNode) {
    // -----------------
    //     start
    //      |
    // first second

    const first = node
    const second = first.splitText(range.startOffset)
    renderNode(second, id, true, style)
  } else if (isEndNode) {
    // -----------------
    //     end
    //      |
    // first second

    const first = node
    const second = first.splitText(range.endOffset)
    renderNode(first, id, false, style)
  } else {
    renderNode(node, id, false, style)
  }
}

export const highlightRange = (range: Range, id: string, style?: HighlightStyleInfo) => {
  const root = range.commonAncestorContainer
  const textNodes: Text[] = []
  if (root.hasChildNodes()) {
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (treeWalker.nextNode()) {
      const currentNode: Node = treeWalker.currentNode
      if (range.intersectsNode(currentNode)) {
        textNodes.push(currentNode as Text)
      }
    }
  } else if (root.nodeType === Node.TEXT_NODE) {
    textNodes.push(root as Text)
  } else {
    console.log('Can not process this range, the root dom is')
    console.log(root)
  }

  console.log(textNodes)
  for (let index = 0; index < textNodes.length; index++) {
    const currentNode = textNodes[index];
    if (currentNode.textContent && currentNode.textContent.trim().length > 0) {
      highlightNode(currentNode, id, range, style)
    }
  }
}

export const copyAsString = (html: string) => {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.value = htmlToString(html)
  input.focus()
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

export const turndownServie = new TurndownServie({headingStyle: 'atx', codeBlockStyle: 'fenced'});
turndownServie.use(gfm)

export const copyAsMarkdown = (html: string) => {
  const markdown = turndownServie.turndown(html)
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.value = markdown
  input.focus()
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

export const htmlToString = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html
  return div.textContent as string
}

export const saveStringToFile = (first: HighlightInfo, others: HighlightInfo[]) => {
  const content = [first, ...others].map(info => htmlToString(info.highlightHTML)).join("\n\n")
  const title = first.title.replace(' ', '-')
  const blob = new Blob([content], {type: 'text/plain;charset=utf-8'})
  FileSaver.saveAs(blob, `${title}.txt`);
}

export const saveMarkdownToFile = (first: HighlightInfo, others: HighlightInfo[]) => {
  const content = [first, ...others].map(info => turndownServie.turndown(info.highlightHTML)).join("\n\n")
  const title = first.title.replace(' ', '-')
  const blob = new Blob([content], {type: 'text/plain;charset=utf-8'})
  FileSaver.saveAs(blob, `${title}.md`);
}

export const getAvailableUrls = () => {
  return new Promise<string[]>((resolve, reject) => {
    chrome.storage.local.get((items) => {
      resolve(Object.keys(items).filter(e => e.startsWith('http') || e.startsWith('https')))
    })
  })
}

export class MOption<A> {
  value: A | undefined
  constructor(v: A | undefined) {
    this.value = v
  }
  map<B>(f: (v: A) => B): MOption<B> {
    return !!this.value ? new MOption<B>(f(this.value)) : new MOption<B>(undefined)
  }
  flatMap<B>(f: (v: A) => MOption<B>): MOption<B> {
    return !!this.value ? f(this.value) : new MOption<B>(undefined)
  }
  getOrElse(v: A): A {
    return !!this.value ? this.value : v
  }
}

export interface MStorage {
  getStyles: () => Promise<HighlightStyleInfo[]>
  saveStyles: (styles: HighlightStyleInfo[]) => Promise<void>
  appendStyles: (styles: HighlightStyleInfo[]) => Promise<void>
  getHighlights: () => Promise<[string, HighlightOperation[]][]>
  getHighlight: (key: string) => Promise<HighlightOperation[]>
  saveHighlight: (key: string, info: HighlightOperation[]) => Promise<void>
  appendHighlight: (key: string, info: HighlightOperation[]) => Promise<void>
  saveHighlights: (highlights: [string, HighlightOperation[]][]) => Promise<void>
  exportConfiguration: () => Promise<void>
  importConfiguration: (file?: File) => Promise<void>
}

export const chromeStorage: MStorage = {
  getStyles: () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('HIGHLIGHT_STYLES', (item) => {
        if (chrome.runtime.lastError) {
          reject(`error when get HIGHLIGHT_STYLES, error is ${chrome.runtime.lastError.toString()}`)
        } else {
          if (item['HIGHLIGHT_STYLES']) {
            resolve(item['HIGHLIGHT_STYLES'])
          } else {
            resolve(defaultHighlightStyles)
          }
        }
      })
    })
  },
  saveStyles: (styles: HighlightStyleInfo[]) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({'HIGHLIGHT_STYLES': styles}, () => {
        if (chrome.runtime.lastError) {
          reject(`failed to save the highlight styles, error is ${chrome.runtime.lastError.toString()}`)
        } else {
          resolve()
        }
      })
    })
  },
  appendStyles: (styles: HighlightStyleInfo[]) => {
    return chromeStorage.getStyles().then(oldStyles => {
      return chromeStorage.saveStyles([...oldStyles, ...styles])
    })
  },
  getHighlights: () => {
    return new Promise<[string, HighlightOperation[]][]>((resolve, reject) => {
      chrome.storage.local.get((items) => {
        resolve(Object.keys(items).filter(e => e.startsWith('http') || e.startsWith('https'))
          .map(k => ([k, items[k] as HighlightOperation[]])))
      })
    })
  },
  getHighlight: (key: string) => {
    return new Promise<HighlightOperation[]>((resolve, reject) => {
      chrome.storage.local.get((items) => {
        if (Object.keys(items).find(e => e === key)) {
          resolve(items[key] as HighlightOperation[])
        } else {
          reject(`Can't find highlight ${key}`)
        }
      })
    })
  },
  saveHighlight: (key: string, info: HighlightOperation[]) => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({[key]: info}, () => {
        if (chrome.runtime.lastError) {
          reject(`failed to save the highlight info for ${key}, error is ${chrome.runtime.lastError.toString()}`)
        } else {
          resolve()
        }
      })
    })
  },
  appendHighlight: (key: string, info: HighlightOperation[]) => {
    return chromeStorage.getHighlight(key).then(oldInfo => {
      return chromeStorage.saveHighlight(key, [...oldInfo, ...info])
    })
  },
  saveHighlights: (highlights: [string, HighlightOperation[]][]) => {
    return new Promise<void>((resolve, reject) => {
      const info: {[key: string]: HighlightOperation[];} = {}
      highlights.forEach(([key, value]) => {info[key] = value})
      chrome.storage.local.set(info, () => {
        if (chrome.runtime.lastError) {
          reject(`failed to save the highlight info, error is ${chrome.runtime.lastError.toString()}`)
        } else {
          resolve()
        }
      })
    })
  },
  exportConfiguration: () => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.get((items) => {
        if (chrome.runtime.lastError) {
          reject(`failed to get all configuration, error is ${chrome.runtime.lastError.toString()}`)
        } else {
          const blob = new Blob([JSON.stringify(items)], {type: 'application/json;charset=utf-8'})
          FileSaver.saveAs(blob, 'awesome-highlighter.json');
          resolve()
        }
      })
    })
  },
  importConfiguration: (file?: File) => {
    return new Promise<void>((resolve, reject) => {
      if (file) {
        const fileReader = new FileReader()
        fileReader.onloadend = () => {
          if (fileReader.result) {
            const infos = JSON.parse(fileReader.result as string)
            chrome.storage.local.set(infos, () => {
              if (chrome.runtime.lastError) {
                reject(`failed to import configuration, error is ${chrome.runtime.lastError.toString()}`)
              } else {
                resolve()
              }
            })
          }
        }
        fileReader.readAsText(file)
      } else {
        reject('there is no file to import')
      }
    })
  }
}

export const getActiveHighlightOps = (ops: HighlightOperation[]) => {
  return ops.reduce<HighlightOperation[]>((acc: HighlightOperation[], ele: HighlightOperation) => {
    if (ele.ops === 'delete') {
      return acc.filter(e => e.id !== ele.id)
    } else {
      return [...acc, ele]
    }
  }, [])
}

export const deleteHighlightWithoutStyle = () => {
  return chromeStorage.getStyles().then(styles => {
    return chromeStorage.getHighlights().then(highlights => {
      return Promise.all(
        highlights.map(([key, highlightOps]) => {
          const highlightOpsForInvalid: HighlightOperation[] = getActiveHighlightOps(highlightOps)
            .filter(h => styles.findIndex(s => h.info && (s.id === h.info.styleId)) < 0)
            .map(h => ({id: h.id, ops: 'delete'}))
          if (highlightOpsForInvalid.length === 0) {
            return Promise.resolve()
          } else {
            return chromeStorage.saveHighlight(key, [...highlightOps, ...highlightOpsForInvalid])
          }

        })
      )
    })
  })
}
