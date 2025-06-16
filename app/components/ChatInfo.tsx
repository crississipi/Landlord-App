import { ChangePageProps, ChatInfoProps } from '@/types'
import React from 'react'
import { AiOutlineLeft, AiOutlineSearch, AiOutlineUser } from 'react-icons/ai'
import { CustomNavBtn } from './customcomponents'

type ChatProps = ChatInfoProps & ChangePageProps;
const ChatInfo: React.FC<ChatProps> = ({ setPage, chatInfo, setChatInfo }) => {
  const closeChatInfo = () => {
    setChatInfo("-right-[9999px]");
  }
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
      setChatInfo("-right-[9999px]");
    }, 100);
  }
  return (
    <div className={`h-full w-full flex flex-col ${chatInfo} fixed px-5 gap-10 bg-white text-customViolet py-5 z-50 drop-shadow-lg md:w-3/5 ease-in-out duration-700`}>
        <div className='h-auto w-full flex__center__y gap-3'>
            <button className='rounded-sm h-11 w-11 p-1 focus:ring-2 focus:ring-customViolet/50 focus:scale-105 outline-none' onClick={closeChatInfo}>
                <AiOutlineLeft className='max__size text-emerald-700'/>
            </button>
        </div>
        <div className='column__align gap-1 flex__center__y mt-5'>
            <div className='flex__center__all h-auto w-full py-2'>
                <button className='focus__action hover__action click__action outline-none rounded-full bg-customViolet h-24 w-24 text-white'><AiOutlineUser className='h-full w-full mt-2'/></button>
            </div>
            <h2 className='h2__style'>Juan Dela Cruz</h2>
        </div>
        <div className='max__size flex flex-col items-center gap-3 pb-5'>
            <div className={`flex__center__all click__action min-h-11 w-full max-w-[400px] rounded-full bg-white px-2 py-1 mb-10 border border-customViolet/50 gap-2 outline-none md:py-2 md:px-3`}>
                <AiOutlineSearch className='h-6 min-w-8 text-emerald-700'/>
                <input type="text" className='max__size input__text text__overflow' placeholder='Search in Conversation'/>
            </div>
            <div className='max__size flex flex-col gap-3 md:gap-5'>
                <CustomNavBtn btnName='See Profile' onClick={() => changePage(7)} mainPage={false}/>
                <CustomNavBtn btnName='Images' onClick={() => changePage(11)} mainPage={false}/>
                <CustomNavBtn btnName='Delete Conversation' onClick={() => changePage(1)} mainPage={false}/>
            </div>
        </div>
    </div>
  )
}

export default ChatInfo
