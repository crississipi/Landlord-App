import React from 'react'
import { UnitBilling } from './customcomponents'
import { ChangePageProps, SetSetttleProps } from '@/types'

type CreateBillingProps = ChangePageProps & SetSetttleProps;
const CreateBilling: React.FC<CreateBillingProps> = ({ setPage, setSettleBilling, setUnit }) => {
  return (
    <div className='column__align text-customViolet rounded-sm'>
        <div className='w-full grid grid-cols-12 text-sm font-medium border-b border-zinc-200 py-1.5 mb-2'>
            <span className='col-span-1 pl-3'>Unit</span>
            <span className='col-span-3 text-right'>March</span>
            <span className='col-span-3 text-right'>Previous</span>
            <span className='col-span-3 text-right'>Current</span>
        </div>
        <div className='max-h-50 column__align overflow-x-hidden'>
            <UnitBilling 
                setSettleBilling={setSettleBilling}
                setUnit={setUnit}
                setPage={setPage} 
                unit={101} 
                prev={3211.19} 
                curr={0}
            />
            <UnitBilling 
                setSettleBilling={setSettleBilling}
                setUnit={setUnit}
                setPage={setPage} 
                unit={102} 
                prev={4321.56} 
                curr={0}
            />
            <UnitBilling 
                setSettleBilling={setSettleBilling}
                setUnit={setUnit}
                setPage={setPage} 
                unit={201} 
                prev={3345.92} 
                curr={0}
            />
            <UnitBilling 
                setSettleBilling={setSettleBilling}
                setUnit={setUnit}
                setPage={setPage} 
                unit={301} 
                prev={5122.44} 
                curr={0}
            />
        </div>
    </div>
  )
}

export default CreateBilling
