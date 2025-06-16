import React from 'react'
import { CustomPrice } from '.'
import { DashboardCardProps, DashboardProps, TitleButtonProps } from '@/types'

type DashboardCardProp = TitleButtonProps & DashboardProps & DashboardCardProps;
const DashboardCard: React.FC<DashboardCardProp> = ({ title, size, paid, value, priceStyle, pesoStyle, rate, inDbPage}) => {
  return (
    <div className={`${size} px-3 py-2 flex flex-col bg-white rounded-sm border border-zinc-200 ${title != "Net Revenue" && "items-end justify-between"} ${inDbPage ? 'md:text-lg' :  'md:text-base lg:text-xs lg:px-2'}`}>
        {title != '' && (
          <>
            <h3 className='w-full'>{title}</h3>
            <CustomPrice rate={rate} price={value} priceStyle={priceStyle} pesoStyle={pesoStyle}/>
          </>
        )}
        { title === "" && priceStyle === "show paid" && paid && (
          <div className='h-full w-full flex__center__y justify-between md:text-xl lg:text-base'>
            Already Paid
            <span className='font-medium'>{value}</span>
          </div>
        )}
        { title === "" && priceStyle === "show paid" && !paid && (
          <div className='h-full w-full flex__center__y justify-between relative md:text-xl lg:text-base'>
            Not Yet Paid
            <span className='font-medium'>{value}</span>
          </div>
        )}
    </div>
  )
}

export default DashboardCard
