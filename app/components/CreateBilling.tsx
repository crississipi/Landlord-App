import React from 'react'
import { MdOutlineCalculate, MdOutlineHistory } from 'react-icons/md';

const CreateBilling = () => {
  return (
    <div className='column__align overflow-hidden text-customViolet mt-3'>
      <p className='w-full pl-3'><strong>3</strong> pending billing transactions.</p>
      <p className='w-full pl-3'><strong>2</strong> delayed payments.</p>
      <div className='max__size flex gap-2 mt-5'>
        <button 
          type="button"
          className='flex-grow rounded-md text-nowrap bg-customViolet text-white text-sm flex items-center justify-between p-3 pl-4 gap-3 hover:scale-101 focus:scale-101 click__action'
        >
          Compute Billing
          <MdOutlineCalculate className='text-2xl'/>
        </button>
        <button 
          type="button"
          className='flex-grow rounded-md text-nowrap bg-customViolet text-white text-sm flex items-center justify-between p-3 pl-4 gap-3'  
        >
          Show Billing History
          <MdOutlineHistory className='text-2xl'/>
        </button>
      </div>
    </div>
  )
}

export default CreateBilling
