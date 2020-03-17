import React, {useEffect, useReducer, useContext} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import {HighlightStyleInfo, OptionAppContext, OptionAppState, Message} from './types';
import HighlightStyleCollection from './component/HighlightStyleCollection';
import OptionItem from './component/OptionItem';


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
    dispatch({
      id: 'LOAD_STYLES',
      payload: [{
        id: '1',
        label: 'Red',
        backgroundColor: 'red',
        fontColor: 'black',
        opacity: 1
      },
      {
        id: '2',
        label: 'Yellow',
        backgroundColor: 'yellow',
        fontColor: 'black',
        opacity: 1
      }]
    })
  }, [])

  return (
    <OptionAppContext.Provider value={{state, dispatch}}>
      <Body>
        <Content>
          <OptionItem title="Highlight Style">
            <HighlightStyleCollection />
          </OptionItem>
        </Content>
      </Body>
    </OptionAppContext.Provider>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

