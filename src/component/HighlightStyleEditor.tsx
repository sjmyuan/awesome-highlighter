import React, {useState} from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo} from '../types'
import Slider from 'rc-slider'
import ColorButton from './ColorButton'
import 'rc-slider/assets/index.css';

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
const SliderDiv = styled.div`
display: flex;
flex-direction: column;
justify-content: space-between;
align-items: flex-start;
min-width: 200px;
border-bottom: 1px dashed;
padding: 16px 0px;
`

const Label = styled.label`
color: darkgray;
`

interface HighlightStyleEditorProps {
  style: HighlightStyleInfo;
  onChange: (style: HighlightStyleInfo) => void
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
        props.onChange(state.style)
      }} />
    </ButtonDiv>
    <ButtonDiv>
      <Label>Font Color</Label>
      <ColorButton color={state.style.fontColor} onChange={(color: string) => {
        setState({
          style: {...state.style, fontColor: color}
        })
        props.onChange(state.style)
      }} />
    </ButtonDiv>
    <SliderDiv>
      <Label>Opacity</Label>
      <Slider min={0} max={100} value={state.style.opacity * 100} onChange={(v) => {
        setState({
          style: {...state.style, opacity: v / 100}
        })
        props.onChange(state.style)
      }} />
    </SliderDiv>
  </Div>);
}

export default HighlightStyleEditor;
