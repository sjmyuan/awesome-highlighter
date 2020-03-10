import {v4 as uuidv4} from 'uuid';

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
  url: string,
  title: string,
  highlightHTML: string,
  rangeIndex: RangeIndex
}

const HighlightNodeFilter: NodeFilter = {
  acceptNode(node: Node): number {
    const parentElement = node.parentElement
    if (parentElement && parentElement.classList.contains('awesome-highlighter-rendered')) {
      return 0
    } else {
      return 1
    }
  }
}


export const getHighlightInfo: (url: string) => Promise<HighlightInfo[]> = (url: string) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(url, (item) => {
      if (chrome.runtime.lastError) {
        reject(`error when get ${url}, error is ${chrome.runtime.lastError.toString()}`)
      } else {
        if (item[url]) {
          resolve(item[url])
        } else {resolve([])}
      }
    })
  })
}

export const saveHighlightInfo: (url: string, infos: HighlightInfo[]) => Promise<void> = (url: string, infos: HighlightInfo[]) => {
  return new Promise((resolve, reject) => {
    const obj: {[key: string]: HighlightInfo[];} = {}
    obj[url] = infos
    chrome.storage.local.set(obj, () => {
      if (chrome.runtime.lastError) {
        reject(`error when set highlight_information, error is ${chrome.runtime.lastError.toString()}`)
      } else {
        resolve()
      }
    })
  })
}

export const getRangeContent = (range: Range) => {
  const div = document.createElement("div");
  div.appendChild(range.cloneContents());
  const highlightHTML = div.innerHTML;
  return highlightHTML
}

export const generateHighlightInfo = (range: Range, id: string) => {
  const rangeIndex = generateRangeIndex(range)
  const highlightHTML = getRangeContent(range)
  return {id: id, url: document.documentURI, title: document.title, rangeIndex: rangeIndex, highlightHTML: highlightHTML}
}

export const highlightSelection = () => {
  const selection = window.getSelection()
  const highlightInfos: HighlightInfo[] = []
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index++) {
      const range = selection.getRangeAt(index)
      const id = uuidv4()
      highlightInfos.push(generateHighlightInfo(range, id))
      highlightRange(range, id)
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

export const recoverHighlight = (highlightInfos: HighlightInfo[]) => {
  highlightInfos.forEach(info => {
    const range = recoverRange(info.rangeIndex)
    console.log('range:' + info.id)
    console.log(range)
    if (range) {
      highlightRange(range, info.id)
    }
  })
}

export const markNode = (node: Text, className: string, id: string) => {
  const parentNode = node.parentNode
  if (parentNode) {
    const mark = document.createElement('mark')
    mark.classList.add(className)
    mark.style.backgroundColor = 'yellow'
    mark.setAttribute('data-highlight-id', id)
    mark.appendChild(node.cloneNode())
    parentNode.replaceChild(mark, node)
  }
}

export const unmarkNode = (node: HTMLElement) => {
  if (node.tagName === 'mark' && node.getAttribute('data-highlight-id')) {
    const parentNode = node.parentNode
    if (parentNode) {
      const childNodes = node.childNodes
      if (childNodes.length > 0) {
        childNodes.forEach(c => {
          parentNode.insertBefore(c, node)
        })
        parentNode.removeChild(node)
      }
    }
  }
}

export const splitIfNecessary = (node: Text, range: Range) => {
  let isStartNode: boolean = node.isSameNode(range.startContainer)
  let isEndNode: boolean = node.isSameNode(range.endContainer)

  console.log('split_if_necessary')

  console.log(node)

  if (isStartNode && isEndNode) {
    // -----------------
    //     start   end
    //      |      |
    // first second thrid

    console.log('same start and end')
    const first = node
    const second = first.splitText(range.startOffset)
    const third = second.splitText(range.endOffset)
    return second
  } else if (isStartNode) {
    // -----------------
    //     start
    //      |
    // first second

    console.log('start')
    const first = node
    const second = first.splitText(range.startOffset)
    return second
  } else if (isEndNode) {
    // -----------------
    //     end
    //      |
    // first second

    console.log('end')

    const first = node
    const second = first.splitText(range.endOffset)
    return first
  } else {
    console.log('inner')

    return node
  }
}

export const highlightRange = (range: Range, id: string) => {
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
    const splitedNode: Text = splitIfNecessary(currentNode, range)
    if (splitedNode.textContent && splitedNode.textContent.trim().length > 0) {
      markNode(splitedNode, 'awesome-highlighter', id)
    }
  }
}
