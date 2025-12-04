import { CustomNavBtnProps } from '@/types';
import React from 'react'
import { AiOutlineComment, AiOutlineHome, AiOutlineDelete, AiOutlineDollarCircle, AiOutlinePicture, AiOutlinePushpin, AiOutlineSetting, AiOutlineSolution, AiOutlineTool, AiOutlineUser, AiOutlineUserAdd } from 'react-icons/ai'

const CustomNavBtn = ({ btnName, onClick, mainPage }:CustomNavBtnProps ) => {
  const btnStyle = "h-8 w-8 md:h-10 md:w-10 lg:h-11 lg:w-11 text-customViolet";
  return (
    <button className={`${btnName === "Delete Conversation" && 'mt-5'} ${mainPage && 'justify-center'} flex__center__y focus__action click__action hover__action outline-none w-full h-12 md:h-14 lg:h-16 rounded-md gap-2.5 md:gap-4 lg:gap-5 px-3 md:px-4 text-emerald-700 text-base md:text-lg lg:text-xl transition-colors`} onClick={onClick}>
      { btnName === "Home" && <AiOutlineHome className={btnStyle}/>}
      { btnName === "Messages" && <AiOutlineComment className={btnStyle}/>}
      { btnName === "Bulletin" && <AiOutlinePushpin className={btnStyle}/>}
      { btnName === "Maintenance Requests" && <AiOutlineTool className={btnStyle}/>}
      { btnName === "Billing" && <AiOutlineDollarCircle className={btnStyle}/>}
      { btnName === "Tenant List" && <AiOutlineSolution className={btnStyle}/>}
      { btnName === "Add New Tenant" && <AiOutlineUserAdd className={btnStyle}/>}
      { btnName === "Settings" && <AiOutlineSetting className={btnStyle}/>}
      { btnName === "See Profile" && 
        <>
          <div className={`${btnStyle} rounded-full border-2 overflow-hidden`}><AiOutlineUser className='max__size mt-0.5'/></div>
          <h4 className={`text-lg text-customViolet tracking-wide text-nowrap`}>{btnName}</h4>
        </>
      }
      { btnName === "Images" && 
        <>
          <AiOutlinePicture className={btnStyle}/>
          <h4 className={`text-lg text-customViolet tracking-wide text-nowrap`}>{btnName}</h4>
        </>
      }
      { btnName === "Delete Conversation" && <AiOutlineDelete className={`${btnStyle} text-rose-700`}/>}

      {btnName === "Delete Conversation" && (
        <h4 className={`font-medium text-red-700 tracking-wide text-nowrap`}>{btnName}</h4>
      )}
      
    </button>
  )
}

export default CustomNavBtn
