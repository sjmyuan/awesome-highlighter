import React, {useState} from 'react';
import styled from 'styled-components'
import CopyIcon from '../copy.png'

const ButtonDiv = styled.a<{customSize: number}>`
  position: relative;
  height: ${props => `${props.customSize}px`};
  width: ${props => `${props.customSize}px`};
  background-image: url(${CopyIcon});
  background-size: ${props => `${props.customSize}px`};
  padding: 0px;
  box-sizing: unset;
  opacity: 0.3;
  :hover {
    cursor: pointer;
    opacity: 1;
  }
`

const TooltipSpan = styled.span<{show: boolean}>`
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text */
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -110px;

  /* Fade in tooltip */
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s;

  :after {
    content: "";
    position: absolute;
    top: 100%;
    left: 90%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }
`

interface CopyButtonProps {
  customSize: number;
  tooltip?: string;
  onClick: () => void;
}

interface CopyButtonState {
  showTooltip: boolean
}

const CopyButton = (props: CopyButtonProps) => {
  const [state, setState] = useState<CopyButtonState>({showTooltip: false})
  if (props.tooltip) {
    return (<ButtonDiv customSize={props.customSize} onClick={props.onClick} onMouseEnter={() => {
      console.log('show')
      setState({showTooltip: true})
    }} onMouseOut={() => {
      console.log('hide')
      setState({showTooltip: false})
    }}>
      <TooltipSpan show={state.showTooltip}>{props.tooltip}</TooltipSpan>
    </ButtonDiv>);
  } else {
    return (<ButtonDiv customSize={props.customSize} onClick={props.onClick} />);
  }
}

export default CopyButton
