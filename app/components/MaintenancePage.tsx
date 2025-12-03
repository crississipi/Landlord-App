"use client";
import React, { useState } from 'react'
import MaintenanceCard from './customcomponents/MaintenanceCard';
import { ChangePageProps, ImageProps } from '@/types';
import { TitleButton } from './customcomponents';
import DropDownBtn from './customcomponents/DropDownBtn';
import Calendaryo from './CalendaryoNew';

type MaintenanceProps = ChangePageProps & ImageProps;

const MaintenancePage: React.FC<MaintenanceProps> = ({ setPage } ) => {
  return (
    <div className='column__align px-5 gap-3 py-3 text-customViolet overflow-hidden bg-white rounded-t-2xl'>
      <div className='h-auto w-full flex items-end justify-between py-0.5'>
        <TitleButton setPage={setPage} title="Maintenance"/>
      </div>
      <div className='max__size flex flex-col gap-3 overflow-x-hidden'>
        <Calendaryo setPage={setPage}/>
      </div>
    </div>
  )
}

export default MaintenancePage
