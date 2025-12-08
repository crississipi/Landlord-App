import { NotificationProps } from '@/types'
import React from 'react'
import { AiOutlineInfo, AiOutlineTool, AiOutlineWarning } from 'react-icons/ai'

interface ExtendedNotificationProps extends NotificationProps {
  onClick?: () => void;
}

const NotificationSlip = ({ newNotif, notifType, info, date, onClick }: ExtendedNotificationProps) => {
  return (
    <button className={`w-full grid grid-cols-12 relative pt-3 pb-1 px-5 text-customViolet items-center border-b border-zinc-200 ${newNotif && 'font-semibold'} focus:bg-white click__action text-sm`} onClick={onClick}>
        <span className={`col-span-2 h-9 w-9 rounded-full ${notifType === 'maintenance' && 'bg-customViolet text-white'} ${notifType === 'alert' && 'bg-rose-700 text-white'} ${notifType === 'reminder' && 'bg-sky-500 text-white'} flex__center__all`}>
          {notifType === "maintenance" && (<AiOutlineTool className='text-2xl'/>)}
          {notifType === "alert" && (<AiOutlineWarning className='text-2xl -mt-1'/>)}
          {notifType === "reminder" && (<AiOutlineInfo className='text-3xl '/>)}
        </span>
        <textarea className='col-span-10 h-12 max-h-32 text-left font-medium' value={info} disabled></textarea>
        <span className='col-span-full text-right text-xs font-normal'>{date}</span>
    </button>
  )
}

export default NotificationSlip
