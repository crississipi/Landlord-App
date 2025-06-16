"use client";
import React, { useState } from 'react'
import MaintenanceCard from './customcomponents/MaintenanceCard';
import { ChangePageProps, ImageProps } from '@/types';
import { TitleButton } from './customcomponents';
import DropDownBtn from './customcomponents/DropDownBtn';

type MaintenanceProps = ChangePageProps & ImageProps;

const MaintenancePage: React.FC<MaintenanceProps> = ({ setPage, setImage } ) => {
  const [sort, setSort] = useState(true);
  const toggleSort = () => {
    setSort(!sort);
  }
  const list1 = ["This Month", "Last 3 mos", "Last 6 mos", "Last 12 mos"];

  return (
    <div className='column__align px-5 gap-3 py-3 text-customViolet overflow-hidden bg-white rounded-t-2xl'>
      <div className='h-auto w-full flex items-end justify-between py-0.5'>
        <TitleButton setPage={setPage} title="Maintenance"/>
        <button className='h-9 w-12 relative outline-none flex__center__y rounded-sm' onClick={toggleSort}>
           <div className={`h-6 w-6 rounded-full ${sort ? 'bg-rose-700' : 'bg-emerald-700'} ring-2 ring-customViolet z-10 absolute bottom-1 left-2`}></div>
           <div className={`h-4 w-4 rounded-full ${sort ? 'bg-emerald-700' : 'bg-rose-700'} ring-2 ring-customViolet absolute top-1 right-2`}></div>
        </button>
      </div>
      <div className='max__size flex flex-col gap-3 overflow-x-hidden'>
        <h2 className='h2__style'>Pending</h2>
        <div className='column__align gap-2 mb-2'>
        <div className='w-full grid grid-cols-12 items-center font-medium text-sm border-b border-zinc-200 pb-2'>
          <span className='col-span-2 pl-2'>Unit</span>
          <span className='col-span-6'>Concern</span>
          <span className='col-span-2'>Date</span>
          <span className='col-span-2'>Urgency</span>
        </div>
        <MaintenanceCard 
            urgent={true} 
            unit="101" 
            dateSent="Mar 10" 
            tenant="Dela Cruz, Juan"
            info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
            button={true}
            setPage={setPage}
            setImage={setImage}
          />
          <MaintenanceCard 
            urgent={true} 
            unit="202" 
            dateSent="Mar 13" 
            tenant='Martin, John'
            info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
            button={true}
            setPage={setPage}
            setImage={setImage}
          />
          <MaintenanceCard 
            urgent={false} 
            unit="201" 
            dateSent="Mar 16" 
            tenant='Demarcus, Cousins'
            info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
            button={true}
            setPage={setPage}
            setImage={setImage}
          />
          <MaintenanceCard 
            urgent={false} 
            unit="301" 
            dateSent="Mar 14" 
            tenant='Desmond, Bane'
            info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
            button={true}
            setPage={setPage}
            setImage={setImage}
          />
        </div>
        <div className='w-full flex__center__y justify-between'>
          <h2 className='h2__style'>History</h2>
          <DropDownBtn list={list1}/>
        </div>
        <div className='column__align gap-5'>
        <MaintenanceCard 
            urgent={true} 
            unit="101" 
            dateSent="Mar 10" 
            tenant="Dela Cruz, Juan"
            info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
            button={false}
            docu={true}
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
            docu={true}
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
            docu={true}
            setPage={setPage}
            setImage={setImage}
          />
          <MaintenanceCard 
            urgent={false} 
            unit="301" 
            dateSent="Mar 14" 
            tenant='Desmond, Bane'
            info="Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna."
            button={false}
            docu={true}
            setPage={setPage}
            setImage={setImage}
          />
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage
