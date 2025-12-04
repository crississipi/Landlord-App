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
      className='flex__center__all click__action h-24 md:h-28 lg:h-32 min-w-20 md:min-w-28 md:max-w-28 lg:min-w-32 lg:max-w-32 rounded-md flex-col gap-1 md:gap-2 text-xs md:text-sm lg:text-base overflow-hidden outline-none group focus:bg-zinc-100 hover:bg-zinc-50 transition-colors' 
      onClick={() => changePage(9, userId)}
    >
      <div className='h-max w-max relative'>
        <div className='click__action h-18 w-18 md:h-20 md:w-20 lg:h-24 lg:w-24 aspect-square rounded-full bg-gradient-to-br from-indigo-500 to-customViolet shadow-sm shadow-zinc-100 relative group-focus:ring-4 group-focus:ring-customViolet/50 group-focus:scale-90 group-hover:scale-105 transition-transform flex items-center justify-center text-white font-bold text-xl md:text-2xl lg:text-3xl overflow-hidden'>
            {profileImage ? (
              <Image 
                src={profileImage} 
                alt={name}
                fill
                className="object-cover h-full w-full"
              />
            ) : (
              getInitials(name)
            )}
        </div>
        {isOnline && (
          <span className='h-3 w-3 md:h-4 md:w-4 rounded-full bg-emerald-500 absolute bottom-1 right-1 ring-4 ring-white z-10'></span>
        )}
      </div>
      <p className='text__overflow w-11/12 font-medium'>{name}</p>
    </button>
  )
}

export default ChatHead