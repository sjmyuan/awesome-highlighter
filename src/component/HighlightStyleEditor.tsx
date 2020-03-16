import React, {useState, useContext, useEffect} from 'react';
import styled from 'styled-components'
import {HighlightStyleInfo, OptionAppContext} from '../types'
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
  style: HighlightStyleInfo
  onChange: (style: HighlightStyleInfo) => void
}

const HighlightStyleEditor = (props: HighlightStyleEditorProps) => {
  return (<Div>
    <ButtonDiv>
      <Label>Background Color</Label>
      <ColorButton color={props.style.backgroundColor} onChange={(color: string) => {
        props.onChange({...props.style, backgroundColor: color})
      }} />
    </ButtonDiv>
    <ButtonDiv>
      <Label>Font Color</Label>
      <ColorButton color={props.style.fontColor} onChange={(color: string) => {
        props.onChange({...props.style, fontColor: color})
      }} />
    </ButtonDiv>
    <SliderDiv>
      <Label>Opacity</Label>
      <Slider min={0} max={100} value={props.style.opacity * 100} onChange={(v) => {
        props.onChange({...props.style, opacity: v / 100})
      }} />
    </SliderDiv>
  </Div>);
}

export default HighlightStyleEditor;
