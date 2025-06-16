import { SettlePaymentProps } from '@/types';
import React, { useState } from 'react'
import { AiOutlineCaretDown } from 'react-icons/ai';
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { MdCalendarToday, MdOutlineElectricBolt, MdWaterDrop } from 'react-icons/md';
import { TbCurrencyPeso } from 'react-icons/tb';

const SettlePayment = ({ billType }: SettlePaymentProps) => {
  const unitlist = ["101", "102", "201", "301"];
  const tenantlist = ["Juan Dela Cruz", "John Doe", "Jane Doe"];
  const [unit, setUnit] = useState(unitlist[0]);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [tenant, setTenant] = useState(tenantlist[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const dropdown = (mode: boolean) => {
    mode ? setShow(!show) : setShow2(!show2);
  }
  const choose = (u:string, mode:boolean) => {
    if(mode) {
        setUnit(u);
        setShow(false);
    } else {
        setTenant(u);
        setShow2(false);
    }
  }
  return (
    <div className='col-span-full flex flex-col text-sm'>
      <div className='w-full grid grid-cols-12 items-start gap-2'>
        <button className={`outline-none ${billType ? 'col-span-4' : 'col-span-6'} px-3 py-2 bg-zinc-100 rounded-sm flex__center__y relative click__action focus:bg-zinc-200`} onClick={() => dropdown(true)}>
          <span>Unit </span>
          <span className='font-medium ml-auto mr-1'>{unit}</span>
          <AiOutlineCaretDown className={`text-base ${show ? 'text-emerald-700' : 'rotate-90 text-customViolet'} click__action`}/>
          { show && (
            <div className='absolute top-full left-0 w-full mt-1 bg-zinc-100 rounded-sm flex flex-col overflow-hidden z-50'>
              {unitlist.map((list, i) => (
                <button key={i} className='click__action text-center py-2 px-5 focus:bg-zinc-50' onClick={() => choose(list, true)}>{list}</button>
              ))}    
            </div>
          )}
        </button>
        { billType && (
          <div className='col-span-4 flex__center__y justify-between px-3 py-2 bg-zinc-100 rounded-sm'>
            <MdOutlineElectricBolt className='text-xl text-amber-500'/>
            <span>1034</span>
          </div>
        )}
        <div className={`${billType ? 'col-span-4' : 'col-span-6'} flex__center__y justify-between px-3 py-2 bg-zinc-100 rounded-sm`}>
          { billType ? 
            (<MdWaterDrop className='text-xl text-sky-500'/>) :
            (<span>Rent</span>)
          }
          <span>334</span>
        </div>
        <div className='col-span-6 flex__center__y justify-between px-3 py-2 bg-zinc-100 rounded-sm mt-2'>
          <span className='text-nowrap'>Paid Amount</span>
          <TbCurrencyPeso className='h-4 min-w-4 ml-3 text-zinc-400'/>
          <input type="text" className='bg-transparent max__size' placeholder='0.00'/>
        </div>
        <div className='col-span-6 flex__center__y justify-between px-3 py-2 bg-zinc-100 rounded-sm mt-2'>
          <span className='text-nowrap'>Balance</span>
          <TbCurrencyPeso className='h-4 min-w-4 ml-3 text-zinc-400'/>
          <input type="text" className='bg-transparent max__size' placeholder='0.00'/>
        </div>
        <button className='outline-none col-span-6 px-3 py-2 bg-zinc-100 rounded-sm flex__center__y relative click__action focus:bg-zinc-200' onClick={() => dropdown(false)}>
          <span className='text-nowrap'>Paid By </span>
          <span className='font-medium mx-2 text-nowrap overflow-hidden text-ellipses'>{tenant}</span>
          <AiOutlineCaretDown className={`text-base ${show ? 'text-emerald-700' : 'rotate-90 text-customViolet'} click__action`}/>
          { show2 && (
            <div className='absolute top-full right-0 px-3 mt-1 bg-zinc-100 rounded-sm flex flex-col overflow-hidden z-50'>
              {tenantlist.map((list, i) => (
                <button key={i} className='click__action text-center py-2 px-5 focus:bg-zinc-50' onClick={() => choose(list, false)}>{list}</button>
              ))}    
            </div>
          )}
        </button>
        <div className='col-span-6 flex__center__y justify-between px-3 py-2 bg-zinc-100 rounded-sm'>
          <MdCalendarToday className='text-lg mr-2'/>
          <input type="date" className='bg-transparent max__size' value={date} onChange={(e) => setDate(e.target.value)}/>
        </div>
        <div className='col-span-full flex justify-end gap-2 mt-2 mb-2'>
          <button className='click__action flex__center__y gap-3 px-5 py-2 border border-zinc-400 rounded-sm outline-none text-zinc-400 justify-between md:gap-5'><HiOutlineArrowNarrowLeft className='text-xl'/> Cancel</button>
          <button className='click__action hover__action flex__center__y gap-2 px-5 py-2 bg-customViolet rounded-sm text-white outline-none focus:bg-customViolet/80 md:gap-5'>Confirm <HiOutlineArrowNarrowRight className='text-xl'/></button>
        </div>
      </div>
    </div>
  )
}

export default SettlePayment
