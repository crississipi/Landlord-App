import React from 'react'
import MaintenanceCard from './customcomponents/MaintenanceCard'
import { ChangePageProps, ImageProps } from '@/types'

type MaintenanceProps = ChangePageProps & ImageProps;

const Maintenance: React.FC<MaintenanceProps> = ({ setPage, setImage }) => {
  return (
    <div className='column__align overflow-hidden text-customViolet'>
      <div className='max__size flex flex-col'>
        <div className='w-full grid grid-cols-12 border-b border-zinc-200 text-sm font-medium pb-2 mb-2'>
          <span className='col-span-2 pl-3'>Unit</span>
          <span className='col-span-6'>Concern</span>
          <span className='col-span-2'>Date</span>
          <span className='col-span-2 pr-3'>Urgency</span>
        </div>
        <MaintenanceCard 
          urgent={true} 
          unit="101" 
          dateSent="Mar 10" 
          tenant="Dela Cruz, Juan"
          info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
          button={false}
          setPage={setPage}
          setImage={setImage}
        />
        <MaintenanceCard 
          urgent={true} 
          unit="202" 
          dateSent="Mar 13" 
          tenant='Martin, John'
          info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
          button={false}
          setPage={setPage}
          setImage={setImage}
        />
        <MaintenanceCard 
          urgent={false} 
          unit="201" 
          dateSent="Mar 16" 
          tenant='Demarcus, Cousins'
          info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
          button={false}
          setPage={setPage}
          setImage={setImage}
        />
      </div>
    </div>
  )
}

export default Maintenance
