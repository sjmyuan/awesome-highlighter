import React from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo} from '../types'


const Div = styled.div<HighlightStyleProps>`
width: auto;
height: 1rem;
padding: 1rem 1.5rem;
font-size: large;
background-color:${props => props.style.backgroundColor};
font-color:${props => props.style.fontColor};
border: 2px solid;
margin-bottom: 16px;
`

interface HighlightStyleProps {
  style: HighlightStyleInfo;
}

const HighlightStyle = (props: HighlightStyleProps) => {
  return (<Div style={props.style}>{props.style.label}</Div>);
}

export default HighlightStyle;
