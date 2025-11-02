import { ChangePageProps, ChatHeadProps } from '@/types'
import React from 'react'

type SetProps = ChatHeadProps & ChangePageProps;

const ChatHead: React.FC<SetProps> = ({ name, setPage, userId, isOnline }) => {
  const changePage = (page: number, chatUserId?: number) => {
    setTimeout(() => {
      setPage(page, chatUserId);
    }, 100);
  }
  
  return (
    <button 
      className='flex__center__all click__action h-24 min-w-20 rounded-md flex-col gap-1 text-xs overflow-hidden outline-none group focus:bg-zinc-100 md:text-base md:min-w-28 md:max-w-28' 
      onClick={() => changePage(9, userId)}
    >
        <div className='click__action h-16 w-16 rounded-full bg-customViolet shadow-sm shadow-zinc-100 relative group-focus:ring-4 group-focus:ring-customViolet/50 group-focus:scale-90'>
            {isOnline && (
              <span className='h-3 w-3 rounded-full bg-emerald-700 absolute bottom-1 right-1 ring-4 ring-white'></span>
            )}
        </div>
        <p className='text__overflow w-11/12 '>{name}</p>
    </button>
  )
}

export default ChatHead