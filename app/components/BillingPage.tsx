import React, { useState } from 'react'
import { BillingList, SettlePayment, TitleButton } from './customcomponents'
import { ChangePageProps, SetSetttleProps } from '@/types'
import CreateBilling from './CreateBilling'
import DropDownBtn from './customcomponents/DropDownBtn';
import { HiOutlineSwitchVertical } from 'react-icons/hi';

type BillingProps = ChangePageProps & SetSetttleProps;
const BillingPage: React.FC<BillingProps> = ({ setPage, setSettleBilling, setUnit }) => {
  const list = ["This Month", "Last Month", "March", "February"];
  const unit = [101, 102, 201, 301];
  const datePaid = ['Mar 30', 'Mar 29', 'Mar 28', 'Mar 29'];
  const electric = [1322, 890, 932, 1152];
  const water = [344, 344, 344, 344];
  const rent = [3500, 3500, 2500, 4500];
  const amount = [5166, 4500, 3000, 5996];
  const paidE = [1103, 890, 900, 950];
  const paidW = [344, 300, 320, 344];
  const paidR = [3500, 3000, 2500, 4500];
  const [billType, setBillType] = useState(true);
  const toggleBillType = () => {
    setBillType(!billType);
  }

  return (
    <div className='max__size px-5 py-3 gap-5 text-customViolet flex flex-col items-start overflow-hidden bg-white rounded-t-2xl'>
      <TitleButton setPage={setPage} title="Billing"/>
      <div className='h-full w-full flex flex-col overflow-x-hidden gap-3'>
        <h2 className='h2__style'>Compute</h2>
        <CreateBilling 
          setPage={setPage} 
          setSettleBilling={setSettleBilling} 
          setUnit={setUnit}
        />
        <div className='w-full flex__center__y justify-between text-xs mt-2'>
          <h2 className='h2__style'>Settle Payment</h2>
          <button className='flex__center__y gap-2 px-3 py-2 bg-customViolet rounded-sm text-white outline-none click__action focus:bg-customViolet/80' onClick={toggleBillType}>
            {billType ? 'Utility' : 'Rental'}
            <HiOutlineSwitchVertical className='text-base'/>
          </button>
        </div>
        <SettlePayment billType={billType}/>
        <div className='w-full flex justify-between mt-2'>
          <h2 className='h2__style'>History</h2>
          <DropDownBtn list={list}/>
        </div>
        <BillingList 
          month='This Month' 
          unit={unit} 
          datePaid={datePaid} 
          electric={electric} 
          water={water} 
          rent={rent} 
          amount={amount} 
          paidElectric={paidE} 
          paidWater={paidW} 
          paidRent={paidR}
        />
      </div>
    </div>
  )
}

export default BillingPage
