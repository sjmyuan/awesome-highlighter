import React, {useState} from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo} from '../types'
import Slider from 'rc-slider'
import ColorButton from './ColorButton'

const Div = styled.div`
width: auto;
border: 2px solid;
display: flex;
flex-direction: column;
justify-content: center;
align-items: flex-start;
padding: 16px;
`

const ButtonDiv = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
min-width: 200px;
border-bottom: 1px dashed;
padding: 16px 0px;
`

const Label = styled.label`
color: darkgray;
`

interface HighlightStyleEditorProps {
  style: HighlightStyleInfo;
}

interface HighlightStyleEditorState {
  style: HighlightStyleInfo
}

const HighlightStyleEditor = (props: HighlightStyleEditorProps) => {
  const [state, setState] = useState<HighlightStyleEditorState>({style: props.style})
  return (<Div>
    <ButtonDiv>
      <Label>Background Color</Label>
      <ColorButton color={state.style.backgroundColor} onChange={(color: string) => {
        setState({
          style: {...state.style, backgroundColor: color}
        })
      }} />
    </ButtonDiv>
    <ButtonDiv>
      <Label>Font Color</Label>
      <ColorButton color={state.style.fontColor} onChange={(color: string) => {
        setState({
          style: {...state.style, fontColor: color}
        })
      }} />
    </ButtonDiv>
    <ButtonDiv>
      <Label>Opacity</Label>
      <Slider min={0} max={100} value={100} onChange={(v) => console.log(v)} />
    </ButtonDiv>
  </Div>);
}

export default HighlightStyleEditor;
