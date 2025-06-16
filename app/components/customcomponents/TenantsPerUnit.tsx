import React from 'react'
import Tenant from './Tenant'
import { ChangePageProps, TenantPerUnitProps } from '@/types'

type TenantPerUnit = ChangePageProps & TenantPerUnitProps;
const TenantsPerUnit: React.FC<TenantPerUnit> = ({ setPage, unit, name, profile, location }) => {
  return (
    <div className='col-span-full flex flex-col text-customViolet gap-2 text-sm pb-2 md:text-base md:gap-3'>
      <div className='w-full flex__center__y justify-between border-b border-zinc-200 pb-2'>
        <span className='font-semibold pl-3'>UNIT {unit}</span>
        <span className='pr-3'>{location}</span>
      </div>
      <div className='column__align gap-x-2'>
        <Tenant setPage={setPage} profile={profile[0]} name={name[0]}/>
        <Tenant setPage={setPage} profile={profile[1]} name={name[1]}/>
        <Tenant setPage={setPage} profile={profile[2]} name={name[2]}/>
        <Tenant setPage={setPage} profile={profile[3]} name={name[3]}/>
      </div>
    </div>
  )
}

export default TenantsPerUnit
