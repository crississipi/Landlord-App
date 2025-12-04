"use client";

import React, { useState } from 'react';
import { DashboardProps } from '@/types';
import { Chart, DashboardCard } from './customcomponents';
import PaymentInfo from './customcomponents/PaymentInfo';

const Dashboard = ({ inDbPage }: DashboardProps ) => {
  const [chart, setChart] = useState(true);
  const toggleChart = () => { setChart(!chart); }
  return (
    <div className='h-auto w-full flex__center__all flex-col gap-3 md:gap-4 lg:gap-6 md:grid md:grid-cols-12 text-customViolet'>
      <div className='col-span-5 column__align md:hidden'>
        <div className='h-9 w-full flex justify-end'>
          <button className='outline-none flex__center__y gap-2 py-1 text-sm relative click__action mr-1' onClick={toggleChart}>
            <span className={`h-full w-12 rounded-full z-10 flex__center__all ${chart ? 'text-white' : 'text-customViolet'}`}>Bar</span>
            <span className={`contents-[""] h-7 w-14 rounded-full bg-customViolet absolute z-0 ${chart ? '-left-1' : 'left-13'} click__action`}></span>
            <span className={`h-full w-12 rounded-full z-10 flex__center__all ${!chart ? 'text-white' : 'text-customViolet'}`}>Pie</span>
          </button>
        </div>
        <div className={`h-auto w-full `}>
          {chart ? (<Chart type='bar'/>) : (<Chart type='pie'/>)}
        </div>
      </div>
      <div className={`col-span-5 h-auto hidden md:block lg:col-span-4 xl:col-span-3`}>
        <Chart type='pie'/>
      </div>
      <div className={`${!inDbPage ? 'grid-rows-11 md:col-span-7 md:h-48 lg:col-span-4 lg:h-40 lg:gap-1.5' : 'grid-rows-12 md:col-span-7 md:h-40 lg:h-32 lg:col-span-5'} primary__btn__holder text-customViolet text-sm`}>
        <DashboardCard 
          size={`col-span-6  ${inDbPage ? 'row-span-full' : 'row-span-8 md:row-span-7 lg:row-span-8'}`} 
          title="Net Revenue" 
          rate={true} 
          value="9,735" 
          priceStyle="text-3xl font-medium w-full h-full flex__center__all md:text-4xl lg:text-2xl"
          pesoStyle="text-2xl lg:text-lg"
          paid={false}
          inDbPage={inDbPage}
        />
        <DashboardCard 
          size={`col-span-6 ${inDbPage ? 'row-span-6' : 'row-span-4'}`} 
          title="Gross Revenue" 
          rate={true} 
          value="10,000" 
          priceStyle="text-base font-medium md:text-xl lg:text-base"
          pesoStyle="text-sm md:text-base"
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
      {inDbPage || window.innerWidth >= 1024 && (
        <div className={`col-span-6 h-56 w-full flex-col hidden gap-2 md:flex lg:col-span-4 lg:h-40 lg:text-xs`}>
          <h3 className='font-medium'>Recent Transactions</h3>
          <div className='h-full w-full flex flex-col gap-2 overflow-x-hidden'>
            <PaymentInfo unit="102" price="1,375" paymentType={true} date="05/25/2025" withBG={true}/>
            <PaymentInfo unit="102" price="" paymentType={true} date="05/25/2025" withBG={true}/>
            <PaymentInfo unit="102" price="1,375" paymentType={true} date="05/25/2025" withBG={true}/>
            <PaymentInfo unit="102" price="1,375" paymentType={true} date="05/25/2025" withBG={true}/>
            <PaymentInfo unit="102" price="1,375" paymentType={true} date="05/25/2025" withBG={true}/>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
