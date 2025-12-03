import React, { useState, useEffect, useCallback } from 'react'
import { TbCurrencyPeso, TbAlertCircle, TbCheck, TbTool, TbHome, TbStar, TbUsers } from 'react-icons/tb'
import { MdHome, MdOutlineElectricBolt, MdWaterDrop } from 'react-icons/md'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'

import { CustomNavBtn } from './customcomponents'

import { ChangePageProps } from '@/types'
import { changePage } from '@/utils/changePage'

// Types for dashboard data
interface RecentBilling {
  billingID: number;
  unit: string | null;
  month: string | null;
  totalRent: number;
  totalWater: number;
  totalElectric: number;
  totalAmount: number;
  dateIssued: string;
  tenant: {
    userID: number;
    name: string;
  };
  property: {
    propertyId: number;
    name: string;
  };
}

interface MaintenanceByUrgency {
  count: number;
  color: string;
  label: string;
}

interface RecentRequest {
  maintenanceId: number;
  request: string;
  urgency: string;
  urgencyColor: string;
  dateIssued: string;
  property: string;
  tenant: string;
}

interface MaintenanceSummary {
  total: number;
  byUrgency: Record<string, MaintenanceByUrgency>;
  recentRequests: RecentRequest[];
}

interface PropertyWithFeedback {
  propertyId: number;
  name: string;
  currentTenants: number;
  totalFeedbacks: number;
  recentFeedbacks: number;
  averageRating: number;
}

interface DashboardStats {
  totalTenants: number;
  totalProperties: number;
  totalRevenue: number;
  billedUnits: number;
  pendingMaintenance: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentBillings: RecentBilling[];
  maintenanceSummary: MaintenanceSummary;
  properties: PropertyWithFeedback[];
}

