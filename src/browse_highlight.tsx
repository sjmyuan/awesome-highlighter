import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import HighlightCollection from './component/HighlightCollection';
import {HighlightInfo, HighlightStyleInfo, saveStringToFile, saveMarkdownToFile, chromeStorage} from './types';
import OptionItem from './component/OptionItem';


const BrowseDiv = styled.div`
width: 100%;
box-shadow: 0px 0px 13px 0px rgba(255,255,255,1);
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
margin-top: 5px
`

const HighlightDiv = styled.div`
width: 50%;
display: flex;
flex-direction: column;
align-items: stretch;
padding: 10px;
`

interface AppState {
  infos: HighlightInfo[][]
  styles: HighlightStyleInfo[]
}
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({infos: [], styles: []})

  useEffect(() => {
    Promise.all([chromeStorage.getActiveHighlights(), chromeStorage.getStyles()]).then(data => {
      const [operations, styles] = data
      setState({
        infos: operations.map(([k, v]) => v.map(e => e.info as HighlightInfo)).filter(e => e.length > 0),
        styles: styles
      })
    })
  }, [])

  return (<BrowseDiv>
    <HighlightDiv>
      {
        state.infos.map(e => {
          return (
            <OptionItem
              title={e[0] ? e[0].title : "Unknown"}
              link={e[0] ? e[0].url : undefined}>
              <HighlightCollection infos={e} styles={state.styles} />
            </OptionItem>)
        })
      }
    </HighlightDiv>
  </BrowseDiv>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

