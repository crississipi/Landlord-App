"use client";
import React from 'react'
import { ChangePageProps, ImageProps } from '@/types';
import { TitleButton } from './customcomponents';
import Calendaryo from './CalendaryoNew';

type MaintenanceProps = ChangePageProps & ImageProps;

const MaintenancePage: React.FC<MaintenanceProps> = ({ setPage } ) => {
  return (
    <div className='column__align px-5 md:px-8 lg:px-12 gap-3 md:gap-5 py-3 md:py-5 text-customViolet lg:text-gray-800 overflow-hidden bg-white lg:bg-gray-50 rounded-t-[1.5rem] lg:rounded-none'>
      <div className='h-auto w-full flex items-end justify-between py-0.5'>
        <div className="lg:hidden">
          <TitleButton setPage={setPage} title="Maintenance"/>
        </div>
        <h1 className="hidden lg:block text-2xl font-semibold text-gray-800">Maintenance</h1>
      </div>
      <div className='max__size flex flex-col gap-3 md:gap-5 overflow-x-hidden max-w-7xl mx-auto'>
        <Calendaryo setPage={setPage}/>
      </div>
    </div>
  )
}

export default MaintenancePage
