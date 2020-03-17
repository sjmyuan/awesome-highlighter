import {HighlightStyleInfo} from "./types"

export const createButton: (x: number, y: number) => HTMLElement =
  (x: number, y: number) => {
    const button = document.createElement('a')
    button.classList.add('awesome-highlighter-button')
    button.style.left = `${x}px`
    button.style.top = `${y}px`
    return button
  }

export const removeHighlight = (id: string) => {
  console.log('removing highlight: ' + id)
  const nodes = document.getElementsByClassName(`awesome-highlighter-${id}`)
  console.log(nodes)

  for (let index = 0; index < nodes.length; index++) {
    unrenderNode(nodes[index], id)
  }

  while (nodes.length > 0) {
    nodes[0].remove()
  }
}

export const showDeleteButton = (element: HTMLElement, id: string) => {
  return (event: MouseEvent) => {
    const startNode = document.getElementsByClassName(`awesome-highlighter-${id}-starter`).item(0)
    if (startNode) {
      const clientRect = startNode.getClientRects()[0]
      const button = createButton(clientRect.left + window.scrollX - 8, clientRect.top + window.scrollY - 8)
      button.onclick = (event: MouseEvent) => {
        removeHighlight(id)
        button.remove()
        chrome.runtime.sendMessage({id: 'delete-highlight', payload: id})
      }
      startNode.appendChild(button)
    }


    return true as any
  }
}

export const removeDeleteButton = (element: HTMLElement) => {
  return (event: MouseEvent) => {
    const buttons = document.getElementsByClassName(`awesome-highlighter-button`)
    while (buttons.length > 0) {
      buttons[0].remove()
    }
    return true as any
  }
}

export const renderNode = (node: Text, id: string, isStarter: boolean, style: HighlightStyleInfo) => {
  const parentNode = node.parentNode
  if (parentNode) {
    const mark = document.createElement('mark')
    mark.classList.add(`awesome-highlighter-${id}`)
    isStarter && mark.classList.add(`awesome-highlighter-${id}-starter`)
    mark.setAttribute('data-highlight-id', id)
    mark.style.backgroundColor = style.backgroundColor
    mark.style.color = style.fontColor
    mark.style.opacity = style.opacity.toString()
    mark.appendChild(node.cloneNode())
    mark.onmouseenter = showDeleteButton(mark, id)
    mark.onmouseleave = removeDeleteButton(mark)
    parentNode.replaceChild(mark, node)
  }
}

export const unrenderNode = (node: Element, id: string) => {
  if (node.tagName.toUpperCase() === 'MARK' && node.getAttribute('data-highlight-id') === id) {
    console.log('unrendering')
    console.log(node)
    const parentNode = node.parentNode
    if (parentNode) {
      while (node.firstChild) {
        parentNode.insertBefore(node.firstChild, node)
      }
      console.log('unrendered')
    }
  }
}
