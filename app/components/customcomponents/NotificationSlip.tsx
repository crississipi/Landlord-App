import { NotificationProps } from '@/types'
import React from 'react'
import { AiOutlineInfo, AiOutlineTool, AiOutlineWarning } from 'react-icons/ai'

interface ExtendedNotificationProps extends NotificationProps {
  onClick?: () => void;
}

const NotificationSlip = ({ newNotif, notifType, info, date, onClick }: ExtendedNotificationProps) => {
  const iconConfig = {
    maintenance: {
      icon: <AiOutlineTool className='text-xl'/>,
      bg: 'bg-customViolet/10',
      text: 'text-customViolet',
      label: 'Maintenance'
    },
    alert: {
      icon: <AiOutlineWarning className='text-xl'/>,
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      label: 'Alert'
    },
    reminder: {
      icon: <AiOutlineInfo className='text-xl'/>,
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      label: 'Reminder'
    }
  };

  const config = iconConfig[notifType as keyof typeof iconConfig] || iconConfig.maintenance;

  return (
    <button 
      className={`w-full bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-customViolet/30 transition-all duration-200 flex gap-4 group text-left mb-3 ${newNotif ? 'ring-1 ring-customViolet/20 bg-customViolet/[0.02]' : ''}`} 
      onClick={onClick}
    >
      <div className={`h-12 w-12 rounded-xl ${config.bg} ${config.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
        {config.icon}
      </div>

      <div className='flex flex-col flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2 mb-1'>
          <h4 className={`font-bold text-sm truncate ${newNotif ? 'text-customViolet' : 'text-gray-800'}`}>
            {config.label}
            {newNotif && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-rose-500"></span>}
          </h4>
          <span className='text-[10px] font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-full'>{date}</span>
        </div>
        <p className={`text-xs line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors ${newNotif ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
          {info}
        </p>
      </div>
    </button>
  )
}

export default NotificationSlip
