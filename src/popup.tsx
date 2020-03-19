import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import HighlightCollection from './component/HighlightCollection';
import {getHighlightOperation, HighlightInfo, HighlightOperation, HighlightStyleInfo, generateHighlightInfo, getHighlightStyles, saveStringToFile, saveMarkdownToFile} from './types';


const PopupDiv = styled.div`
width: 500px;
height: 500px;
padding: 0px 16px;
box-shadow: 0px 0px 13px 0px rgba(255,255,255,1);
display: flex;
flex-direction: column;
align-items: stretch;
margin-top: 5px
`

const HighlightDiv = styled.div`
flex-grow: 1;
display: flex;
flex-direction: column;
align-items: stretch;
overflow-y: auto;
overflow-x: hidden;
`

const ButtonDiv = styled.div`
display: flex;
flex-direction: row;
justify-content: stretch;
margin-top: 5px;
border-top: 1px solid;
`

const ExportStringButton = styled.button`
flex-grow: 1;
border-right: 1px solid;
`
const ExportMarkdownButton = styled.button`
flex-grow: 1;
border-left: 1px solid;
`

interface AppState {
  infos: HighlightInfo[]
  styles: HighlightStyleInfo[]
}
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({infos: [], styles: []})

  useEffect(() => {
    chrome.tabs.query({active: true}, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        Promise.all([getHighlightOperation(tabs[0].url), getHighlightStyles()]).then(data => {
          const [operations, styles] = data
          setState({
            infos: operations.reduce<HighlightOperation[]>((acc: HighlightOperation[], ele: HighlightOperation) => {
              if (ele.ops === 'delete') {
                return acc.filter(e => e.id !== ele.id)
              } else {
                return [...acc, ele]
              }
            }, []).map(e => e.info as HighlightInfo),
            styles: styles
          })
        })
      }
      else {
        console.log('no active tab')
      }
    })
  }, [])

  return (<PopupDiv>
    <HighlightDiv>
      <HighlightCollection infos={state.infos} styles={state.styles} />
    </HighlightDiv>
    <ButtonDiv>
      <ExportStringButton disabled={state.infos.length == 0} onClick={() => saveStringToFile(state.infos[0], state.infos.slice(1))}>Export as String</ExportStringButton>
      <ExportMarkdownButton disabled={state.infos.length == 0} onClick={() => saveMarkdownToFile(state.infos[0], state.infos.slice(1))}>Export as Markdown</ExportMarkdownButton>
    </ButtonDiv>
  </PopupDiv>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

