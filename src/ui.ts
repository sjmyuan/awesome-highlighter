export const createButton: (x: number, y: number) => HTMLElement =
  (x: number, y: number) => {
    const button = document.createElement('a')
    button.classList.add('awesome-highlighter-button')
    button.style.left = `${x}px`
    button.style.top = `${y}px`
    return button
  }

