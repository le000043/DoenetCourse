import React, {useState,useEffect,useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {animated,useSpring,useTransition,useChain} from 'react-spring';
import {faChevronDown } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import MenuItem from './menuItem.js';
const DropDown = styled.div `
      text-align:center;
      color: black;
      padding: 0px;
      font-size: 16px;
      border: none;
      `
const Icon = styled.div `
  display: flex;
  flex-direction: row;
  font-size: 13px;
  text-align: center;
  width: 160px;
  border-radius: 4px;
  cursor: pointer;
  background-color: none;
  padding: 7px 5px;
  padding-left:55px;
  color:#333333;
  text-transform: none;
  font-weight: 700;
  border: 0.5px solid;
  border-color: #333333;
  transition: 300ms;
  margin: 0px 10px;
  `
const MenuController = styled.button `
margin:0;
background-color: #6de5ff;
  color: black;
  padding: 16px;
  font-size: 16px;
  cursor: pointer;
  display:block;
  `
const DropDownContent = styled(animated.div) `
display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
`



    const Menu = ({currentTool,showThisRole,itemsToShow,menuIcon,width,grayTheseOut=[],offsetPos=0,menuWidth}) =>{
      const node = useRef();
      const[currentItemDisplay,setcurrentItemDisplay] = useState(Object.keys(itemsToShow).length>0?showThisRole:"");
      // let rolesDisplay=[]
      let updateNumber=0
      // console.log("itemsToShow")
      // console.log(itemsToShow)

        // Object.keys(itemsToShow).map(item=>{
        //   // console.log(`item is..${item}`)
        //   if (itemsToShow[item]['url']){    // exists URL
        //     // console.log("YESS")
        //     rolesDisplay.push(<p key={"op"+(updateNumber++)} 
        //   onClick={()=>
        //     window.location.href = itemsToShow[item]['url']
            
        //     }>{itemsToShow[item]['showText']}</p>)
        //   } else {                
        //     // console.log("NOOO")
        //               // no url, exec callBack
        //     rolesDisplay.push(<p key={"op"+(updateNumber++)} 
        //   onClick={()=>
        //     {setcurrentItemDisplay(item);
              
        //       itemsToShow[item]["callBackFunction"](item)
        //     }
        //     }
        //     >{itemsToShow[item]['showText']}
        //     </p>
        //     )
        //   }
          
        // })
        const navRef = useRef()
        const liRef = useRef()
      const [show, setShow] = useState(false);
      const fullMenuAnimation = useSpring({
        ref: navRef,
        from: {opacity:0, transform:`translateY(-200%)`},
        // -20% for nav menu, -47% for the other
        transform: show ? `translateY(${offsetPos}%)` : `translateY(-200%)`,
        opacity: show ? 1 : 0,
        display: "block",
        flexDirection:'column',
        width:(menuWidth?menuWidth:"160px"),
        config:{friction:15,mass:1,tensions:180}
      });
        useEffect(() => {
          document.addEventListener('click',handleClick, false);
          return () => {
          document.removeEventListener('click', handleClick, false);
          };
        });
        const handleClick = e =>{
          if (node.current.contains(e.target)){
            // inside click
            setShow(!show)
          }else {
          setShow(false)
          }
        }

        const itemTransitions = useTransition(
          show ? Object.keys(itemsToShow) : [],
          item => itemsToShow[item]['showText'],
          {
            ref: liRef,
            unique: true,
            trail: 400 / Object.keys(itemsToShow).length,
            from: { opacity: 0, transform: 'translateY(40px)',
              margin:'0px 0px 0px 0px',
            padding:'0px',
          },
            enter: { opacity: 1, transform: 'translateY(0)' },
            leave: { opacity: 0, transform: 'translateY(40px)' }
          }
        )


        useChain(show ? [navRef, liRef] : [liRef, navRef], [
          0,0.2
        ])
      
    return (
      <div ref={node}>
        <DropDown>
        <div>
        {menuIcon?
        (
        <Icon>
          <FontAwesomeIcon
         icon={menuIcon}
         size={'lg'}/>
         
         </Icon>
         )
         : // no icon
       (<button 

        style={{margin:"0",
        minWidth:(width?width:"160px"),
          backgroundColor: "#6de5ff",
            color: "black",
            padding: "16px",
            margin:"0",
            fontSize: "16px",
            cursor: "pointer",
            display:"block"
          }}
         >{currentItemDisplay}
         {currentItemDisplay!=""?<FontAwesomeIcon
         icon={faChevronDown}
         size={'sm'}/>:null}
         </button>
         
         )
       }</div>
      {/* use width somewhere in component below for consistenecy */}
        <DropDownContent 
        style={Object.keys(itemsToShow).length>1?fullMenuAnimation:null} >
          {itemTransitions.map(({ item, key, props }) => (
              (<animated.div
                style={props} key={key}
                onClick={()=>{
                if (itemsToShow[item]['url']){
                  window.location.href = itemsToShow[item]['url']
                } else {
                  setcurrentItemDisplay(item);
                  if (itemsToShow[item]["callBackFunction"]){
                    itemsToShow[item]["callBackFunction"](item)
                  }
                }
              }}
               >
                  {!grayTheseOut.includes(item)?
                 <MenuItem
                 currentTool={currentTool}
                 content={itemsToShow[item]['showText']}
                 object={itemsToShow}
                 currentItem={item}
                 />
                 :
                 <MenuItem
                 currentTool={currentTool}
                 content={itemsToShow[item]['showText']}
                 greyOut={true}/>
                }
               </animated.div>)
          ))}

        </DropDownContent>
      </DropDown>
      </div>

   )
    };

    export default Menu;