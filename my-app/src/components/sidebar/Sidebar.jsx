import React, { useState } from "react";
import "./Sidebar.css"
import Logo from"../../components/logo.png"
import { SidebarData } from "../../data/data";

const Sidebar = () => {

    const [selected, setSelected] = useState(0)
    return (
        <div className="Sidebar">

            <div className="logo">
                    <img src={Logo} />
                    <span>
                        ABCS Digital <span>Twin</span>
                    </span>
            </div>

            <div className="menu">
                {SidebarData.map((item,index)=>{
                    return(
                        <div className={selected===index?'menuItem active':'menuItem'}
                        key = {index}
                        onClick={()=>setSelected(index)}
                        > 
                            <span>{item.Heading}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
     
    )

}
export default Sidebar;