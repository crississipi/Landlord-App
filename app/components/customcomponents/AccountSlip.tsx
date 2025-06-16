import React from 'react'

const AccountSlip = () => {
  return (
    <button className='click__action flex__center__y h-10 w-full gap-3 px-3 py-2 rounded-sm focus:bg-customViolet/50 focus:text-slate-50 group outline-none text-sm text-left md:text-sm md:py-5'>
      <div className='h-8 min-w-8 rounded-full bg-customViolet'></div>
      <h6 className='flex__center__y w-full'>Juan Dela Cruz <span className='click__action font-medium text-xs ml-auto group-focus:text-emerald-700'>101</span></h6>
    </button>
  )
}

export default AccountSlip
