import React from 'react';
import styled from 'styled-components'
import Highlight from './Highlight';
import {HighlightInfo, HighlightStyleInfo} from '../types';

const Ol = styled.ol`
  with: 100%;
  list-style: none;
  height: auto;
  padding-left: 0px;
`

const Li = styled.li<{style?: HighlightStyleInfo}>`
background-color:${props => props.style ? props.style.backgroundColor : 'inherit'};
font-color:${props => props.style ? props.style.fontColor : 'inherit'};
opacity: ${props => props.style ? props.style.opacity.toString() : 'inherit'};
border: 1px solid;
border-radius: 5px;
margin: 10px 0px;
`

interface HighlightCollectionProps {
  infos: HighlightInfo[]
  styles: HighlightStyleInfo[]
}

const HighlightCollection = (props: HighlightCollectionProps) => {
  return (<Ol>
    {
      props.infos.map(info => {
        const style = props.styles.find(e => e.id === info.styleId)
        return (<Li style={style}><Highlight info={info} /></Li>)
      })
    }
  </Ol>);
}

export default HighlightCollection;
