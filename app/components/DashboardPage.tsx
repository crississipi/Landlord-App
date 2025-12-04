import React from 'react'
import { PaymentList, TitleButton } from './customcomponents'
import { ChangePageProps } from '@/types'
import Dashboard from './Dashboard'
import DropDownBtn from './customcomponents/DropDownBtn';

const DashboardPage = ({ setPage }: ChangePageProps) => {
  const list1 = ["This Month", "Last 3 mos", "Last 6 mos", "Last 12 mos"];
  const list2 = ["All", "Paid", "Not yet Paid", "Delayed"];
  return (
    <div className='max__size px-5 md:px-8 lg:px-12 py-3 md:py-5 text-customViolet flex flex-col overflow-hidden bg-white rounded-t-2xl'>
        <div className='min-h-14 md:min-h-16 lg:min-h-20 w-full flex__center__y justify-between pb-3 md:pb-4'>
            <TitleButton setPage={setPage} title="Dashboard"/>
            <DropDownBtn list={list1}/>
        </div>
        <div className='h-full w-full flex flex-col overflow-x-hidden gap-5 md:gap-6 lg:gap-8 py-3 max-w-7xl mx-auto'>
            <Dashboard inDbPage={true}/>
            <div className='w-full mt-5 md:mt-6 lg:mt-8 flex__center__y justify-between'>
                <h2 className='h2__style text-xl md:text-2xl lg:text-3xl'>History</h2>
                <DropDownBtn list={list2}/>
            </div>
            <div className='column__align gap-3 md:gap-4'>
                <PaymentList 
                    month='October' 
                    unit={["101", "102", "103", "301"]} 
                    price={["3,405", "4,510", "3,333", "6,301"]} 
                    paymentType={[true, true, false, true]} 
                    date={["5-TUE", "13-WED", "22-MON", "30-SUN"]}
                />
                <PaymentList 
                    month='December' 
                    unit={["101", "102", "103", "301"]} 
                    price={["3,405", "4,510", "3,333", "6,301"]} 
                    paymentType={[true, true, false, true]} 
                    date={["5-TUE", "13-WED", "22-MON", "30-SUN"]}
                />
                <PaymentList 
                    month='February' 
                    unit={["101", "102", "103", "301"]} 
                    price={["3,405", "4,510", "3,333", "6,301"]} 
                    paymentType={[true, true, false, true]} 
                    date={["5-TUE", "13-WED", "22-MON", "30-SUN"]}
                />
                <PaymentList 
                    month='November' 
                    unit={["101", "102", "103", "301"]} 
                    price={["3,405", "4,510", "3,333", "6,301"]} 
                    paymentType={[true, true, false, true]} 
                    date={["5-TUE", "13-WED", "22-MON", "30-SUN"]}
                />
                <PaymentList 
                    month='January' 
                    unit={["101", "102", "103", "301"]} 
                    price={["3,405", "4,510", "3,333", "6,301"]} 
                    paymentType={[true, true, false, true]}
                    date={["5-TUE", "13-WED", "22-MON", "30-SUN"]}
                />
                <PaymentList 
                    month='March' 
                    unit={["101", "102", "103", "301"]} 
                    price={["3,405", "4,510", "3,333", "6,301"]} 
                    paymentType={[true, true, false, true]} 
                    date={["5-TUE", "13-WED", "22-MON", "30-SUN"]}
                />
            </div>
        </div>
    </div>
  )
}

export default DashboardPage
