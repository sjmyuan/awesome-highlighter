import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import HighlightCollection from './component/HighlightCollection';
import {HighlightInfo, HighlightOperation, HighlightStyleInfo, saveStringToFile, saveMarkdownToFile, getActiveHighlightOps, chromeStorage} from './types';


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
padding: 10px;
`

const ButtonDiv = styled.div`
display: flex;
flex-direction: row;
justify-content: stretch;
margin-top: 5px;
border-top: 1px solid;
`

const ExportButton = styled.button`
flex-grow: 1;
border: 1px solid;
border-radius: 5px;
margin: 5px;
padding: 10px;
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
        Promise.all([chromeStorage.getHighlight(tabs[0].url), chromeStorage.getStyles()]).then(data => {
          const [operations, styles] = data
          setState({
            infos: getActiveHighlightOps(operations).map(e => e.info as HighlightInfo),
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
      <ExportButton disabled={state.infos.length == 0} onClick={() => saveStringToFile(state.infos[0], state.infos.slice(1))}>Export as String</ExportButton>
      <ExportButton disabled={state.infos.length == 0} onClick={() => saveMarkdownToFile(state.infos[0], state.infos.slice(1))}>Export as Markdown</ExportButton>
    </ButtonDiv>
  </PopupDiv>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

