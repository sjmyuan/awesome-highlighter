import {highlightSelection} from './types'

const highlightInfos = highlightSelection()

chrome.runtime.sendMessage(highlightInfos)
