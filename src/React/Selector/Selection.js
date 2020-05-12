import React, {useState } from 'react';
// import './menu.css';
import styled from 'styled-components';
import {animated,useSpring} from 'react-spring';
const ItemNotSelected = styled.div`
padding-left: 5px;
font-size: 18px;

`
const ItemSelected = styled.div `
// padding-left: 10px;
background-color:rgb(233, 239, 233);
border-left: 5px solid green;
font-size: 18px;

`
const Selection = ({callBack,label,show}) =>{
  // console.log(`show is ${show}`)
  const [select,setSelect] = useState(false);
return (
  <>
  {select && 
    <ItemSelected
    onClick={()=>setSelect(!select)}
    >{label}</ItemSelected>
    }
      {!select && 
    <ItemNotSelected
    onClick={()=>setSelect(!select)}
    
    >{label}</ItemNotSelected>
    }
  
  </>
)
};
export default Selection;