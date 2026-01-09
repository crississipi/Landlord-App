"use client";

import React, { useState } from 'react'
import { AiOutlineCaretDown } from 'react-icons/ai'
import PaymentInfo from './PaymentInfo'
import { PaymentListProps } from '@/types'

const PaymentList = ({ month, unit, price, paymentType, date }:PaymentListProps) => {
  const [showHide, setShowHide] = useState(false);
  const toggleShowHide = () => {
    setShowHide(!showHide);
  }
  return (
    <div className='click__action h-max max-h-52 flex flex-col overflow-hidden text-sm md:text-base'>
      <button className='flex__center__y h-11 w-full py-1 px-3 rounded-xl text-customViolet font-medium outline-none justify-between border-b border-zinc-200 md:font-normal' onClick={toggleShowHide}>
        <h5 className='py-2'>{month}</h5>
        <AiOutlineCaretDown className={`h-4 w-4 ${ showHide ? 'rotate-90' : 'rotate-0 text-emerald-700 scale-110'} click__action`}/>
      </button>
      <div className={`${showHide ? 'hidden' : 'flex flex-col'}  gap-1 px-1 py-2`}>
        <PaymentInfo unit={unit[0]} price={price[0]} paymentType={paymentType[0]} date={date[0]}/>
        <PaymentInfo unit={unit[1]} price={price[1]} paymentType={paymentType[1]} date={date[1]}/>
        <PaymentInfo unit={unit[2]} price={price[2]} paymentType={paymentType[2]} date={date[2]}/>
        <PaymentInfo unit={unit[3]} price={price[3]} paymentType={paymentType[3]} date={date[3]}/>
      </div>
    </div>
  )
}

export default PaymentList
