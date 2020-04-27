import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import HighlightCollection from './component/HighlightCollection';
import {HighlightInfo, HighlightStyleInfo, saveStringToFile, saveMarkdownToFile, chromeStorage} from './types';
import OptionItem from './component/OptionItem';
import Header from './component/Header';


const BrowseDiv = styled.div`
width: 100%;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
margin-top: 5px;
background: #f6f6f6;
`

const HighlightDiv = styled.div`
width: 50%;
display: flex;
flex-direction: column;
align-items: stretch;
padding: 10px;
`

const SearchInput = styled.input`
min-width: 400px;
height: 30px;
border: 1px transparent;
border-radius: 5px;
font-size: large;
background: #f6f6f6;
margin-right: 10px;
`
const SearchButton = styled.button`
width: auto;
height: 30px;
border: 1px transparent;
border-radius: 5px;
font-size: large;
background: #0084ff;
color: #ffffff;
`

const SearchDiv = styled.div`
width: auto;
display: flex;
flex-direction: row;
justify-content: flex-start;
align-items: center;
height: 50px;
`

interface AppState {
  infos: HighlightInfo[][]
  filteredInfos: HighlightInfo[][]
  styles: HighlightStyleInfo[]
  filter?: string
}
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({infos: [], filteredInfos: [], styles: []})

  useEffect(() => {
    Promise.all([chromeStorage.getActiveHighlights(), chromeStorage.getStyles()]).then(data => {
      const [operations, styles] = data
      const infos = operations.map(([k, v]) => v.map(e => e.info as HighlightInfo)).filter(e => e.length > 0)
      setState({
        infos: infos,
        filteredInfos: infos,
        styles: styles,
        filter: state.filter
      })
    })
  }, [])

  const updateFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({...state, filter: event.target.value})
  }

  const doFilter = () => {
    if (state.filter) {
      const filteredInfos = state.infos.reduce<HighlightInfo[][]>((acc, e) => {
        const infos = e.filter(x => x.highlightHTML.indexOf(state.filter as string) > 0)
        if (infos.length > 0) {
          return [...acc, infos]
        } else {
          return acc
        }
      }, [])
      setState({...state, filteredInfos: filteredInfos})
    } else {
      setState({...state, filteredInfos: state.infos})
    }
  }

  return (<BrowseDiv>
    <Header >
      <SearchDiv>
        <SearchInput type="text"
          placeholder="Search Highlight"
          value={state.filter}
          onChange={updateFilter}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              doFilter()
            }
          }}
        />
        <SearchButton onClick={doFilter}>Search</SearchButton>
      </SearchDiv>
    </Header>
    <HighlightDiv>
      {
        state.filteredInfos.map(e => {
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

