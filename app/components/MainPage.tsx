import React, { useState } from 'react'
import { TbCurrencyPeso } from 'react-icons/tb'

import Maintenance from './Maintenance'
import CreateBilling from './CreateBilling'
import { CustomNavBtn } from './customcomponents'

import { ChangePageProps } from '@/types'
import { changePage } from '@/utils/changePage'

const MainPage = ({ setPage }: ChangePageProps) => {
  const today = new Date();
  const [page, newPage] = useState(0);
  changePage(page).then((p) => {
    setPage(p);
  });
  
  return (
    <div className='h-auto w-full flex flex-col justify-start bg-customViolet text-customViolet relative scroll-smooth'>
      <div className='h-1/6 w-full bg-customViolet sticky top-0 z-10 grid grid-cols-2 px-5 items-start text-white'>
        <span className='col-span-full text-left text-sm font-light mb-auto'>{today.toDateString()}</span>
        <div className='col-span-full w-full flex flex-col my-2'>
          <h2 className='col-span-full text-base font-medium text-center'>This Month&apos;s Revenue</h2>
          <h3 className='col-span-full font-semibold text-3xl flex items-center justify-center'><TbCurrencyPeso className='text-2xl stroke-2'/>16,500.00</h3>
        </div>
        <div className='col-span-1 w-full flex flex-col items-center justify-center'>
          <h2 className='col-span-2 font-light text-sm'>Last Month</h2>
          <h3 className='col-span-2 font-medium text-lg flex items-center'><TbCurrencyPeso className='stroke-2'/>14,000.00</h3>
        </div>
        <div className='col-span-1 w-full flex flex-col items-center justify-center'>
          <h2 className='col-span-2 font-light text-sm'>Paid Tenants</h2>
          <h2 className='col-span-2 font-medium text-lg'>10 out of 14</h2>
        </div>

      </div>
      <div className={`h-[93vh] border border-black w-full flex flex-col gap-3 rounded-t-2xl bg-white z-30 overflow-x-hidden sticky top-full p-2`}>
        <div className='min-h-16 w-full bg-zinc-100 grid grid-cols-5 items-center rounded-lg'>
          <CustomNavBtn 
            btnName='Dashboard' 
            mainPage={true} 
            onClick={() => newPage(1)}
          />
          <CustomNavBtn 
            btnName='Billing' 
            mainPage={true} 
            onClick={() => newPage(13)}
          />
          <CustomNavBtn 
            btnName='Maintenance Requests' 
            mainPage={true} 
            onClick={() => newPage(4)}
          />
          <CustomNavBtn 
            btnName='Tenant List' 
            mainPage={true} 
            onClick={() => newPage(5)}
          />
          <CustomNavBtn 
            btnName='Settings' 
            mainPage={true} 
            onClick={() => newPage(6)}
          />
        </div>
        <div className='h-full w-full flex overflow-x-hidden'>
          <div className='column__align gap-5'>
            <div className='column__align p-2 px-3 gap-2'>
              <h3 className='w-full md:text-xl lg:text-lg bg-sky-50 px-5 py-3 rounded-md'>You have <strong>3</strong> unread messages.</h3>
              <h3 className='w-full md:text-xl lg:text-lg bg-green-50 px-5 py-3 rounded-md'>You have <strong>4</strong> notifications.</h3>
            </div>
            <div className='column__align p-2 px-3'>
              <h2 className='h2__style mr-auto md:text-xl lg:text-lg'>Maintenance</h2>
              <Maintenance />
            </div>
            <div className='column__align p-2 px-3'>
              <h2 className='h2__style mr-auto md:text-xl lg:text-lg'>Billing</h2>
              <CreateBilling/>
            </div>
            <div className='column__align p-2 px-3'>
              <div className='w-full flex items-center justify-between'>
                <h2 className='h2__style mr-auto md:text-xl lg:text-lg'>Properties</h2>
                <button type="button" className='px-3 py-2 rounded-md text-sm border border-customViolet bg-customViolet/10 hover:bg-customViolet/50 focus:bg-customViolet focus:text-white ease-out duration-200' onClick={() => newPage(14)}>Manage</button>
              </div>
              <div className='w-full h-auto flex flex-col gap-3 mt-3'>
                <div className='w-full h-auto flex gap-3 overflow-y-hidden flex-nowrap'>
                  {Array.from({length: 5}).map((_,i) => (
                    <div key={i} className='min-w-3/4 aspect-square border border-customViolet/30 flex flex-col'>
                      <span className='h-3/4 w-full bg-customViolet/70'></span>
                      <div className='h-1/4 w-full flex items-center justify-between px-3'>
                        <span className='flex flex-col justify-center leading-2'>
                          <h3 className='text-lg font-medium'>Unit 10{i}</h3>
                          <p className='text-sm'>Pasay City</p>
                          <h4 className='flex mt-1 gap-1'><strong className='font-semibold'>125</strong> sqm.</h4>
                        </span>
                        <span className='flex flex-col'>
                          <h4 className='flex items-center text-sm'>
                            <TbCurrencyPeso className='text-xl'/><strong className='text-xl font-semibold'>3,000</strong>/month
                          </h4>
                          <p className='ml-auto'><em>Occupied</em></p>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='w-full h-auto flex gap-2 items-center justify-center'>
                  {Array.from({length: 5}).map((_,i) => (
                    <span key={i} className='h-3 w-3 rounded-full bg-customViolet'></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage
