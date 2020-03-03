export const getHtmlSelection: () => string | undefined = () => {
  const selection = window.getSelection()
  if (selection && selection.anchorNode) {
    const range = selection.getRangeAt(0);
    const div = document.createElement("div");
    div.appendChild(range.cloneContents());
    return div.innerHTML;
  } else {
    return undefined
  }
}
