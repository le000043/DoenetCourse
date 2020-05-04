import React, {useState,useEffect,useRef } from 'react';
import styled from 'styled-components';
// import {animated,useSpring} from 'react-spring';
const IndependentItemNotSelected = styled.div`

font-size: 18px;

`
const IndependentItemSelected = styled.div `
padding-left: 5px;
font-size: 18px;


background-color: gainsboro;
border-left: 5px solid green;
`
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
const Set = styled.div`
font-size: 18px;

`
const SelectionSet = ({allElements,CommonCallBack}) =>{
  console.log("from SelectionSet")
  const [openSet,setOpenSet]=useState([""]);
  const [selectedItem,setSelectedItem] = useState("");


  let updateNumber =0 ;
  let sets=[]
  let branch = null;
  Object.keys(allElements).map((item)=>{

    if (allElements[item]['type']==="IndependentItem"){ // individual items

      branch = (<IndependentItemNotSelected
      key={updateNumber++}
      onClick={(e)=>{
        if (selectedItem!=allElements[item]['thisElementLabel']){
          setSelectedItem(allElements[item]['thisElementLabel'])
        }
        allElements[item]['callBack'](e)
      }}
      >
      {allElements[item]['thisElementLabel']}
      </IndependentItemNotSelected>)
      if (selectedItem===allElements[item]['thisElementLabel']){
        branch=(
          <IndependentItemSelected
        key={updateNumber++}
          onClick={(e)=>{
            if (selectedItem!=allElements[item]['thisElementLabel']){
              setSelectedItem(allElements[item]['thisElementLabel'])
            }
            allElements[item]['callBack'](e)
          }}
          >
          {allElements[item]['thisElementLabel']}
          </IndependentItemSelected>
      )
      }
      sets.push(branch)
    }
    else if (allElements[item]['type']==="IndependentSet"){ // individual set
      // making the set name
      sets.push(<Set
        key={updateNumber++} 
        onClick={()=>{
          
            // push() will not work as it return the length not an array

          if (openSet.includes(allElements[item]['thisElementLabel'])){
            let name = allElements[item]['thisElementLabel']
            // setSelectedItem(""); OPTIONAL
            setOpenSet(openSet.filter(item=>item!==name));

          } else {
          setOpenSet(openSet=>openSet.concat(allElements[item]['thisElementLabel']))   

          }
      }}     
      >
        {allElements[item]['thisElementLabel']}
        </Set>)


        if (openSet.includes(allElements[item]['thisElementLabel'])){
          allElements[item]['subSet'].forEach(labelOfEachChoice => {
              branch=(
                <ItemNotSelected
              key={updateNumber++}
                onClick={()=>{
                  if (selectedItem!=labelOfEachChoice){
                    setSelectedItem(labelOfEachChoice)
                  }
                  if (allElements[item]['OverloadingFunctionOnItems'] && allElements[item]['OverloadingFunctionOnItems'][labelOfEachChoice]){
                    allElements[item]['OverloadingFunctionOnItems'][labelOfEachChoice]()
                  } else {
                    CommonCallBack(labelOfEachChoice);
                  }
                }
              }
                >
                {labelOfEachChoice}
                </ItemNotSelected>
            )
            if (selectedItem===labelOfEachChoice){
              branch=(
                <ItemSelected
              key={updateNumber++}
              onClick={()=>{
                if (selectedItem!=labelOfEachChoice){
                  setSelectedItem(labelOfEachChoice)
                }
                if (allElements[item]['OverloadingFunctionOnItems'] && allElements[item]['OverloadingFunctionOnItems'][labelOfEachChoice]){
                  allElements[item]['OverloadingFunctionOnItems'][labelOfEachChoice]()
                } else {
                  CommonCallBack(labelOfEachChoice);
                }
              }
              }

                >
                {labelOfEachChoice}
                </ItemSelected>
            )
            }
            
            
              
          sets.push(branch)
          });
        }
      
      
      

    }
  })


  
return (
  <div >
    {sets}

  </div>
)
};
export default SelectionSet;