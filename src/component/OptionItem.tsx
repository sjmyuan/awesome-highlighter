import React, {ReactNode} from 'react';
import styled from 'styled-components'

const ItemDiv = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: stretch;
margin-bottom: 30px;
`
const TitleLabel = styled.label`
font-size: x-large;
font-weight: bold;
text-align: start;
`

const SplitterDiv = styled.div`
height: 2px;
background-color: black;
margin: 16px 0px;
`

interface OptionItemProps {
  title: string
  children: ReactNode | ReactNode[];
}

const OptionItem = (props: OptionItemProps) => {
  return (<ItemDiv>
    <TitleLabel>{props.title}</TitleLabel>
    <SplitterDiv />
    {props.children}
  </ItemDiv>);
}

export default OptionItem;
