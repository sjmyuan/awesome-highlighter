import React from 'react';
import styled from 'styled-components'
import Highlight from './Highlight';
import {HighlightInfo} from '../types';

const Ol = styled.ol`
  with: 100%;
  list-style: none;
  height: auto;
  padding-left: 0px;
`

interface HighlightCollectionProps {
  infos: HighlightInfo[]
}

const HighlightCollection = (props: HighlightCollectionProps) => {
  return (<Ol>
    {
      props.infos.map(info => (<li><Highlight info={info} /></li>))
    }
  </Ol>);
}

export default HighlightCollection;
