import {recoverHighlight, RangeIndex} from './types'

console.log('running content script')
chrome.runtime.sendMessage('fetch-highlight-ranges', (response: RangeIndex[]) => {
  console.log('got response')
  console.log(response)
  recoverHighlight(response)
})

