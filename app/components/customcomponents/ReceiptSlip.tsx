import { ReceiptSlipProps } from '@/types'
import React, { useState } from 'react'
import { TbCurrencyPeso } from 'react-icons/tb';

const ReceiptSlip = ({ utility, forTotal, amount, paid }: ReceiptSlipProps) => {
  const balance = amount - paid;
  const spanStyle = `col-span-3 text-right text-emerald-700/80 ${forTotal && 'font-medium flex__center__y justify-end'}`;
  return (
    <div className='col-span-full grid grid-cols-12 text-customViolet/80'>
        <span className='col-span-3 text-left'>{utility}</span>
        <span className={spanStyle}>
            { forTotal && (<TbCurrencyPeso className='ml-0.5'/>) }
            {amount.toLocaleString()}
        </span>
        <span className={spanStyle}>
            { forTotal && (<TbCurrencyPeso className='ml-0.5'/>) }
            {paid.toLocaleString()}
        </span>
        <span className={spanStyle}>
            { forTotal && (<TbCurrencyPeso className='ml-0.5'/>) }
            {balance.toLocaleString()}
        </span>
    </div>
  )
}

export default ReceiptSlip
