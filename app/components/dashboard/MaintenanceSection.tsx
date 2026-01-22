"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { TbTool } from 'react-icons/tb';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';

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

interface MaintenanceSectionProps {
  onViewAll: () => void;
  onUrgencyClick?: (urgency: string) => void;
  onRequestClick?: (maintenanceId: number) => void;
}

// Urgency color mapping
const urgencyColors: Record<string, { bg: string; bgLight: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  orange: { bg: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  red: { bg: 'bg-red-500', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const MaintenanceSection = ({ onViewAll, onUrgencyClick, onRequestClick }: MaintenanceSectionProps) => {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance');
      const data = await response.json();
      
      if (data.success) {
        // Transform the maintenance data
        const maintenances = data.maintenances || [];
        
        // Count by urgency
        const byUrgency: Record<string, MaintenanceByUrgency> = {
          critical: { count: 0, color: 'red', label: 'Critical' },
          high: { count: 0, color: 'orange', label: 'High' },
          medium: { count: 0, color: 'blue', label: 'Medium' },
          low: { count: 0, color: 'emerald', label: 'Low' },
        };

        const urgencyColorMap: Record<string, string> = {
          Critical: 'red',
          High: 'orange',
          Medium: 'blue',
          Low: 'emerald',
        };

        maintenances.forEach((m: any) => {
          const urgencyKey = m.urgency?.toLowerCase() || 'medium';
          if (byUrgency[urgencyKey]) {
            byUrgency[urgencyKey].count++;
          }
        });

        // Get recent requests (top 5)
        const recentRequests: RecentRequest[] = maintenances.slice(0, 5).map((m: any) => ({
          maintenanceId: m.maintenanceId,
          request: m.processedRequest || m.rawRequest,
          urgency: m.urgency,
          urgencyColor: urgencyColorMap[m.urgency] || 'blue',
          dateIssued: m.dateIssued,
          property: m.property?.name || 'Unknown',
          tenant: m.user ? `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() : 'Unknown',
        }));

        setMaintenanceData({
          total: maintenances.length,
          byUrgency,
          recentRequests,
        });
      } else {
        setError(data.error || 'Failed to fetch maintenance data');
      }
    } catch (err) {
      setError('Network error: Unable to fetch maintenance data');
      console.error('Error fetching maintenance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

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

  // Loading skeleton
  if (loading) {
    return (
      <div className='w-full flex flex-col p-2 px-3'>
        <div className='w-full flex items-center justify-between mb-3'>
          <div className="h-6 w-44 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Urgency cards skeleton */}
        <div className='grid grid-cols-4 gap-2 mb-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-[1.5rem] border border-gray-200 bg-gray-50 flex flex-col items-center">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Recent requests skeleton */}
        <div className='w-full flex flex-col gap-2'>
          {[1, 2].map((i) => (
            <div key={i} className="w-full border border-zinc-200 rounded-[1.5rem] p-4 flex items-center gap-3 bg-white">
              <div className="w-1 h-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
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
          <h2 className='font-semibold text-lg md:text-xl lg:text-lg'>Maintenance Requests</h2>
        </div>
        <div className="w-full bg-red-50 rounded-[1.5rem] p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchMaintenance}
            className="mt-2 text-sm text-customViolet hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!maintenanceData) return null;

  return (
    <div className='w-full flex flex-col p-2 px-3'>
      <div className='w-full flex items-center justify-between mb-3'>
        <h2 className='font-semibold text-lg md:text-xl lg:text-lg'>Maintenance Requests</h2>
        <button 
          type="button" 
          className='flex items-center gap-1 text-sm text-customViolet hover:underline'
          onClick={onViewAll}
        >
          View All <HiOutlineArrowNarrowRight />
        </button>
      </div>

      {/* Urgency Summary Cards - Clickable */}
      <div className='grid grid-cols-4 gap-2 mb-4'>
        {Object.entries(maintenanceData.byUrgency).map(([key, urgency]) => {
          const colors = urgencyColors[urgency.color] || urgencyColors.blue;
          const hasItems = urgency.count > 0;
          return (
            <button 
              key={key}
              type="button"
              onClick={() => onUrgencyClick?.(key)}
              disabled={!hasItems}
              className={`p-3 rounded-[1.5rem] border ${colors.border} ${colors.bgLight} flex flex-col items-center shadow-sm transition-all duration-200 ${
                hasItems 
                  ? 'cursor-pointer hover:scale-105 hover:shadow-md active:scale-95' 
                  : 'cursor-default opacity-60'
              }`}
            >
              <span className={`text-2xl font-bold ${colors.text}`}>{urgency.count}</span>
              <span className={`text-xs ${colors.text} font-medium`}>{urgency.label}</span>
              <span className={`w-full h-1 rounded-full mt-2 ${colors.bg}`}></span>
            </button>
          );
        })}
      </div>

      {/* Total Pending Badge */}
      <div className="flex items-center gap-2 mb-3">
        <TbTool className="text-customViolet" />
        <span className="text-sm text-zinc-600">
          <strong className="text-customViolet">{maintenanceData.total}</strong> pending requests
        </span>
      </div>

      {/* Recent Requests List */}
      {maintenanceData.recentRequests.length > 0 && (
        <div className='w-full flex flex-col gap-2'>
          {maintenanceData.recentRequests.map((request) => {
            const colors = urgencyColors[request.urgencyColor] || urgencyColors.blue;
            return (
              <button 
                key={request.maintenanceId}
                type="button"
                onClick={() => onRequestClick?.(request.maintenanceId)}
                className="w-full border border-zinc-200 rounded-[1.5rem] p-4 flex items-center gap-3 bg-white shadow-sm hover:border-customViolet/40 hover:shadow-md transition-all duration-200 cursor-pointer group text-left"
              >
                <span className={`w-1 h-12 rounded-full ${colors.bg} group-hover:w-1.5 transition-all`}></span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 truncate group-hover:text-customViolet transition-colors">{request.request}</p>
                  <p className="text-sm text-zinc-500">{request.property} • {request.tenant}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors.bgLight} ${colors.text}`}>
                    {request.urgency}
                  </span>
                  <p className="text-xs text-zinc-400 mt-1">{getTimeAgo(request.dateIssued)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MaintenanceSection;
