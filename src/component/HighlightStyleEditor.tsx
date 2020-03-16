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
  styleId: string
}

const HighlightStyleEditor = (props: HighlightStyleEditorProps) => {
  const context = useContext(OptionAppContext)
  const style = context.state.styles.find(e => e.id === props.styleId)
  if (style) {
    return (<Div>
      <ButtonDiv>
        <Label>Background Color</Label>
        <ColorButton color={style.backgroundColor} onChange={(color: string) => {
          context.dispatch({id: 'UPDATE_STYLE', payload: {...style, backgroundColor: color}})
        }} />
      </ButtonDiv>
      <ButtonDiv>
        <Label>Font Color</Label>
        <ColorButton color={style.fontColor} onChange={(color: string) => {
          context.dispatch({id: 'UPDATE_STYLE', payload: {...style, fontColor: color}})
        }} />
      </ButtonDiv>
      <SliderDiv>
        <Label>Opacity</Label>
        <Slider min={0} max={100} value={style.opacity * 100} onChange={(v) => {
          context.dispatch({id: 'UPDATE_STYLE', payload: {...style, opacity: v / 100}})
        }} />
      </SliderDiv>
    </Div>);
  } else {
    return (<Div />)
  }
}

export default HighlightStyleEditor;
