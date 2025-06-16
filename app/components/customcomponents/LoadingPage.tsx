import React from 'react'
import Image from 'next/image';

const LoadingPage = () => {
  return (
    <div className='max__size flex__center__all flex-col bg-customViolet absolute top-0 left-0 z-50 text-white text-sm font-light'>
      <Image src={'/loading_logo.svg'} alt='loading logo' width={100} height={100} className='h-24 w-24'/>
      <span className='absolute bottom-10'>© 2025 Co-Living. All rights reserved.</span>
    </div>
  )
}

export default LoadingPage
