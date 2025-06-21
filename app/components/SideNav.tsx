import React from 'react'
import { SideNavProps } from '@/types'
import NotificationSlip from './customcomponents/NotificationSlip'



const SideNav = ({ nav, comRef }: SideNavProps ) => {

  return (
    <div ref={comRef} className={`h-full w-4/5 ${nav} flex flex-col fixed z-50 bg-zinc-100 ease-in-out duration-700 md:w-3/5`}>
      <NotificationSlip 
        newNotif={true} 
        notifType='maintenance'
        info="Juan Dela Cruz submitted a new maintenance request" 
        date="14-05-25 • 03:30PM"
      />
      <NotificationSlip 
        newNotif={true} 
        notifType='reminder'
        info="10 days before end of the month, collect rent now" 
        date="14-05-25 • 12:34 PM"
      />
      <NotificationSlip 
        newNotif={false} 
        notifType='maintenance'
        info="Michael Cruz submitted a new maintenance request" 
        date="09-05-25 • 07:11 PM"
      />
      <NotificationSlip 
        newNotif={false} 
        notifType='alert'
        info="There are 2 urgent requests! Fix it immediately!" 
        date="07-05-25 • 05:24 AM"
      />
    </div>
  )
}

export default SideNav
