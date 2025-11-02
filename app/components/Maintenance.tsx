import React from 'react'
import { MdOutlineCalendarMonth, MdOutlineEditCalendar } from 'react-icons/md';

const Maintenance = () => {
  return (
    <div className='column__align overflow-hidden text-customViolet mt-3'>
      <p className='w-full pl-5'><strong>3</strong> pending maintenance issues.</p>
      <p className='w-full pl-5'><strong>2</strong> scheduled maintenance today.</p>
      <div className='max__size flex gap-2 mt-5'>
        <button 
          type="button"
          className='flex-grow rounded-md text-nowrap bg-customViolet text-white text-sm flex items-center justify-between p-3 pl-4 gap-3 hover:scale-101 focus:scale-101 click__action'
        >
          Set a Schedule
          <MdOutlineEditCalendar className='text-2xl'/>
        </button>
        <button 
          type="button"
          className='flex-grow rounded-md text-nowrap bg-customViolet text-white text-sm flex items-center justify-between p-3 pl-4 gap-3'  
        >
          Show Appointments
          <MdOutlineCalendarMonth className='text-2xl'/>
        </button>
      </div>
    </div>
  )
}

export default Maintenance
