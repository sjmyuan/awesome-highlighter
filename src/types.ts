export const getHtmlSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.anchorNode) {
    const range = selection.getRangeAt(0);
    highlightRange(range)
  }
}

export const highlightRange = (range: Range) => {
  const treeWalker = document.createTreeWalker(range.commonAncestorContainer)
  while (treeWalker.nextNode()) {
    const currentNode = treeWalker.currentNode
    if (currentNode.nodeType == Node.TEXT_NODE && range.intersectsNode(currentNode)) {
      const div = document.createElement('div')
      div.style.background = 'yellow'
      div.style.width = 'fit-content'
      div.appendChild(currentNode.cloneNode())
      currentNode.parentNode.?.replaceChild(div, currentNode)
    }
  }
}
