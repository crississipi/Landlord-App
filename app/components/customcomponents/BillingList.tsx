import { BillingListProps } from '@/types'
import React from 'react'
import BillingSlip from './BillingSlip'

const BillingList = ({month, unit, datePaid, electric, water, rent, amount, paidElectric, paidWater, paidRent}: BillingListProps) => {
  return (
    <div className='column__align'>
      <h3 className='text-sm font-semibold mb-3 uppercase'>{month}</h3>
      <div className='w-full grid grid-cols-10 border-b border-zinc-200 text-sm font-medium pb-2'>
        <span className='col-span-1 pl-3'>Unit</span>
        <span className='col-span-3 text-right'>Amount</span>
        <span className='col-span-3 text-right'>Balance</span>
        <span className='col-span-3 text-right pr-3'>Date Paid</span>
      </div>
      <div className='column__align'>
        { unit.map((list, i) => (
            <BillingSlip 
              key={i} 
              unit={list} 
              datePaid={datePaid[i]} 
              electric={electric[i]} 
              water={water[i]} 
              rent={rent[i]} 
              amount={amount[i]} 
              paidElectric={paidElectric[i]} 
              paidWater={paidWater[i]} 
              paidRent={paidRent[i]} 
            />
        ))}
      </div>
    </div>
  )
}

export default BillingList
