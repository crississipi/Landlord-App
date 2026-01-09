import React from 'react'
import { CustomPrice } from '.'
import { DashboardCardProps, DashboardProps } from '@/types'

interface DashboardCardProp extends DashboardProps, DashboardCardProps {
  title: string;
  size: string;
}
const DashboardCard: React.FC<DashboardCardProp> = ({ title, size, paid, value, priceStyle, pesoStyle, rate, inDbPage}) => {
  return (
    <div className={`${size} card__style flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${title != "Net Revenue" && "items-end"} ${inDbPage ? 'md:text-lg lg:text-xl' :  'md:text-base lg:text-sm'}`}>
        {title != '' && (
          <>
            <h3 className='w-full text-muted font-medium text-sm uppercase tracking-wider'>{title}</h3>
            <CustomPrice rate={rate} price={value} priceStyle={priceStyle} pesoStyle={pesoStyle}/>
          </>
        )}
        { title === "" && priceStyle === "show paid" && paid && (
          <div className='h-full w-full flex__center__y justify-between md:text-xl lg:text-lg text-emerald-600 bg-emerald-50 rounded-[1.5rem] px-4 py-2 border border-emerald-100'>
            <span className="font-medium">Already Paid</span>
            <span className='font-bold bg-white px-3 py-1 rounded-full shadow-sm'>{value}</span>
          </div>
        )}
        { title === "" && priceStyle === "show paid" && !paid && (
          <div className='h-full w-full flex__center__y justify-between relative md:text-xl lg:text-lg text-rose-500 bg-rose-50 rounded-[1.5rem] px-4 py-2 border border-rose-100'>
            <span className="font-medium">Not Yet Paid</span>
            <span className='font-bold bg-white px-3 py-1 rounded-full shadow-sm'>{value}</span>
          </div>
        )}
    </div>
  )
}

export default DashboardCard
