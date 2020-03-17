import React, {useContext} from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo, OptionAppContext} from '../types'
import HighlightStyle from './HighlightStyle'
import HighlightStyleEditor from './HighlightStyleEditor';

const Ul = styled.ul`
width: auto;
height: auto;
list-style: none;
padding: 0px;
`

const Li = styled.li`
margin-bottom: 16px;
`

const HighlightStyleCollection = () => {
  const context = useContext(OptionAppContext)
  return (<Ul>{context.state.styles.map(s => {
    if (context.state.currentEditStyle && context.state.currentEditStyle.id === s.id) {
      return (
        <Li>
          <HighlightStyle key={`style-${s.id}`} style={s} onDelete={(style: HighlightStyleInfo) => {
            context.dispatch({id: 'DELETE_STYLE', payload: style})
          }} />
          <HighlightStyleEditor key={`editor-${s.id}`} style={s} onChange={(style: HighlightStyleInfo) => {
            context.dispatch({id: 'UPDATE_STYLE', payload: style})
          }} />
        </Li>
      )
    } else {
      return (
        <Li>
          <HighlightStyle key={`style-${s.id}`} style={s} onDelete={(style: HighlightStyleInfo) => {
            context.dispatch({id: 'DELETE_STYLE', payload: style})
          }} />
        </Li>
      )
    }
  })}
  </Ul>);
}

export default HighlightStyleCollection;
