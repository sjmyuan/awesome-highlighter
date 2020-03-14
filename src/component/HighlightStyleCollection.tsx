import React from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo} from '../types'
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

interface HighlightStyleCollectionProps {
  styles: HighlightStyleInfo[];
}

const HighlightStyleCollection = (props: HighlightStyleCollectionProps) => {
  return (<Ul>{props.styles.map(s => (
    <Li>
      <HighlightStyle style={s} />
      <HighlightStyleEditor style={s} />
    </Li>
  ))}</Ul>);
}

export default HighlightStyleCollection;
