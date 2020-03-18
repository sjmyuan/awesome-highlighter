import React from 'react';
import styled from 'styled-components'
import {HighlightInfo, HighlightStyleInfo} from '../types';

const Div = styled.div<{style?: HighlightStyleInfo}>`
background-color:${props => props.style ? props.style.backgroundColor : 'inherit'};
font-color:${props => props.style ? props.style.fontColor : 'inherit'};
opacity: ${props => props.style ? props.style.opacity.toString() : 'inherit'};
border: 1px solid;
border-radius: 5px;
with: auto;
min-height: 1rem;
padding: 1rem 1.5rem;
`

interface HighlightProps {
  info: HighlightInfo
  style?: HighlightStyleInfo;
}

const Highlight = (props: HighlightProps) => {
  return (<Div style={props.style} dangerouslySetInnerHTML={{__html: props.info.highlightHTML}} />);
}

export default Highlight;
