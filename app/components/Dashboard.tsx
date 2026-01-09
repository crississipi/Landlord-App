"use client";

import React, { useState } from 'react';
import { DashboardProps } from '@/types';
import { Chart, DashboardCard } from './customcomponents';
import PaymentInfo from './customcomponents/PaymentInfo';

const Dashboard = ({ inDbPage }: DashboardProps ) => {
  const [chart, setChart] = useState(true);
  const toggleChart = () => { setChart(!chart); }
  return (
    <div className='h-auto w-full flex flex-col gap-6 md:grid md:grid-cols-12 text-customViolet lg:text-gray-900 p-4 md:p-6'>
      <div className='col-span-5 column__align md:hidden'>
        <div className='h-12 w-full flex justify-end mb-4'>
          <button className='outline-none flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-100 relative' onClick={toggleChart}>
            <span className={`px-6 py-2 rounded-full z-10 text-sm font-medium transition-colors duration-300 ${chart ? 'text-white' : 'text-customViolet'}`}>Bar</span>
            <span className={`px-6 py-2 rounded-full z-10 text-sm font-medium transition-colors duration-300 ${!chart ? 'text-white' : 'text-customViolet'}`}>Pie</span>
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-customViolet rounded-full transition-all duration-300 ${chart ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
          </button>
        </div>
        <div className={`h-auto w-full card__style`}>
          {chart ? (<Chart type='bar'/>) : (<Chart type='pie'/>)}
        </div>
      </div>
      <div className={`col-span-5 h-auto hidden md:block lg:col-span-4 xl:col-span-3 card__style`}>
        <Chart type='pie'/>
      </div>
      <div className={`${!inDbPage ? 'grid-rows-11 md:col-span-7 md:h-auto lg:col-span-4 lg:gap-4' : 'grid-rows-12 md:col-span-7 md:h-auto lg:col-span-5'} primary__btn__holder text-customViolet lg:text-gray-900 text-sm`}>
        <DashboardCard 
          size={`col-span-6  ${inDbPage ? 'row-span-full' : 'row-span-8 md:row-span-7 lg:row-span-8'}`} 
          title="Net Revenue" 
          rate={true} 
          value="9,735" 
          priceStyle="text-3xl font-bold w-full h-full flex items-center md:text-4xl lg:text-5xl text-customViolet lg:text-gray-900"
          pesoStyle="text-2xl lg:text-3xl"
          paid={false}
          inDbPage={inDbPage}
        />
        <DashboardCard 
          size={`col-span-6 ${inDbPage ? 'row-span-6' : 'row-span-4'}`} 
          title="Gross Revenue" 
          rate={true} 
          value="10,000" 
          priceStyle="text-xl font-semibold md:text-2xl lg:text-3xl"
          pesoStyle="text-lg md:text-xl"
          paid={false}
          inDbPage={inDbPage}
        />
        <DashboardCard 
          size={`col-span-6 ${inDbPage ? 'row-span-6' : 'row-span-4'}`} 
          title="Delayed Payment" 
          rate={false} 
          value="265" 
          priceStyle="text-base font-medium md:text-xl lg:text-base"
          pesoStyle="text-sm md:text-base"
          paid={false}
          inDbPage={inDbPage}
        />
        { !inDbPage && (
          <>
            <DashboardCard 
              size="col-span-6 row-span-3" 
              title="" 
              rate={false} 
              value="4" 
              priceStyle="show paid"
              pesoStyle=""
              paid={true}
            />
            <DashboardCard 
              size="col-span-6 row-span-3" 
              title="" 
              rate={false} 
              value="0" 
              priceStyle="show paid"
              pesoStyle=""
              paid={false}
            />
          </>
        )}
      </div>
      {inDbPage && (
        <div className={`col-span-6 h-auto w-full hidden md:block lg:col-span-3`}>
          <Chart type='bar'/>
        </div>
      )}
      
      <div className={`col-span-6 h-56 w-full flex-col gap-2 lg:col-span-4 lg:h-40 lg:text-xs ${inDbPage ? 'hidden md:flex' : 'hidden lg:flex'}`}>
        <h3 className='font-medium'>Recent Transactions</h3>
        <div className='h-full w-full flex flex-col gap-2 overflow-x-hidden'>
          <PaymentInfo unit="102" price="1,375" paymentType={true} date="05/25/2025" withBG={true}/>
          <PaymentInfo unit="102" price="" paymentType={true} date="05/25/2025" withBG={true}/>
          <PaymentInfo unit="102" price="1,375" paymentType={true} date="05/25/2025" withBG={true}/>
          <PaymentInfo unit="102" price="1,375" paymentType={true} date="05/25/2025" withBG={true}/>
          <PaymentInfo unit="102" price="1,375" paymentType={true} date="05/25/2025" withBG={true}/>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
