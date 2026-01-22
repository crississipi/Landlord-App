"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { TbHome, TbStar, TbUsers } from 'react-icons/tb';

interface PropertyWithFeedback {
  propertyId: number;
  name: string;
  currentTenants: number;
  totalFeedbacks: number;
  recentFeedbacks: number;
  averageRating: number;
}

interface PropertiesSectionProps {
  onManage: () => void;
}

const PropertiesSection = ({ onManage }: PropertiesSectionProps) => {
  const [properties, setProperties] = useState<PropertyWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties/with-feedbacks');
      const data = await response.json();
      
      if (data.success) {
        // Transform to summary format
        const propertySummary: PropertyWithFeedback[] = (data.properties || []).map((p: any) => ({
          propertyId: p.propertyId,
          name: p.name,
          currentTenants: p.currentTenants || 0,
          totalFeedbacks: p.totalFeedbacks || 0,
          recentFeedbacks: p.feedbacks?.filter((f: any) => {
            const feedbackDate = new Date(f.dateIssued);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return feedbackDate >= weekAgo;
          }).length || 0,
          averageRating: p.averageRating || 0,
        }));
        
        setProperties(propertySummary);
      } else {
        setError(data.error || 'Failed to fetch properties');
      }
    } catch (err) {
      setError('Network error: Unable to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Loading skeleton
  if (loading) {
    return (
      <div className='w-full flex flex-col p-2 px-3'>
        <div className='w-full flex items-center justify-between mb-3'>
          <div className="h-6 w-44 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
        
        <div className='w-full flex gap-3 overflow-x-auto pb-2'>
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="min-w-[200px] border border-zinc-200 rounded-[1.5rem] p-4 flex flex-col bg-white"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 mt-auto border border-zinc-100">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
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
          <h2 className='font-semibold text-lg md:text-xl lg:text-lg'>Properties & Feedbacks</h2>
        </div>
        <div className="w-full bg-red-50 rounded-[1.5rem] p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchProperties}
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
        <h2 className='font-semibold text-lg md:text-xl lg:text-lg'>Properties & Feedbacks</h2>
        <button 
          type="button" 
          className='px-3 py-1.5 rounded-full text-sm border border-customViolet bg-customViolet/10 hover:bg-customViolet/50 focus:bg-customViolet focus:text-white ease-out duration-200'
          onClick={onManage}
        >
          Manage
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="w-full bg-zinc-50 rounded-[1.5rem] p-6 text-center">
          <TbHome className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
          <p className="text-zinc-600">No properties found</p>
        </div>
      ) : (
        <div className='w-full flex gap-3 overflow-x-auto pb-2'>
          {properties.map((property) => (
            <div 
              key={property.propertyId}
              className="min-w-[200px] border border-zinc-200 rounded-[1.5rem] p-4 flex flex-col hover:border-customViolet/30 hover:shadow-sm transition-all bg-white"
            >
              {/* Property Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-customViolet/10 flex items-center justify-center">
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
              <div className="bg-zinc-50 rounded-xl p-3 mt-auto border border-zinc-100">
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
  );
};

export default PropertiesSection;
