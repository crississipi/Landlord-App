import { ChangePageProps, ChatHeadProps } from '@/types'
import React from 'react'
import Image from 'next/image'

type SetProps = ChatHeadProps & ChangePageProps;

const ChatHead: React.FC<SetProps> = ({ name, setPage, userId, isOnline, profileImage }) => {
  const changePage = (page: number, chatUserId?: number) => {
    setTimeout(() => {
      setPage(page, chatUserId);
    }, 100);
  }

  // Get initials from name for profile display
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };
  
  return (
    <button 
      className='flex flex-col items-center justify-center gap-2 p-2 outline-none group transition-all duration-300' 
      onClick={() => changePage(9, userId)}
    >
      <div className='relative'>
        <div className='h-16 w-16 md:h-20 md:w-20 lg:h-16 lg:w-16 rounded-full p-[2px] bg-gradient-to-tr from-customViolet to-secondary group-hover:scale-105 transition-transform duration-300'>
          <div className='h-full w-full rounded-full bg-white p-[2px] overflow-hidden relative'>
            {profileImage ? (
              <Image 
                src={profileImage} 
                alt={name}
                fill
                className="object-cover h-full w-full rounded-full"
              />
            ) : (
              <div className='h-full w-full bg-zinc-100 flex items-center justify-center text-customViolet font-bold text-lg'>
                {getInitials(name)}
              </div>
            )}
          </div>
        </div>
        {isOnline && (
          <span className='h-4 w-4 rounded-full bg-emerald-500 absolute bottom-1 right-1 ring-2 ring-white z-10'></span>
        )}
      </div>
      <p className='text-xs md:text-sm lg:text-xs font-medium text-customViolet w-20 truncate text-center'>{name}</p>
    </button>
  )
}

export default ChatHead