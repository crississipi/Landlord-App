"use client";
import React from 'react'
import { ChangePageProps, ImageProps } from '@/types';
import { TitleButton } from './customcomponents';
import Calendaryo from './CalendaryoNew';

type MaintenanceProps = ChangePageProps & ImageProps;

const MaintenancePage: React.FC<MaintenanceProps> = ({ setPage } ) => {
  return (
    <div className='column__align px-5 md:px-8 lg:px-12 gap-3 md:gap-5 py-3 md:py-5 text-customViolet overflow-hidden bg-white rounded-t-2xl'>
      <div className='h-auto w-full flex items-end justify-between py-0.5'>
        <TitleButton setPage={setPage} title="Maintenance"/>
      </div>
      <div className='max__size flex flex-col gap-3 md:gap-5 overflow-x-hidden max-w-7xl mx-auto'>
        <Calendaryo setPage={setPage}/>
      </div>
    </div>
  )
}

export default MaintenancePage
