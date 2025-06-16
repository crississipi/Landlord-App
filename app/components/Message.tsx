import React from 'react'
import { AiFillFolderOpen, AiFillPicture, AiOutlineInfoCircle, AiOutlineLeft, AiOutlineSend } from 'react-icons/ai'
import { MessageBubble } from './customcomponents'
import { ChangePageProps, ChatInfoProps } from '@/types'

type ChatProps = ChatInfoProps & ChangePageProps;
const Message: React.FC<ChatProps> = ({ setPage, chatInfo, setChatInfo }) => {
  const showChatInfo = () => {
    setChatInfo("right-0");
  }
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  return (
    <div className='max__size flex__center__y flex-col text-customViolet justify-start overflow-hidden bg-white rounded-t-2xl'>
      <div className='h-20 w-full bg-white shadow-sm shadow-zinc-100 flex items-center px-5 gap-3 sticky top-0'>
        <button className='focus__action hover__action click__action rounded-sm h-9 w-9 p-1 outline-none' onClick={() => changePage(2)}>
         <AiOutlineLeft className='max__size text-emerald-700'/>
        </button>
        <div className='flex__center__y gap-3'>
            <div className='h-9 min-w-9 rounded-full bg-customViolet relative md:h-11 md:min-w-11'>
            </div>
            <p className='column__align text-base font-medium md:text-lg'>
            Juan Dela Cruz
            <span className='text-xs font-normal md:text-sm'>Active Now</span>
            </p>
        </div>
        <button className='focus__action hover__action click__action ml-auto h-7 min-w-7 text-emerald-700 rounded-full outline-none md:h-9 md:w-9' onClick={showChatInfo}>
            <AiOutlineInfoCircle className='max__size'/>
        </button>
      </div>
      <div className='h-full w-full overflow-x-hidden relative'>
        <div className='column__align gap-3 sticky top-full'>
            <MessageBubble sender={false}/>
            <MessageBubble sender={true}/>
            <MessageBubble sender={false}/>
            <MessageBubble sender={true}/>
            <MessageBubble sender={false}/>
            <MessageBubble sender={true}/>
            <MessageBubble sender={false}/>
            <MessageBubble sender={true}/>
            <MessageBubble sender={false}/>
            <MessageBubble sender={true}/>
            <MessageBubble sender={false}/>
            <MessageBubble sender={true}/>
        </div>
      </div>
      <div className='h-24 w-full flex items-start pl-3 pr-2 pt-2 md:gap-3'>
        <button className='flex__center__y click__action h-10 min-w-10 p-1 text-emerald-700 rounded-sm outline-none mt-2 focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'>
            <AiFillFolderOpen className='max__size'/>
        </button>
        <button className='flex__center__y click__action h-10 min-w-10 p-1 text-emerald-700 rounded-sm outline-none mt-2 focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'>
            <AiFillPicture className='max__size'/>
        </button>
        <input type="text" placeholder='Write a Message...' className='input__text h-14 w-full rounded-xl bg-zinc-100 px-3 py-2 mx-1 md:text-base'/>
        <button className='flex__center__y click__action h-10 min-w-10 p-1 ml-1 text-emerald-700 rounded-sm outline-none mt-2 focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'>
            <AiOutlineSend className='max__size'/>
        </button>
      </div>
    </div>
  )
}

export default Message
