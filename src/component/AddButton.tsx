import React from 'react';
import styled from 'styled-components'

const ButtonDiv = styled.a<AddButtonProps>`
  position: relative;
  height: ${props => `${props.customSize}px`};
  min-width: ${props => `${props.customSize}px`};
  border: 1px dotted;
  padding: 0px;
  box-sizing: unset;
  :before,:after {
    position: absolute;
    left: 50%;
    top: ${props => `${props.customSize / 4}px`};
    content: " ";
    height: ${props => `${props.customSize / 2}px`};
    width: 2px;
    background-color: #333;
    opacity: 0.3;
  }
  :before {
    transform: rotate(90deg);
  }
  :hover {
    cursor: pointer;
  }
  :hover::before, :hover::after {
    opacity: 1;
  }
`

interface AddButtonProps {
  customSize: number;
  onClick: () => void;
}

const AddButton = (props: AddButtonProps) => {
  return (<ButtonDiv customSize={props.customSize} onClick={props.onClick} />);
}

export default AddButton
