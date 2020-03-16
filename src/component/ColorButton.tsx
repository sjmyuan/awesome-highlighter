import React, {useState, useEffect, useContext} from 'react';
import styled from 'styled-components'
import {ChromePicker, ColorResult} from 'react-color';
import {HighlightStyleInfo, OptionAppContext} from '../types';

const ColorButtonDiv = styled.div`
position: relative;
`

const Button = styled.button<{color: string}>`
width: 50px;
height: 20px;
background-color: ${props => props.color};
border-radius: 5px;
z-index: 0;
`
const PickerDiv = styled.div<{show: boolean, top: number}>`
 position: absolute;
 top: ${props => props.show ? `${props.top}px` : '0px'};
 display: ${props => props.show ? 'flex' : 'none'};
 flex-direction: column;
 justify-content: center;
 align-items: stretch;
 border: 1px transparent;
 padding: 4px;
 z-index: 1;
 `

interface ColorButtonProps {
  getColor: (style: HighlightStyleInfo) => string
  setColor: (style: HighlightStyleInfo, color: string) => HighlightStyleInfo
  styleId: string
}

interface ColorButtonState {
  showPicker: boolean
  pickerPosition: number
}
const ColorButton = (props: ColorButtonProps) => {

  const [state, setState] = useState<ColorButtonState>({showPicker: false, pickerPosition: 0})
  const context = useContext(OptionAppContext)
  let buttonElement = React.createRef<HTMLButtonElement>();
  let pickerElement = React.createRef<HTMLDivElement>();

  const handleMouseDown = (event: any) => {
    if (pickerElement.current) {
      const onPicker = pickerElement.current.contains(event.target) || pickerElement.current === event.target
      if (!onPicker) {
        setState({...state, showPicker: false})
      }
    }
  }

  useEffect(() => {
    setState({
      ...state,
      pickerPosition: buttonElement.current ? buttonElement.current.clientHeight + 6 : 0,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseDown])

  const style = context.state.styles.find(e => e.id === props.styleId)

  if (style) {
    return (<ColorButtonDiv>
      <Button ref={buttonElement} color={props.getColor(style)} onClick={() => setState({
        ...state,
        showPicker: true
      })} />
      <PickerDiv ref={pickerElement} show={state.showPicker} top={state.pickerPosition}>
        <ChromePicker color={props.getColor(style)} onChange={(color: ColorResult) => {
          context.dispatch({
            id: 'UPDATE_STYLE', payload: props.setColor(style, color.hex)
          })
        }} />
      </PickerDiv>
    </ColorButtonDiv>)
  } else {
    return <div />
  }

}

export default ColorButton;
