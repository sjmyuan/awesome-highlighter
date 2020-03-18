import React from 'react';
import styled from 'styled-components'
import Highlight from './Highlight';
import {HighlightInfo, HighlightStyleInfo} from '../types';
import CopyButton from './CopyButton';

const Ol = styled.ol`
  with: 100%;
  list-style: none;
  height: auto;
  padding-left: 0px;
`

const Li = styled.li`
margin: 10px 0px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: stretch;
`

const ButtonDiv = styled.div`
display: flex;
flex-direction: row;
justify-content: flex-end;
margin-top: 5px
`

interface HighlightCollectionProps {
  infos: HighlightInfo[]
  styles: HighlightStyleInfo[]
}

const HighlightCollection = (props: HighlightCollectionProps) => {
  return (<Ol>
    {
      props.infos.map(info => {
        const style = props.styles.find(e => e.id === info.styleId)
        return (<Li>
          <Highlight info={info} style={style} />
          <ButtonDiv>
            <CopyButton customSize={16} tooltip="Copy to Clipboard" onClick={() =>
              chrome.runtime.sendMessage({id: 'copy-as-string', payload: info.highlightHTML})
            } />
          </ButtonDiv>
        </Li>)
      })
    }
  </Ol>);
}

export default HighlightCollection;
