export interface RangeIndex {
  startNodeIndex: number,
  startOffset: number,
  endNodeIndex: number,
  endOffset: number
}

export const highlightSelection = () => {
  const selection = window.getSelection()
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index++) {
      highlightRange(selection.getRangeAt(index))
    }
  }
}

export const findIndexOfNode = (node: Node) => {
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let index = 0
  while (treeWalker.nextNode()) {
    if (node.isSameNode(treeWalker.currentNode)) {
      return index
    }
    index++
  }

  return -1
}

export const findNodeByIndex = (index: number) => {
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let localIndex = 0
  while (treeWalker.nextNode()) {
    if (localIndex == index) {
      return treeWalker.currentNode
    }
    localIndex++
  }

  return undefined
}

export const generateRangeIndex = (range: Range) => {
  return {
    startNodeIndex: findIndexOfNode(range.startContainer),
    startOffset: range.startOffset,
    endNodeIndex: findIndexOfNode(range.endContainer),
    endOffset: range.endOffset
  }
}

export const recoverRange = (rangeIndex: RangeIndex) => {
  const startNode = findNodeByIndex(rangeIndex.startNodeIndex)
  const endNode = findNodeByIndex(rangeIndex.endNodeIndex)
  if (startNode && endNode) {
    const range = document.createRange()
    range.setStart(startNode, rangeIndex.startOffset)
    range.setEnd(endNode, rangeIndex.endOffset)
    return range
  } else {
    return undefined
  }
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

export const highlightRange = (mrange: Range) => {
  const rangeIndex = generateRangeIndex(mrange)
  const range = recoverRange(rangeIndex)
  if (!range) {
    console.log('no range')
    return
  }

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
