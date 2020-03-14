import React from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo} from '../types'
import HighlightStyle from './HighlightStyle'


const Ul = styled.ul`
width: auto;
height: auto;
list-style: none;
`

interface HighlightStyleCollectionProps {
  styles: HighlightStyleInfo[];
}

const HighlightStyleCollection = (props: HighlightStyleCollectionProps) => {
  return (<Ul>{props.styles.map(s => (
    <li><HighlightStyle style={s} /></li>
  ))}</Ul>);
}

export default HighlightStyleCollection;
