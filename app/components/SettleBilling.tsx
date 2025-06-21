
import { SetSetttleProps } from '@/types';
import React, { useState } from 'react'
import { MdCalendarToday, MdOutlineClose, MdOutlineElectricBolt, MdWaterDrop } from 'react-icons/md'
import { TbCurrencyPeso } from 'react-icons/tb';

interface UnitProps {
    unit: number;
}

type SettleBillingProps = SetSetttleProps & UnitProps;

const SettleBilling: React.FC<SettleBillingProps> = ({ setSettleBilling, unit }) => {
  const today = new Date();
  const [bill, setBill] = useState([0, 0]);
  const [rate, setRate] = useState([0, 0]);
  const [total, setTotal] = useState([0, 0]);
  const [amount, setAmount] = useState(0);
  const [receipt, showReceipt] = useState(false);
  const settleBilling = () => {
    setSettleBilling(false);
  }
  const handleChange = (type: boolean, index: number, value: number) => {
    if(type) {
        const newArray = [...bill];
        newArray[index] = value;
        setBill(newArray);

    } else {
        const newArray = [...rate];
        newArray[index] = value;
        setRate(newArray);
    }
  }
  const computeBill = () => { 
    if (bill[0] !== 0 && bill[1] !== 0 && rate[0] !== 0 && rate[1]) { 
        const newTotal = [...total];
        newTotal[0] = bill[0] * rate[0];
        newTotal[1] = bill[1] / rate[1];
        setTotal(newTotal);
        setAmount(newTotal[0] + newTotal[1]);
        showReceipt(!receipt); 
    }
}
  return (
    <div className='h-full w-full fixed top-1/2 left-1/2 transform -translate-1/2 z-50 flex__center__all flex-col bg-customViolet/20 select-none gap-2 text-sm md:text-base text-customViolet'>
        <div className='w-full flex justify-end px-5'>
            <button className='outline-none h-12 w-12 rounded-full bg-white shadow-md shadow-customViolet/40 flex__center__all focus:text-emerald-700 click__action focus__action hover__click' onClick={settleBilling}><MdOutlineClose className='text-3xl'/></button>
        </div>
        <div className='h-auto w-11/12 grid grid-cols-12 gap-2 p-3  bg-white shadow-md shadow-customViolet/40 rounded-md'>
            <div className='col-span-full grid grid-cols-2 pb-2'>
                <h2 className='col-span-1 font-medium text-base'>Unit {unit ? unit : '101'}</h2>
                <h3 className='col-span-1 flex__center__y justify-end gap-1 text-customViolet/70 z-50'><MdCalendarToday />{today.toDateString()}</h3>
            </div>
            <div className='col-span-8 text__overflow input__text main__input flex__center__y gap-3'>
                <MdOutlineElectricBolt className='text-2xl text-amber-500'/>
                <input type="number" className='text__overflow input__text w-full' placeholder='Consumption' value={bill[0] == 0 ? '' : bill[0]} readOnly={receipt} onChange={(e) => handleChange(true, 0, parseInt(e.target.value))}/>
                <span className='text-xs font-medium'>kWh</span>
            </div>
            <div className='col-span-4 text__overflow input__text main__input flex__center__y gap-3'>
                <input type="number" className='text__overflow input__text w-full' placeholder='0' value={rate[0] == 0 ? '' : rate[0]} readOnly={receipt} onChange={(e) => handleChange(false, 0, parseFloat(e.target.value))}/>
                <span className='text-base font-medium flex__center__y'><TbCurrencyPeso /><span className='text-xs'>/kWh</span></span>
            </div>
            <div className='col-span-8 text__overflow input__text main__input flex__center__y gap-3'>
                <MdWaterDrop className='text-2xl text-sky-500'/>
                <input type="number" className='text__overflow input__text w-full' placeholder='Consumption' value={bill[1] == 0 ? '' : bill[1]} readOnly={receipt} onChange={(e) => handleChange(true, 1, parseInt(e.target.value))}/>
                <span className='text-base font-medium'><TbCurrencyPeso /></span>
            </div>
            <div className='col-span-4 text__overflow input__text main__input flex__center__y gap-3'>
                <input type="number" className='text__overflow input__text w-full' placeholder='0' value={rate[1] == 0 ? '' : rate[1]} readOnly={receipt} onChange={(e) => handleChange(false, 1, parseInt(e.target.value))}/>
                <span className='text-xs font-medium'>units</span>
            </div>
            { !receipt && (
                <div className='col-span-full flex justify-end pt-2'>
                    <button className='outline-none rounded-sm bg-customViolet py-2 px-4 text-white click__action focus__action hover__action' onClick={computeBill}>Compute</button>
                </div>
            )}
        </div>
        { receipt && (
            <div className='w-11/12 bg-zinc-100 rounded-md shadow-md shadow-customViolet/40 flex flex-col px-3 py-2 gap-2'>
                <h2 className='text-base font-medium mb-3'>Receipt</h2>
                <div className='w-full grid grid-cols-12 border-b border-zinc-200 gap-3 font-medium py-2'>
                    <h3 className='col-span-3 pl-3'>Utility</h3>
                    <h3 className='col-span-3'>Consumed</h3>
                    <h3 className='col-span-3 text-right'>Units</h3>
                    <h3 className='col-span-3 text-right pr-3'>Subtotal</h3>
                </div>
                <div className='w-full grid grid-cols-12 gap-3'>
                    <h3 className='col-span-3 pl-3'>Electrical</h3>
                    <h3 className='col-span-3 flex__center__y justify-end'>{bill[0].toLocaleString()} kWh</h3>
                    <h3 className='col-span-3 flex__center__y justify-end'><TbCurrencyPeso />{rate[0]}<span className='text-xs mt-1'>/kWh</span></h3>
                    <h3 className='col-span-3 flex__center__y justify-end pr-3 text-emerald-700'>{total[0].toLocaleString()}</h3>
                </div>
                <div className='w-full grid grid-cols-12 gap-3'>
                    <h3 className='col-span-3 pl-3'>Water</h3>
                    <h3 className='col-span-3 flex__center__y justify-end'><TbCurrencyPeso />{bill[1].toLocaleString()}</h3>
                    <h3 className='col-span-3 text-right'>{rate[1]} units</h3>
                    <h3 className='col-span-3 flex__center__y justify-end pr-3 text-emerald-700'>{total[1].toLocaleString()}</h3>
                </div>
                <div className='grid grid-cols-12 gap-8 py-2 justify-end font-medium text-base'>
                    <span className='col-span-7'></span>
                    <h3 className='flex__center__y col-span-5'>Total: <TbCurrencyPeso className='text-emerald-700 ml-1.5'/><span className='text-emerald-700'>{amount.toLocaleString()}</span></h3>
                </div>
                <div className='flex justify-end gap-2 mt-3'>
                    <button className='outline-none rounded-sm border border-customViolet py-2 px-4 click__action focus__action hover__action' onClick={computeBill}>Back</button>
                    <button className='outline-none rounded-sm bg-customViolet py-2 px-4 text-white click__action focus__action hover__action'>Confirm</button>
                </div>
            </div>
        )}
    </div>
  )
}

export default SettleBilling