// Urgency color mapping (same as CalendaryoNew)
const urgencyColors: Record<string, { bg: string; bgLight: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  orange: { bg: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  red: { bg: 'bg-red-500', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const MainPage = ({ setPage }: ChangePageProps) => {
  const today = new Date();
  const [page, newPage] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error: Unable to fetch dashboard data');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get time ago string
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  return (
    <div className='h-auto w-full flex flex-col justify-start bg-customViolet text-customViolet relative scroll-smooth'>
      <div className='h-1/6 w-full bg-customViolet sticky top-0 z-10 grid grid-cols-2 px-5 items-start text-white'>
        <span className='col-span-full text-left text-sm font-light mb-auto'>{today.toDateString()}</span>
        <div className='col-span-full w-full flex flex-col my-2'>
          <h2 className='col-span-full text-base font-medium text-center'>This Month&apos;s Revenue</h2>
          <h3 className='col-span-full font-semibold text-3xl flex items-center justify-center'>
            <TbCurrencyPeso className='text-2xl stroke-2'/>
            {dashboardData ? formatCurrency(dashboardData.stats.totalRevenue) : '0.00'}
          </h3>
        </div>
        <div className='col-span-1 w-full flex flex-col items-center justify-center'>
          <h2 className='col-span-2 font-light text-sm'>Billed Units</h2>
          <h3 className='col-span-2 font-medium text-lg'>{dashboardData?.stats.billedUnits || 0}</h3>
        </div>
        <div className='col-span-1 w-full flex flex-col items-center justify-center'>
          <h2 className='col-span-2 font-light text-sm'>Total Tenants</h2>
          <h2 className='col-span-2 font-medium text-lg'>{dashboardData?.stats.totalTenants || 0}</h2>
        </div>
      </div>
      <div className={`h-[93vh] border border-black w-full flex flex-col gap-3 rounded-t-2xl bg-white z-30 overflow-x-hidden sticky top-full p-2`}>
        {/* DO NOT CHANGE THIS */}
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
        {/* ONLY CHANGE THIS */}
        <div className='h-full w-full flex overflow-y-auto overflow-x-hidden'>
          <div className='w-full flex flex-col gap-5 pb-6'>
            {loading ? (
              <div className="w-full flex justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-customViolet border-t-transparent rounded-full animate-spin" />
                  <p className="text-customViolet/70">Loading dashboard...</p>
                </div>
              </div>
            ) : error ? (
              <div className="w-full flex justify-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : dashboardData ? (
              <>
                {/* Section 1: Billing Status */}
                <div className='w-full flex flex-col p-2 px-3'>
                  <div className='w-full flex items-center justify-between mb-3'>
                    <h2 className='font-semibold text-lg md:text-xl'>Billing Status</h2>
                    <button 
                      type="button" 
                      className='flex items-center gap-1 text-sm text-customViolet hover:underline'
                      onClick={() => newPage(13)}
                    >
                      View All <HiOutlineArrowNarrowRight />
                    </button>
                  </div>
                  
                  {dashboardData.recentBillings.length === 0 ? (
                    <div className="w-full bg-zinc-50 rounded-xl p-6 text-center">
                      <TbCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="text-zinc-600">No recent billings</p>
                    </div>
                  ) : (
                    <div className='w-full flex flex-col gap-2'>
                      {dashboardData.recentBillings.slice(0, 5).map((billing) => (
                        <div 
                          key={billing.billingID} 
                          className="w-full border border-zinc-200 rounded-xl p-3 hover:border-customViolet/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-customViolet flex items-center justify-center">
                                <MdHome className="text-white text-lg" />
                              </div>
                              <div>
                                <h4 className="font-medium text-zinc-900">Unit {billing.unit || 'N/A'}</h4>
                                <p className="text-sm text-zinc-500">{billing.tenant.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-zinc-900 flex items-center">
                                <TbCurrencyPeso className="text-sm" />
                                {formatCurrency(billing.totalAmount)}
                              </div>
                              <div className="text-xs text-zinc-500">{formatDate(billing.dateIssued)}</div>
                            </div>
                          </div>
                          
                          {/* Billing breakdown */}
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <MdOutlineElectricBolt className="text-sm" />
                                Electric
                              </div>
                              <div className="font-medium text-sm text-zinc-800">₱{formatCurrency(billing.totalElectric)}</div>
                            </div>
                            <div className="bg-cyan-50 p-2 rounded-lg">
                              <div className="flex items-center gap-1 text-xs text-cyan-600">
                                <MdWaterDrop className="text-sm" />
                                Water
                              </div>
                              <div className="font-medium text-sm text-zinc-800">₱{formatCurrency(billing.totalWater)}</div>
                            </div>
                            <div className="bg-violet-50 p-2 rounded-lg">
                              <div className="text-xs text-violet-600">Rent</div>
                              <div className="font-medium text-sm text-zinc-800">₱{formatCurrency(billing.totalRent)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Maintenance Requests */}
                <div className='w-full flex flex-col p-2 px-3'>
                  <div className='w-full flex items-center justify-between mb-3'>
                    <h2 className='font-semibold text-lg md:text-xl'>Maintenance Requests</h2>
                    <button 
                      type="button" 
                      className='flex items-center gap-1 text-sm text-customViolet hover:underline'
                      onClick={() => newPage(4)}
                    >
                      View All <HiOutlineArrowNarrowRight />
                    </button>
                  </div>

                  {/* Urgency Summary Cards */}
                  <div className='grid grid-cols-4 gap-2 mb-4'>
                    {Object.entries(dashboardData.maintenanceSummary.byUrgency).map(([key, urgency]) => {
                      const colors = urgencyColors[urgency.color] || urgencyColors.blue;
                      return (
                        <div 
                          key={key}
                          className={`p-3 rounded-xl border ${colors.border} ${colors.bgLight} flex flex-col items-center`}
                        >
                          <span className={`text-2xl font-bold ${colors.text}`}>{urgency.count}</span>
                          <span className={`text-xs ${colors.text} font-medium`}>{urgency.label}</span>
                          <span className={`w-full h-1 rounded-full mt-2 ${colors.bg}`}></span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Pending Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <TbTool className="text-customViolet" />
                    <span className="text-sm text-zinc-600">
                      <strong className="text-customViolet">{dashboardData.maintenanceSummary.total}</strong> pending requests
                    </span>
                  </div>

                  {/* Recent Requests List */}
                  {dashboardData.maintenanceSummary.recentRequests.length > 0 && (
                    <div className='w-full flex flex-col gap-2'>
                      {dashboardData.maintenanceSummary.recentRequests.map((request) => {
                        const colors = urgencyColors[request.urgencyColor] || urgencyColors.blue;
                        return (
                          <div 
                            key={request.maintenanceId}
                            className="w-full border border-zinc-200 rounded-xl p-3 flex items-center gap-3"
                          >
                            <span className={`w-1 h-12 rounded-full ${colors.bg}`}></span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-zinc-900 truncate">{request.request}</p>
                              <p className="text-sm text-zinc-500">{request.property} • {request.tenant}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors.bgLight} ${colors.text}`}>
                                {request.urgency}
                              </span>
                              <p className="text-xs text-zinc-400 mt-1">{getTimeAgo(request.dateIssued)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 3: Properties & Feedbacks */}
                <div className='w-full flex flex-col p-2 px-3'>
                  <div className='w-full flex items-center justify-between mb-3'>
                    <h2 className='font-semibold text-lg md:text-xl'>Properties & Feedbacks</h2>
                    <button 
                      type="button" 
                      className='px-3 py-1.5 rounded-md text-sm border border-customViolet bg-customViolet/10 hover:bg-customViolet/50 focus:bg-customViolet focus:text-white ease-out duration-200'
                      onClick={() => newPage(14)}
                    >
                      Manage
                    </button>
                  </div>

                  {dashboardData.properties.length === 0 ? (
                    <div className="w-full bg-zinc-50 rounded-xl p-6 text-center">
                      <TbHome className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                      <p className="text-zinc-600">No properties found</p>
                    </div>
                  ) : (
                    <div className='w-full flex gap-3 overflow-x-auto pb-2'>
                      {dashboardData.properties.map((property) => (
                        <div 
                          key={property.propertyId}
                          className="min-w-[200px] border border-zinc-200 rounded-xl p-4 flex flex-col hover:border-customViolet/30 hover:shadow-sm transition-all"
                        >
                          {/* Property Header */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-customViolet/10 flex items-center justify-center">
                              <TbHome className="text-customViolet text-xl" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-zinc-900">{property.name}</h4>
                              <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <TbUsers className="text-sm" />
                                {property.currentTenants} tenant{property.currentTenants !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Feedback Stats */}
                          <div className="bg-zinc-50 rounded-lg p-3 mt-auto">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-zinc-600">Feedbacks</span>
                              <span className="font-semibold text-customViolet">{property.totalFeedbacks}</span>
                            </div>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1">
                              <TbStar className={`text-lg ${property.averageRating > 0 ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'}`} />
                              <span className="font-medium text-zinc-900">
                                {property.averageRating > 0 ? property.averageRating.toFixed(1) : 'N/A'}
                              </span>
                              {property.recentFeedbacks > 0 && (
                                <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  +{property.recentFeedbacks} new
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage