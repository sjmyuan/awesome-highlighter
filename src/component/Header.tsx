import React, {ReactNode} from 'react';
import styled from 'styled-components'

const HeaderDiv = styled.header`
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
height: 50px;
width: 100%;
position: sticky;
top: 0px;
box-shadow: 0 1px 3px rgba(26,26,26,.1);
overflow: hidden;
background: #ffff;
z-index: 100;
`

const ContentDiv = styled.div`
display: flex;
flex-direction: row;
justify-content: flex-start;
align-items: stretch;
width: 50%;
`

const LogoDiv = styled.div`
font-size: x-large;
display: flex;
align-items: center;
position: absolute;
left: 10px;
`
const LogoImage = styled.a<{logUrl: string}>`
width: 32px;
height: 32px;
background-image: ${props => `url(${props.logUrl})`};
background-size: 32px;
margin-right: 10px;
`

interface HeaderProps {
  children?: ReactNode | ReactNode[];
}

const Header = (props: HeaderProps) => {
  return (<HeaderDiv>
    <LogoDiv>
      <LogoImage logUrl={chrome.runtime.getURL('img/icon-32.png')} />
      Awesome Highlighter
    </LogoDiv>
    <ContentDiv>
      {props.children}
    </ContentDiv>
  </HeaderDiv>);
}

export default Header;
