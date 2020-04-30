import React, {useState,useEffect,useRef } from 'react';
import styled from 'styled-components';

// import './menu.css';
import {animated,useSpring} from 'react-spring';
const ItemNotSelected = styled.div`
padding-left: 10px;
font-size: 18px;

`
const ItemSelected = styled.div `
padding-left: 5px;
font-size: 18px;


background-color: gainsboro;
border-left: 5px solid green;
`
const SelectionSet = ({setName,set}) =>{
  console.log("calling SelectionSet")
  const [open,setOpen] = useState(false);
  const [selectedItem,setSelectedItem] = useState("");
  let updateNumber =0 ;
  let sets=[]
  Object.keys(set).map((item)=>{
    let branch = (
    <div
    key={updateNumber++}
    style={{paddingLeft:"20px",fontSize:"18px"}}
    onClick={(element)=>{setSelectedItem(item);set[item]()}}
    >
    {selectedItem==item && <ItemSelected>{item}</ItemSelected>}
    {selectedItem!=item && <ItemNotSelected>{item}</ItemNotSelected>}

    </div>)
    sets.push(branch)
  })
  const node = useRef();
  useEffect(() => {
            document.addEventListener('click',handleClick, false);
            return () => {
            document.removeEventListener('click', handleClick, false);
            };
          });
          const handleClick = e =>{
            if (!node.current.contains(e.target)){
              // outside click
              console.log("outside")
              setSelectedItem("")
            }
          }
  
return (
  <div ref={node}>
  <div 
    key={updateNumber++}
  onClick={()=>{setSelectedItem("");setOpen(!open)}}
  >
  {setName}
  </div>
  {open && sets}
  </div>
)
};
export default SelectionSet;