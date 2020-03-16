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
  styleId: string
}

const HighlightStyle = (props: HighlightStyleProps) => {
  const context = useContext(OptionAppContext)
  const style = context.state.styles.find(e => e.id === props.styleId)
  if (style) {
    return (<Div style={style}>
      {style.label}
      <CloseButtonDiv>
        <CloseButton customSize={32} onClick={() => console.log('click')} />
      </CloseButtonDiv>
    </Div>);
  } else {
    return (<div />)
  }
}

export default HighlightStyle;
