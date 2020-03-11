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

export interface HighlightOperation {
  id: string
  ops: 'create' | 'delete'
  info?: HighlightInfo
}

export const getHighlightOperation: (url: string) => Promise<HighlightOperation[]> = (url: string) => {
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

export const saveHighlightOperation: (url: string, ops: HighlightOperation[]) => Promise<void> = (url: string, ops: HighlightOperation[]) => {
  return new Promise((resolve, reject) => {
    const obj: {[key: string]: HighlightOperation[];} = {}
    obj[url] = ops
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

export const recoverHighlight = (id: string, info: HighlightInfo) => {
  const range = recoverRange(info.rangeIndex)
  console.log('range:' + id)
  console.log(range)
  if (range) {
    highlightRange(range, id)
  }
}

export const markNode = (node: Text, id: string) => {
  const parentNode = node.parentNode
  if (parentNode) {
    const mark = document.createElement('mark')
    mark.classList.add(`awesome-highlighter-${id}`)
    mark.style.backgroundColor = 'yellow'
    mark.appendChild(node.cloneNode())
    parentNode.replaceChild(mark, node)
  }
}

export const unmarkNode = (node: Element) => {
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

export const replayOptions = (opsList: HighlightOperation[]) => {
  opsList.forEach(o => {
    if (o.ops === "create") {
      if (o.info) {
        recoverHighlight(o.id, o.info)
      }
    } else {
      deleteHighlight(o.id)
    }
  })
}

export const deleteHighlight = (id: string) => {
  const nodes = document.getElementsByClassName(`awesome-highlighter-${id}`)

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes.item(index)
    if (node) {
      unmarkNode(node)
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
      markNode(splitedNode, id)
    }
  }
}
