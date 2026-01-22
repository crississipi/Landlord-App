import React, { useState, useEffect, useCallback } from 'react'
import { TbCurrencyPeso } from 'react-icons/tb'

import { CustomNavBtn } from './customcomponents'

import { ChangePageProps } from '@/types'
import { changePage } from '@/utils/changePage'

// Import section components
import BillingSection from './dashboard/BillingSection'
import MaintenanceSection from './dashboard/MaintenanceSection'
import PropertiesSection from './dashboard/PropertiesSection'

// Types for dashboard stats
interface DashboardStats {
  totalTenants: number;
  totalProperties: number;
  totalRevenue: number;
  billedUnits: number;
  pendingMaintenance: number;
}

const MainPage = ({ setPage }: ChangePageProps) => {
  const today = new Date();
  const [page, newPage] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch dashboard stats only (header data)
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  changePage(page).then((p) => {
    setPage(p);
  });

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className='h-auto w-full flex flex-col justify-start bg-customViolet lg:bg-gray-50 text-customViolet relative scroll-smooth'>
      <div className='h-auto min-h-[16.66%] w-full bg-customViolet lg:bg-white sticky top-0 z-10 grid grid-cols-2 md:grid-cols-6 px-4 gap-4 md:gap-y-3 items-start text-white lg:text-gray-800 py-6 md:py-4 shadow-md md:shadow-none lg:border-b lg:border-gray-200'>
        <span className='col-span-full text-left text-sm md:text-base lg:text-sm font-light mb-2 md:mb-auto opacity-80 lg:text-gray-500'>{today.toDateString()}</span>
        <div className='col-span-2 md:col-span-3 w-full flex flex-col md:my-4 p-4 md:p-0 bg-white/10 md:bg-transparent lg:bg-transparent rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none'>
          <h2 className='col-span-full text-sm md:text-lg lg:text-base font-medium opacity-90 lg:text-gray-600'>This Month&apos;s Revenue</h2>
          <h3 className='col-span-full font-semibold text-3xl md:text-4xl lg:text-4xl flex items-center mt-1 lg:text-gray-900'>
            <TbCurrencyPeso className='text-2xl md:text-3xl lg:text-3xl stroke-2'/>
            {statsLoading ? (
              <span className="h-8 w-32 bg-gray-200/50 rounded animate-pulse" />
            ) : (
              formatCurrency(stats?.totalRevenue || 0)
            )}
          </h3>
        </div>
        <div className='col-span-2 md:col-span-3 w-full flex flex-col items-start md:items-end justify-center p-4 md:p-0 bg-white/10 md:bg-transparent lg:bg-transparent rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none'>
          <h2 className='col-span-2 font-light text-sm md:text-base lg:text-sm opacity-90 lg:text-gray-500'>Delayed Payments</h2>
          <h2 className='col-span-2 font-medium text-2xl md:text-xl lg:text-xl mt-1 lg:text-gray-900'>
            {statsLoading ? (
              <span className="h-6 w-16 bg-gray-200/50 rounded animate-pulse inline-block" />
            ) : (
              <>{stats?.pendingMaintenance || 0} / <strong className="text-sm ml-1 opacity-70">{stats?.totalProperties || 0}</strong></>
            )}
          </h2>
        </div>
        <div className='col-span-1 md:col-span-2 w-full flex flex-col items-center justify-center p-3 md:p-0 bg-white/5 md:bg-transparent lg:bg-transparent rounded-xl md:rounded-none'>
          <h2 className='col-span-2 font-light text-xs md:text-base lg:text-sm opacity-80 lg:text-gray-500'>Paid Tenants</h2>
          <h3 className='col-span-2 font-medium text-lg md:text-xl lg:text-xl tracking-wider mt-1 lg:text-gray-900'>
            {statsLoading ? (
              <span className="h-5 w-12 bg-gray-200/50 rounded animate-pulse inline-block" />
            ) : (
              <>{stats?.billedUnits || 0}/<strong className="text-sm ml-1 opacity-70">{stats?.totalTenants || 0}</strong></>
            )}
          </h3>
        </div>
        <div className='col-span-1 md:col-span-2 w-full flex flex-col items-center justify-center p-3 md:p-0 bg-white/5 md:bg-transparent lg:bg-transparent rounded-xl md:rounded-none'>
          <h2 className='col-span-2 font-light text-xs md:text-base lg:text-sm opacity-80 lg:text-gray-500'>Rented Units</h2>
          <h2 className='col-span-2 font-medium text-lg md:text-xl lg:text-xl mt-1 lg:text-gray-900'>
            {statsLoading ? (
              <span className="h-5 w-12 bg-gray-200/50 rounded animate-pulse inline-block" />
            ) : (
              <>{stats?.billedUnits || 0} / <strong className="text-sm ml-1 opacity-70">{stats?.totalProperties || 0}</strong></>
            )}
          </h2>
        </div>
        <div className='col-span-2 md:col-span-2 w-full flex flex-col items-center justify-center p-3 md:p-0 bg-white/5 md:bg-transparent lg:bg-transparent rounded-xl md:rounded-none'>
          <h2 className='col-span-2 font-light text-xs md:text-base lg:text-sm opacity-80 lg:text-gray-500'>Maintenance Cost</h2>
          <h2 className='col-span-2 font-medium text-lg md:text-xl lg:text-xl flex items-center mt-1 lg:text-gray-900'><TbCurrencyPeso className='text-base md:text-lg lg:text-lg stroke-2'/>1,500</h2>
        </div>
      </div>
      <div className={`min-h-[93vh] border border-black/5 w-full flex flex-col lg:flex-row gap-3 md:gap-4 lg:gap-0 rounded-t-[2rem] lg:rounded-none bg-white lg:bg-gray-50 z-30 overflow-x-hidden sticky top-[25vh] md:top-full p-2 md:p-4 lg:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none lg:border-none`}>
        {/* DO NOT CHANGE THIS */}
        <div className='min-h-16 md:min-h-20 w-full lg:w-80 lg:min-w-80 lg:h-[93vh] lg:sticky lg:top-0 bg-zinc-50 lg:bg-white grid grid-cols-5 lg:flex lg:flex-col items-center lg:items-start lg:justify-start rounded-2xl lg:rounded-none p-1 md:p-2 lg:p-6 gap-1 lg:gap-4 overflow-x-auto md:overflow-visible no-scrollbar lg:border-r lg:border-gray-200'>
          
          <h2 className="hidden lg:block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 px-3">Menu</h2>

          <CustomNavBtn 
            btnName='Home' 
            mainPage={true} 
            onClick={() => newPage(0)}
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
        {/* ONLY CHANGE THIS */}
        <div className='h-full w-full flex overflow-y-auto overflow-x-hidden'>
          <div className='w-full flex flex-col gap-5 md:gap-6 lg:gap-8 pb-6 max-w-7xl mx-auto'>
            {/* Section 1: Billing Status - Independent Loading */}
            <BillingSection onViewAll={() => newPage(13)} />

            {/* Section 2: Maintenance Requests - Independent Loading */}
            <MaintenanceSection onViewAll={() => newPage(4)} />

            {/* Section 3: Properties & Feedbacks - Independent Loading */}
            <PropertiesSection onManage={() => newPage(14)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage