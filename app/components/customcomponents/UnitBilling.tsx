import { BillingProps, ChangePageProps, SetSetttleProps } from '@/types'
import React from 'react'
import { TbCalculator } from 'react-icons/tb'

type UnitBillingProps = BillingProps & ChangePageProps & SetSetttleProps;
const UnitBilling:React.FC<UnitBillingProps> = ({setSettleBilling, setUnit, unit, prev, curr}) => {
  const settleBilling = () => {
    setSettleBilling(true);
    setUnit(unit);
  }
  return (
    <div className='w-full grid grid-cols-12 text-sm py-0.5 items-center'>
      <span className='col-span-1 font-medium pl-4'>
        {unit}
      </span>
      <span className='col-span-3 text-right text-emerald-700 text-sm'>
        {prev.toLocaleString()}
      </span>
      <span className='col-span-3 text-right text-emerald-700 text-sm'>
        {prev.toLocaleString()}
      </span>
      <span className={`col-span-3 text-center text-emerald-700 text-sm ${!(curr.toLocaleString() != '0') && 'pl-10'}`}>
        {!(curr.toLocaleString() != '0') && '---'}
      </span>
      <div className='col-span-2 flex__center__all'>
        <button className='click__action flex__center__all text-2xl py-0.5 outline-none rounded-sm focus:text-emerald-700'>
          <TbCalculator onClick={settleBilling}/>
        </button>
      </div>
    </div>
  )
}

export default UnitBilling
