import React, {useEffect, useReducer, useContext} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import {HighlightStyleInfo, OptionAppContext, OptionAppState, Message, defaultHighlightStyles, exportAllHighlightInfo, restoreHighlightInfo} from './types';
import HighlightStyleCollection from './component/HighlightStyleCollection';
import OptionItem from './component/OptionItem';
import AddButton from './component/AddButton';
import {v4 as uuidv4} from 'uuid';


const Body = styled.div`
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    `
const Content = styled.div`
    max-width: 1000px;
    width: 60%
`

const reducer = (prevState: OptionAppState, action: Message) => {
  switch (action.id) {
    case 'LOAD_STYLES':
      return {...prevState, styles: action.payload}
    case 'UPDATE_STYLE':
      const newStyle = action.payload as HighlightStyleInfo
      const index = prevState.styles.findIndex(e => e.id === newStyle.id)
      if (index < 0) {
        return {...prevState, styles: [...prevState.styles, newStyle]}
      } else {
        return {
          ...prevState,
          styles: [...prevState.styles.slice(0, index), newStyle, ...prevState.styles.slice(index + 1)]
        }
      }
    case 'DELETE_STYLE':
      const targetStyle = action.payload as HighlightStyleInfo
      return {
        ...prevState,
        styles: prevState.styles.filter(e => e.id !== targetStyle.id)
      }
    case 'NEW_STYLE':
      return {
        ...prevState,
        styles: [...prevState.styles, {
          id: uuidv4(),
          label: 'New Style',
          backgroundColor: '#FF0000',
          fontColor: '#FFFFFF',
          opacity: 1
        }]
      }
    case 'CURRENT_EDIT_STYLE':
      const currentEditStyle = action.payload as HighlightStyleInfo
      return {
        ...prevState,
        currentEditStyle: currentEditStyle
      }
    default:
      return prevState
  }
}


const App: React.FC = () => {
  const [state, dispatch] = useReducer<(prevState: OptionAppState, action: Message) => OptionAppState>(reducer, {
    styles: []
  })

  useEffect(() => {
    chrome.storage.local.get('HIGHLIGHT_STYLES', (item) => {
      if (chrome.runtime.lastError) {
        console.log(`error when get HIGHLIGHT_STYLES, error is ${chrome.runtime.lastError.toString()}`)
      } else {
        if (item['HIGHLIGHT_STYLES']) {
          dispatch({
            id: 'LOAD_STYLES',
            payload: item['HIGHLIGHT_STYLES']
          })
        } else {
          dispatch({
            id: 'LOAD_STYLES',
            payload: defaultHighlightStyles
          })
        }
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.local.set({'HIGHLIGHT_STYLES': state.styles}, () => {
      chrome.runtime.sendMessage({id: 'refresh-context-menu'})
    })
  }, [state.styles])

  return (
    <OptionAppContext.Provider value={{state, dispatch}}>
      <Body>
        <Content>
          <OptionItem title="Highlight Style">
            <HighlightStyleCollection />
            <AddButton customSize={32} onClick={() =>
              dispatch({id: 'NEW_STYLE'})
            } />
          </OptionItem>
          <OptionItem title="Backup & Restore">
            <button onClick={() => exportAllHighlightInfo()}>Export</button>
            <input type='file' accept='.json' onChange={(e) => e.target.files && restoreHighlightInfo(e.target.files[0])} />
          </OptionItem>
        </Content>
      </Body>
    </OptionAppContext.Provider>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

