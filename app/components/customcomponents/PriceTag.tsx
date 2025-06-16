import { CustomPriceProps } from '@/types'
import React from 'react'
import { TbCurrencyPeso } from 'react-icons/tb'

const CustomPrice = ({ rate, priceStyle, pesoStyle, price }: CustomPriceProps) => {
  return (
    <span className={`flex__center__y tracking-tight ${ rate ? 'text-emerald-700' : 'text-rose-700' } ${ priceStyle }`}>
        <span className={`h-0.5 w-2 bg-rose-700 mr-0.5 ${ rate ? 'hidden' : 'block' }`}></span>
        <TbCurrencyPeso className={pesoStyle}/>
        {price}
    </span>
  )
}

export default CustomPrice
