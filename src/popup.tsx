import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import HighlightCollection from './component/HighlightCollection';
import {getHighlightOperation, HighlightInfo, HighlightOperation} from './types';


const PopupDiv = styled.div`
    width: auto;
    height: auto;
    padding: 0px 16px;
    box-shadow: 0px 0px 13px 0px rgba(255,255,255,1);
    `
interface AppState {
  infos: HighlightInfo[]
}
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({infos: []})

  useEffect(() => {
    chrome.tabs.query({active: true}, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        getHighlightOperation(tabs[0].url).then(operations => {
          setState({
            infos: operations.reduce<HighlightOperation[]>((acc: HighlightOperation[], ele: HighlightOperation) => {
              if (ele.ops === 'delete') {
                return acc.filter(e => e.id !== ele.id)
              } else {
                return [...acc, ele]
              }
            }, []).map(e => e.info as HighlightInfo)
          })
        })
      }
      else {
        console.log('no active tab')
      }
    })
  }, [])

  return (<PopupDiv>
    <HighlightCollection infos={state.infos} />
  </PopupDiv>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

