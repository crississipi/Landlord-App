import React, { useState } from 'react'
import { TbCurrencyPeso } from 'react-icons/tb'

import Maintenance from './Maintenance'
import CreateBilling from './CreateBilling'
import { CustomNavBtn, Heading, TenantsPerUnit } from './customcomponents'

import { ChangePageProps, ImageProps, SetSetttleProps } from '@/types'
import { changePage } from '@/utils/changePage'
import DropDownBtn from './customcomponents/DropDownBtn'

type Mainpage = ChangePageProps & ImageProps & SetSetttleProps;

const MainPage: React.FC<Mainpage> = ({ setPage, setImage, setSettleBilling, setUnit }) => {
  const today = new Date();
  const [page, newPage] = useState(0);
  changePage(page).then((p) => {
    setPage(p);
  });
  const list = ["Unit 101", "Unit 102", "Unit 201", "Unit 301"];
  
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
        <div className='h-full w-full flex px-3 overflow-x-hidden'>
          <div className='column__align gap-5'>
            <div className='column__align gap-2'>
              <Heading title="Maintenance" btn="View All" setPage={setPage} page={4}/>
              <Maintenance setPage={setPage} setImage={setImage}/>
            </div>
            <div className='column__align gap-2'>
              <Heading title="Billing" btn="View All" setPage={setPage} page={3}/>
              <CreateBilling setPage={setPage} setSettleBilling={setSettleBilling} setUnit={setUnit}/>
            </div>
            <div className='column__align gap-5'>
              <div className='w-full flex justify-between'>
                <h2 className='h2__style'>Tenant List</h2>
                <DropDownBtn list={list}/>
              </div>
              <TenantsPerUnit 
                setPage={setPage} 
                unit={101} 
                profile={["/sample_profiles/janwek.png", "/sample_profiles/kevheart.jpg", "/sample_profiles/john_cena.jpg" ]} 
                name={["John Wick", "Kevin Heart", "John Cena"]}
                location='Pasay'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage
