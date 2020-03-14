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
        label: 'Red',
        backgroundColor: 'red',
        fontColor: 'black'
      },
      {
        label: 'Yellow',
        backgroundColor: 'yellow',
        fontColor: 'black'
      }]
    })
  }, [])

  return (<Body>
    <Content>
      <OptionItem title="Highlight Style">
        <HighlightStyleCollection styles={state.styles} />
      </OptionItem>
    </Content>
  </Body>
  );
}


ReactDOM.render(<App />, document.getElementById('root'));

