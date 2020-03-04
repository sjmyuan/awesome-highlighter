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
  const textNodes = []
  if (root.hasChildNodes()) {
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (treeWalker.nextNode()) {
      const currentNode: Node = treeWalker.currentNode
      if (range.intersectsNode(currentNode)) {
        textNodes.push(currentNode)
      }
    }
  } else if (root.nodeType === Node.TEXT_NODE) {
    textNodes.push(root)
  } else {
    console.log('Can not process this range, the root dom is')
    console.log(root)
  }

  console.log(textNodes)
  for (let index = 0; index < textNodes.length; index++) {
    const currentNode = textNodes[index];
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
