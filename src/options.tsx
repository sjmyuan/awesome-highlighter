import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import {HighlightStyleInfo} from './types';
import HighlightStyleCollection from './component/HighlightStyleCollection';
import OptionItem from './component/OptionItem';


const Body = styled.div`
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    `
const Content = styled.div`
    max-width: 1000px;
    width: 60%
`
interface AppState {
  styles: HighlightStyleInfo[]
}
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({styles: []})

  useEffect(() => {
    setState({
      styles: [{
        id: '1',
        label: 'Red',
        backgroundColor: 'red',
        fontColor: 'black',
        opacity: 1
      },
      {
        id: '2',
        label: 'Yellow',
        backgroundColor: 'yellow',
        fontColor: 'black',
        opacity: 1
      }]
    })
  }, [])

  return (<Body>
    <Content>
      <OptionItem title="Highlight Style">
        <HighlightStyleCollection styles={state.styles} onChange={(style: HighlightStyleInfo) => {
          const newStyles = state.styles.reduce<HighlightStyleInfo[]>((acc, e) => {
            if (e.id === style.id) {
              return [...acc, style]
            } else {
              return [...acc, e]
            }
          }, [])

          setState({styles: newStyles})
        }} />
      </OptionItem>
    </Content>
  </Body>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

