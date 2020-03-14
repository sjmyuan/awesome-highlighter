import React, {useState, useEffect} from 'react';
import styled from 'styled-components'
import {ChromePicker, ColorResult} from 'react-color';

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
  color: string
  onChange: (color: string) => void
}

interface ColorButtonState {
  color: string
  showPicker: boolean
  pickerPosition: number
}
const ColorButton = (props: ColorButtonProps) => {

  const [state, setState] = useState<ColorButtonState>({color: props.color, showPicker: false, pickerPosition: 0})
  let buttonElement = React.createRef<HTMLButtonElement>();
  let pickerElement = React.createRef<HTMLDivElement>();

  const handleMouseDown = (event: any) => {
    const onPicker = pickerElement.current && pickerElement.current.contains(event.target) || pickerElement.current === event.target
    if (!onPicker) {
      setState({...state, showPicker: false})
      props.onChange(state.color)
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

  return (<ColorButtonDiv>
    <Button ref={buttonElement} color={state.color} onClick={() => setState({
      ...state,
      showPicker: true
    })} />
    <PickerDiv show={state.showPicker} top={state.pickerPosition}>
      <ChromePicker color={state.color} onChange={(color: ColorResult) => {
        setState({
          ...state,
          color: color.hex
        });
      }} />
    </PickerDiv>
  </ColorButtonDiv>)
}

export default ColorButton;
