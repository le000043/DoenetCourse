import React, {useState } from 'react';
// import './menu.css';
import {animated,useSpring} from 'react-spring';
const SelectionSet = ({setName,set}) =>{
  const [open,setOpen] = useState(false);
  let sets=[]
  Object.keys(set).map((item)=>{
    let branch = (
    <div
    onClick={(element)=>{set[item]()}}
    >{item}</div>)
    sets.push(branch)
  })
return (
  <div
  onClick={()=>setOpen(!open)}
  >
  {setName}
  {open && sets}
  </div>
)
};
export default SelectionSet;