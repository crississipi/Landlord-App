import { PaymentProps } from '@/types'
import React from 'react'
import { AiOutlineCreditCard } from 'react-icons/ai'
import { PiMoneyWavy } from 'react-icons/pi'
import { TbCurrencyPeso } from 'react-icons/tb'

const PaymentInfo = ({ unit, price, paymentType, date, withBG }: PaymentProps) => {
  return (
    <div className={`w-full grid grid-cols-12 items-center py-2 text-sm text-customViolet px-3 ${withBG && 'bg-zinc-100 rounded-sm md:text-base lg:text-sm'}`}>
      <span className={`col-span-2 font-medium ${status ? 'md:col-span-2' : 'md:col-span-3'} text-sm lg:text-xs`}>Unit {unit}</span>

      { price ? (
        <span className='col-span-4 flex__center__y justify-end font-medium md:col-span-3 text-emerald-700'>
          <TbCurrencyPeso className='text-xs'/>{price}
        </span>
      ) : (
        <p className='col-span-4 font-light italic text-nowrap text-right text-rose-500 lg:text-xs'>Not Paid</p>
      )}
      { paymentType ? <AiOutlineCreditCard className={`text-lg col-span-1 ml-auto text-emerald-700 md:text-lg ${price === "" && 'hidden'}`}/> : <PiMoneyWavy className={`text-lg col-span-1 ml-auto text-emerald-700 ${price === "" && 'hidden'}`}/>}
      <span className='col-span-5 md:col-span-5 text-right font-light text-sm lg:text-xs'>{date}</span>
    </div>
  )
}

export default PaymentInfo
