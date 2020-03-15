import React from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo} from '../types'
import CloseButton from './CloseButton';


const Div = styled.div<HighlightStyleProps>`
width: auto;
height: 1rem;
padding: 1rem 1.5rem;
font-size: large;
background-color:${props => props.style.backgroundColor};
font-color:${props => props.style.fontColor};
opacity: ${props => props.style.opacity}
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
  style: HighlightStyleInfo;
}

const HighlightStyle = (props: HighlightStyleProps) => {
  return (<Div style={props.style}>
    {props.style.label}
    <CloseButtonDiv>
      <CloseButton customSize={32} onClick={() => console.log('click')} />
    </CloseButtonDiv>
  </Div>);
}

export default HighlightStyle;
