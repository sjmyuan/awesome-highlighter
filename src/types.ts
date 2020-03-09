export interface RangeIndex {
  startNodeIndex: number,
  startOffset: number,
  startNodeContent: string | null,
  endNodeIndex: number,
  endOffset: number,
  endNodeContent: string | null
}

export interface HighlightInfo {
  url: string,
  title: string,
  highlightHTML: string,
  rangeIndex: RangeIndex
}

const HighlightNodeFilter: NodeFilter = {
  acceptNode(node: Node): number {
    return node.textContent && node.textContent.trim() !== "" ? 1 : 0
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

export const mergeHighlightInfo = (info1: HighlightInfo, info2: HighlightInfo) => {
  const range1 = recoverRange(info1.rangeIndex)
  const range2 = recoverRange(info2.rangeIndex)
  if (range1 && range2) {
    if (range1.intersectsNode(range2.startContainer) && range1.intersectsNode(range2.endContainer)) {
      return [info1]
    } else if (range1.intersectsNode(range2.startContainer)) {
      const newRange = document.createRange()
      newRange.setStart(range1.startContainer, range1.startOffset)
      newRange.setEnd(range2.endContainer, range2.endOffset)
      return [generateHighlightInfo(newRange)]
    } else if (range1.intersectsNode(range2.endContainer)) {
      const newRange = document.createRange()
      newRange.setStart(range2.startContainer, range2.startOffset)
      newRange.setEnd(range1.endContainer, range1.endOffset)
      return [generateHighlightInfo(newRange)]
    } else if (range2.intersectsNode(range1.startContainer)) {
      return [info2]
    } else {
      return [info1, info2]
    }
  } else if (range1) {
    return [info1]
  } else {
    return [info2]
  }
}

export const generateHighlightInfo = (range: Range) => {
  const rangeIndex = generateRangeIndex(range)
  const highlightHTML = getRangeContent(range)
  return {url: document.documentURI, title: document.title, rangeIndex: rangeIndex, highlightHTML: highlightHTML}
}

export const highlightSelection = (historicalHighlightInfos: HighlightInfo[]) => {
  const selection = window.getSelection()
  const highlightInfos: HighlightInfo[] = []
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index++) {
      const range = selection.getRangeAt(index)
      const highlightInfo = generateHighlightInfo(range)

      highlightRange(range)
      highlightInfos.push(generateHighlightInfo(range))
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

  return -1
}

export const findNodeByIndex = (index: number, content: string | null) => {
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, HighlightNodeFilter)
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
  return {
    startNodeIndex: findIndexOfNode(range.startContainer),
    startOffset: range.startOffset,
    startNodeContent: range.startContainer.textContent,
    endNodeIndex: findIndexOfNode(range.endContainer),
    endOffset: range.endOffset,
    endNodeContent: range.startContainer.textContent
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
  const ranges = highlightInfos.map(info => recoverRange(info.rangeIndex))
  console.log('ranges')
  console.log(ranges)
  ranges.forEach(range => range && highlightRange(range))
}

export const splitIfNecessary = (node: Text, range: Range) => {
  let isStartNode: boolean = node.isSameNode(range.startContainer)
  let isEndNode: boolean = node.isSameNode(range.endContainer)

  if (isStartNode && isEndNode) {
    const remainingNode = node.splitText(range.startOffset)
    remainingNode.splitText(range.endOffset)
    return remainingNode
  } else if (isStartNode) {
    return node.splitText(range.startOffset)
  } else if (isEndNode) {
    node.splitText(range.endOffset)
    return node
  } else {
    return node
  }
}

export const highlightRange = (range: Range) => {
  const root = range.commonAncestorContainer
  const textNodes: Node[] = []
  if (root.hasChildNodes()) {
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (treeWalker.nextNode()) {
      const currentNode: Node = treeWalker.currentNode
      if (range.intersectsNode(currentNode)) {
        textNodes.push(splitIfNecessary(currentNode as Text, range))
      }
    }
  } else if (root.nodeType === Node.TEXT_NODE) {
    textNodes.push(splitIfNecessary(root as Text, range))
  } else {
    console.log('Can not process this range, the root dom is')
    console.log(root)
  }

  console.log(textNodes)
  for (let index = 0; index < textNodes.length; index++) {
    const currentNode = textNodes[index];
    if (currentNode) {
      const currentParent = currentNode.parentNode
      if (currentNode.textContent && currentNode.textContent.trim().length > 0) {
        console.log(currentNode)
        console.log(currentParent)
        console.log('----')
        const div = document.createElement('a')
        div.style.background = 'yellow'
        div.style.width = 'fit-content'
        div.appendChild(currentNode.cloneNode())
        currentParent?.replaceChild(div, currentNode)
      }
    }
  }
}
