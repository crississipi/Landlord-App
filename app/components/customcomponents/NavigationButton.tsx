import { CustomNavBtnProps } from '@/types';
import React from 'react'
import { AiOutlineComment, AiOutlineDashboard, AiOutlineDelete, AiOutlineDollarCircle, AiOutlinePicture, AiOutlinePushpin, AiOutlineSetting, AiOutlineSolution, AiOutlineTool, AiOutlineUser, AiOutlineUserAdd } from 'react-icons/ai'

const CustomNavBtn = ({ btnName, onClick, mainPage }:CustomNavBtnProps ) => {
  const btnStyle = "h-8 w-8 md:h-9 md:w-9 text-customViolet";
  return (
    <button className={`${btnName === "Delete Conversation" && 'mt-5'} ${mainPage && 'justify-center'} flex__center__y focus__action click__action hover__action outline-none w-full h-12 rounded-md gap-2.5 px-3 text-emerald-700 md:gap-5 md:text-xl md:h-14`} onClick={onClick}>
      { btnName === "Dashboard" && <AiOutlineDashboard className={btnStyle}/>}
      { btnName === "Messages" && <AiOutlineComment className={btnStyle}/>}
      { btnName === "Bulletin" && <AiOutlinePushpin className={btnStyle}/>}
      { btnName === "Maintenance Requests" && <AiOutlineTool className={btnStyle}/>}
      { btnName === "Billing" && <AiOutlineDollarCircle className={btnStyle}/>}
      { btnName === "Tenant List" && <AiOutlineSolution className={btnStyle}/>}
      { btnName === "Add New Tenant" && <AiOutlineUserAdd className={btnStyle}/>}
      { btnName === "Settings" && <AiOutlineSetting className={btnStyle}/>}
      { btnName === "See Profile" && <div className={`${btnStyle} rounded-full border-2 overflow-hidden`}><AiOutlineUser className='max__size mt-0.5'/></div>}
      { btnName === "Images" && <AiOutlinePicture className={btnStyle}/>}
      { btnName === "Delete Conversation" && <AiOutlineDelete className={`${btnStyle} text-rose-700`}/>}

      {btnName === "Delete Conversation" && (
        <h4 className={`font-medium text-red-700 tracking-wide text-nowrap`}>{btnName}</h4>
      )}
      
    </button>
  )
}

export default CustomNavBtn
