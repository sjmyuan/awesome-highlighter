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
  return (<Ul>{context.state.styles.map(s => (
    <Li>
      <HighlightStyle styleId={s.id} />
      <HighlightStyleEditor styleId={s.id} />
    </Li>
  ))}</Ul>);
}

export default HighlightStyleCollection;
