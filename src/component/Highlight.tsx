import React from 'react';
import styled from 'styled-components'
import {HighlightInfo} from '../types';


const Div = styled.div`
  with: auto;
  min-height: 1rem;
  padding: 1rem 1.5rem;
`

interface HighlightProps {
  info: HighlightInfo
}

const Highlight = (props: HighlightProps) => {
  return (<Div dangerouslySetInnerHTML={{__html: props.info.highlightHTML}} />);
}

export default Highlight;
