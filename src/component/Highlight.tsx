import React from 'react';
import styled from 'styled-components'
import {HighlightInfo} from '../types';


const Div = styled.div`
  with: 100%;
  min-height: 1rem;
  border: 1px solid;
  border-radius: 6px;
  margin: 10px 0px;
  padding: 1rem 1.5rem;
  background-color: #e8d615;
  box-shadow: 0px 0px 13px 0px rgba(199,188,64,1);
`

interface HighlightProps {
  info: HighlightInfo
}

const Highlight = (props: HighlightProps) => {
  return (<Div dangerouslySetInnerHTML={{__html: props.info.highlightHTML}} />);
}

export default Highlight;
