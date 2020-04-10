import React from 'react';
import './menuItem.css';
import {animated,useSpring} from 'react-spring';
import styled from 'styled-components';
const Item = styled.div `
padding: 10px 10px 10px 10px ;
position: relative;
display: block;
overflow: hidden;
text-align: left ;
cursor: pointer;
color: black;
background: white;
&:hover{

  text-align:center;

}
`
const MenuItem = ({content}) =>{
  const [{ x, color }, set] = useSpring(() => ({ x: 100, color: "black", 
 }));
  return (
    <div>
      <Item
        onMouseEnter={() => set({ x: 0, color: "white"})} 
        onMouseLeave={() => set({ x: 100, color: "black"})}
      >
        <animated.span style={{ color }}>
          {content}
        </animated.span>
        <animated.p
          style={{ transform: x.interpolate(v => `translateX(-${v}%`) }}
          className="glance"
        />
      </Item>
    </div>
  );

};

export default MenuItem;