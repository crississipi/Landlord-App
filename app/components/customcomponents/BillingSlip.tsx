import { BillingSlipProps } from '@/types'
import React, { useState } from 'react'
import ReceiptSlip from './ReceiptSlip';

const BillingSlip = ({unit, datePaid, electric, water, rent, amount, paidElectric, paidRent, paidWater}:BillingSlipProps) => {
  const total = electric + water + rent;
  const totalBal = paidElectric + paidWater + paidRent;
  const balance = total - totalBal;
  const [showMore, setShowMore] = useState(false);
  const toggleShow = () => {
    setShowMore(!showMore);
  }
  return (
    <button className='click__action w-full grid grid-cols-10 pt-3 rounded-sm focus:bg-zinc-50 text-sm' onClick={toggleShow}>
      <span className='col-span-1 text-left pl-4 font-medium'>{unit}</span>
      <span className='col-span-3 text-right text-emerald-700'>{total.toLocaleString()}</span>
      <span className='col-span-3 text-right text-emerald-700'>{balance <= 0 ? '0' : balance.toLocaleString()}</span>
      <span className='col-span-3 text-right pr-3 pb-3'>{datePaid}</span>
      { showMore && (
        <div className='col-span-full grid grid-cols-12 bg-zinc-50 px-3 py-2 border-t border-zinc-200'>
          <div className='col-span-full grid grid-cols-12 font-medium'>
            <span className='col-span-3 text-left'>Utility</span>
            <span className='col-span-3 text-right'>Amount</span>
            <span className='col-span-3 text-right'>Paid</span>
            <span className='col-span-3 text-right'>Balance</span>
          </div>
          <ReceiptSlip 
            utility='Electrical'
            forTotal={false} 
            amount={electric} 
            paid={paidElectric}
          />
          <ReceiptSlip 
            utility='Water' 
            forTotal={false} 
            amount={water} 
            paid={paidWater}
          />
          <ReceiptSlip 
            utility='Rent' 
            forTotal={false} 
            amount={rent} 
            paid={paidRent}
          />
          <ReceiptSlip 
            utility='' 
            forTotal={true} 
            amount={total} 
            paid={totalBal}
          />
        </div>
      )}
    </button>
  )
}

export default BillingSlip
