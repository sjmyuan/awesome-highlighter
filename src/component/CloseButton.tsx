import React from 'react';
import styled from 'styled-components'

const ButtonDiv = styled.a<CloseButtonProps>`
  position: relative;
  height: ${props => `${props.customSize}px`};
  width: ${props => `${props.customSize}px`};
  padding: 0px;
  box-sizing: unset;
  :before,:after {
    position: absolute;
    left: ${props => `${props.customSize / 2 - 1}px`};
    top: ${props => `${props.customSize / 4}px`};
    content: " ";
    height: ${props => `${props.customSize / 2}px`};
    width: 2px;
    background-color: #333;
    opacity: 0.3;
  }
  :before {
    transform: rotate(45deg);
  }
  :after {
    transform: rotate(-45deg);
  }
  :hover {
    cursor: pointer;
  }
  :hover::before, :hover::after {
    opacity: 1;
  }
`

interface CloseButtonProps {
  customSize: number;
  onClick: () => void;
}

const CloseButton = (props: CloseButtonProps) => {
  return (<ButtonDiv customSize={props.customSize} onClick={props.onClick} />);
}

export default CloseButton
