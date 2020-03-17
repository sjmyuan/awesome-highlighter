import React, {useContext} from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo, OptionAppContext} from '../types'
import CloseButton from './CloseButton';


const Div = styled.div<{style: HighlightStyleInfo}>`
width: auto;
height: 1rem;
padding: 1rem 1.5rem;
font-size: large;
background-color:${props => props.style.backgroundColor};
color:${props => props.style.fontColor};
opacity: ${props => props.style.opacity};
border: 2px solid;
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
`

const CloseButtonDiv = styled.div`
width: 32px;
height: 32px;
`

interface HighlightStyleProps {
  style: HighlightStyleInfo
  onDelete: (style: HighlightStyleInfo) => void
}

const HighlightStyle = (props: HighlightStyleProps) => {
  const context = useContext(OptionAppContext)
  return (<Div style={props.style} onClick={() => {
    if (context.state.currentEditStyle && context.state.currentEditStyle.id === props.style.id) {
      context.dispatch({id: 'CURRENT_EDIT_STYLE'})
    } else {
      context.dispatch({id: 'CURRENT_EDIT_STYLE', payload: props.style})
    }
  }}>
    <p>{props.style.label}</p>
    <CloseButtonDiv>
      <CloseButton customSize={32} onClick={() => props.onDelete(props.style)} />
    </CloseButtonDiv>
  </Div>);
}

export default HighlightStyle;
