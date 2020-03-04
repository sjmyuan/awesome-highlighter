export const highlightSelection = () => {
  const selection = window.getSelection()
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index++) {
      highlightRange(selection.getRangeAt(index))
    }
  }
}

export const highlightRange = (range: Range) => {
  const root = range.commonAncestorContainer
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (treeWalker.nextNode()) {
    const currentNode: Node = treeWalker.currentNode
    if (currentNode.nodeType == Node.TEXT_NODE && range.intersectsNode(currentNode)) {
      textNodes.push(currentNode)
    }
  }

  console.log(textNodes)
  for (let index = 0; index < textNodes.length; index++) {
    const currentNode = textNodes[index];
    const currentParent = currentNode.parentNode
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
