import React, {useEffect, useReducer, useContext} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import {HighlightStyleInfo, OptionAppContext, OptionAppState, Message, deleteHighlightWithoutStyle, chromeStorage} from './types';
import HighlightStyleCollection from './component/HighlightStyleCollection';
import OptionItem from './component/OptionItem';
import AddButton from './component/AddButton';
import {v4 as uuidv4} from 'uuid';
import Header from './component/Header';


const Body = styled.div`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f6f6f6;
    `
const Content = styled.div`
    max-width: 1000px;
    width: 60%
`

const Div = styled.div`
margin: 10px;
`

const reducer = (prevState: OptionAppState, action: Message) => {
  switch (action.id) {
    case 'REFRESH':
      return {...prevState, loaded: false}
    case 'LOAD_STYLES':
      return {...prevState, loaded: true, styles: action.payload}
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
          fontColor: '#000000',
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
    loaded: false,
    styles: []
  })

  useEffect(() => {
    if (!state.loaded) {
      chromeStorage.getStyles().then(item => {
        dispatch({
          id: 'LOAD_STYLES',
          payload: item
        })
      })
    }
  }, [state.loaded])

  useEffect(() => {
    if (state.loaded) {
      chromeStorage.saveStyles(state.styles).then(() => {
        return deleteHighlightWithoutStyle()
      })
    }
  }, [state.styles])

  return (
    <OptionAppContext.Provider value={{state, dispatch}}>
      <Body>
        <Header/>
        <Content>
          <OptionItem title="Highlight Style">
            <HighlightStyleCollection />
            <AddButton customSize={32} onClick={() =>
              dispatch({id: 'NEW_STYLE'})
            } />
          </OptionItem>
          <OptionItem title="Backup & Restore">
            <Div>
              <h2>Backup</h2>
              <p>Export all the configuration and highlight information to a file</p>
              <button onClick={() => chromeStorage.exportConfiguration()}>Export</button>
            </Div>
            <Div>
              <h2>Restore</h2>
              <p>Restore the configuration and highlight information from a file which was exported before</p>
              <label>Select a file: </label>
              <input type='file' accept='.json' onChange={(e) => {
                e.target.files && chromeStorage.importConfiguration(e.target.files[0]).then(() => {
                  dispatch({id: 'REFRESH'})
                })
              }} />
            </Div>
          </OptionItem>
        </Content>
      </Body>
    </OptionAppContext.Provider>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

