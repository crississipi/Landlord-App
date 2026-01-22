"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { TbCurrencyPeso, TbCheck } from 'react-icons/tb';
import { MdHome, MdOutlineElectricBolt, MdWaterDrop } from 'react-icons/md';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';

interface RecentBilling {
  billingID: number;
  unit: string | null;
  month: string | null;
  totalRent: number;
  totalWater: number;
  totalElectric: number;
  totalAmount: number;
  dateIssued: string;
  paymentStatus: string;
  tenant: {
    userID: number;
    name: string;
  };
  property: {
    propertyId: number;
    name: string;
  };
}

interface BillingSectionProps {
  onViewAll: () => void;
}

const BillingSection = ({ onViewAll }: BillingSectionProps) => {
  const [billings, setBillings] = useState<RecentBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/recent');
      const data = await response.json();
      
      if (data.success) {
        setBillings(data.billings || []);
      } else {
        setError(data.error || 'Failed to fetch billings');
      }
    } catch (err) {
      setError('Network error: Unable to fetch billings');
      console.error('Error fetching billings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className='w-full flex flex-col p-2 px-3'>
        <div className='w-full flex items-center justify-between mb-3'>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className='w-full flex flex-col gap-2'>
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full border border-zinc-200 rounded-[1.5rem] p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full flex flex-col p-2 px-3'>
        <div className='w-full flex items-center justify-between mb-3'>
          <h2 className='font-semibold text-lg md:text-xl lg:text-lg'>Billing Status</h2>
        </div>
        <div className="w-full bg-red-50 rounded-[1.5rem] p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchBillings}
            className="mt-2 text-sm text-customViolet hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full flex flex-col p-2 px-3'>
      <div className='w-full flex items-center justify-between mb-3'>
        <h2 className='font-semibold text-lg md:text-xl lg:text-lg'>Billing Status</h2>
        <button 
          type="button" 
          className='flex items-center gap-1 text-sm text-customViolet hover:underline'
          onClick={onViewAll}
        >
          View All <HiOutlineArrowNarrowRight />
        </button>
      </div>
      
      {billings.length === 0 ? (
        <div className="w-full bg-zinc-50 rounded-[1.5rem] p-6 text-center">
          <TbCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-zinc-600">No recent billings</p>
        </div>
      ) : (
        <div className='w-full flex flex-col gap-2'>
          {billings.slice(0, 5).map((billing) => (
            <div 
              key={billing.billingID} 
              className="w-full border border-zinc-200 rounded-[1.5rem] p-4 hover:border-customViolet/30 transition-colors bg-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-customViolet flex items-center justify-center shadow-md shadow-customViolet/20">
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
                <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <MdOutlineElectricBolt className="text-sm" />
                    Electric
                  </div>
                  <div className="font-medium text-sm text-zinc-800">₱{formatCurrency(billing.totalElectric)}</div>
                </div>
                <div className="bg-cyan-50 p-2 rounded-xl border border-cyan-100">
                  <div className="flex items-center gap-1 text-xs text-cyan-600">
                    <MdWaterDrop className="text-sm" />
                    Water
                  </div>
                  <div className="font-medium text-sm text-zinc-800">₱{formatCurrency(billing.totalWater)}</div>
                </div>
                <div className="bg-violet-50 p-2 rounded-xl border border-violet-100">
                  <div className="text-xs text-violet-600">Rent</div>
                  <div className="font-medium text-sm text-zinc-800">₱{formatCurrency(billing.totalRent)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillingSection;
