"use client"

import React, { useState, useEffect } from 'react'
import { RiEdit2Line, RiStarFill, RiStarLine } from 'react-icons/ri';
import { TbCurrencyPeso } from 'react-icons/tb'
import DropDownBtn from './customcomponents/DropDownBtn';
import { ChangePageProps } from '@/types';
import { HiArrowSmallLeft, HiOutlinePlusSmall } from 'react-icons/hi2';

interface ManagePropertyProps extends ChangePageProps {
  onEditProperty?: (property: Property) => void;
  highlightPropertyId?: number;
}

interface Feedback {
  feedbackID: number;
  ratings: number;
  message: string;
  dateIssued: string;
  userName: string;
}

interface PropertyImage {
  resourceId: number;
  url: string;
  fileName: string;
}

interface Property {
  propertyId: number;
  name: string;
  rent: number;
  area: number;
  address: string;
  description: string;
  yearBuilt: number;
  renovated: boolean;
  currentTenants: number;
  isAvailable: boolean;
  images: PropertyImage[];
  feedbacks: Feedback[];
  totalFeedbacks: number;
  averageRating: number;
}

const ManageProperty = ({ setPage, onEditProperty, highlightPropertyId }: ManagePropertyProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSort, setFeedbackSort] = useState('Latest');
  const [highlightedId, setHighlightedId] = useState<number | undefined>(highlightPropertyId);

  // Clear highlight after 3 seconds and scroll to highlighted property
  useEffect(() => {
    if (highlightedId) {
      // Scroll to the highlighted property after a brief delay for render
      setTimeout(() => {
        const element = document.getElementById(`property-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Clear highlight after 3 seconds
      const timer = setTimeout(() => setHighlightedId(undefined), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  // Handle edit button click
  const handleEditClick = (property: Property) => {
    if (onEditProperty) {
      onEditProperty(property);
    } else {
      setPage(15);
    }
  };

  // Fetch properties with feedbacks
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/properties/with-feedbacks');
        const data = await response.json();
        
        if (data.success) {
          setProperties(data.properties);
        } else {
          setError(data.error || 'Failed to fetch properties');
        }
      } catch (err) {
        setError('Network error: Unable to fetch properties');
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  };

  // Render star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      return (
        <span key={index} className={starValue <= rating ? 'text-amber-400' : 'text-gray-300'}>
          {starValue <= rating ? <RiStarFill /> : <RiStarLine />}
        </span>
      );
    });
  };

  // Sort feedbacks based on selected option
  const getSortedFeedbacks = (feedbacks: Feedback[]) => {
    const sorted = [...feedbacks];
    switch (feedbackSort) {
      case 'Latest':
        return sorted.sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());
      case 'Oldest':
        return sorted.sort((a, b) => new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime());
      case 'All':
      default:
        return sorted;
    }
  };

  if (loading) {
    return (
      <div className='max__size px-5 py-3 gap-5 text-customViolet flex flex-col items-start overflow-hidden bg-white rounded-t-2xl'>
        <div className='w-full flex items-center justify-between mt-10 gap-3'>
          <button type="button" className='text-4xl' onClick={() => setPage(0)}>
            <HiArrowSmallLeft />
          </button>
          <h1 className='font-poppins text-xl font-light w-full text-left'>Manage Properties</h1>
          <button type="button" className='px-3 pl-2 py-2 rounded-md text-sm border border-customViolet/50 flex items-center gap-1 opacity-50'>
            <HiOutlinePlusSmall className='text-xl'/>New
          </button>
        </div>
        <div className="w-full flex justify-center py-20">
          <div className="text-customViolet/70 text-lg">Loading properties...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max__size px-5 py-3 gap-5 text-customViolet flex flex-col items-start overflow-hidden bg-white rounded-t-2xl'>
        <div className='w-full flex items-center justify-between mt-10 gap-3'>
          <button type="button" className='text-4xl' onClick={() => setPage(0)}>
            <HiArrowSmallLeft />
          </button>
          <h1 className='font-poppins text-xl font-light w-full text-left'>Manage Properties</h1>
          <button type="button" className='px-3 pl-2 py-2 rounded-md text-sm border border-customViolet/50 flex items-center gap-1 opacity-50'>
            <HiOutlinePlusSmall className='text-xl'/>New
          </button>
        </div>
        <div className="w-full flex justify-center py-20">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='max__size px-5 py-3 gap-5 text-customViolet flex flex-col items-start overflow-hidden bg-white lg:bg-gray-50 rounded-t-2xl lg:rounded-none'>
      <div className='w-full flex items-center justify-between mt-10 lg:mt-4 gap-3 text-customViolet lg:text-gray-800'>
        <button type="button" className='text-4xl lg:text-3xl hover:opacity-80 transition-opacity' onClick={() => setPage(0)}>
          <HiArrowSmallLeft />
        </button>
        <h1 className='font-poppins text-xl lg:text-xl font-light lg:font-semibold w-full text-left'>Manage Properties</h1>
        <button type="button" className='px-3 pl-2 py-2 rounded-md text-sm border border-customViolet/50 lg:border-customViolet lg:bg-customViolet lg:text-white flex items-center gap-1 hover:bg-customViolet/50 lg:hover:bg-customViolet/90 focus:bg-customViolet focus:text-white ease-out duration-200' onClick={() => setPage(15)}>
          <HiOutlinePlusSmall className='text-xl'/>New
        </button>
      </div>
      
      {properties.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl text-customViolet/30 mb-4">🏠</div>
          <h3 className="text-lg font-medium text-customViolet mb-2">No Properties Found</h3>
          <p className="text-customViolet/70 mb-6 text-sm">Get started by adding your first property</p>
          <button 
            type="button" 
            className='px-4 py-3 rounded-md text-sm border border-customViolet bg-customViolet text-white hover:bg-customViolet/90 focus:bg-customViolet/80 ease-out duration-200 flex items-center gap-2'
            onClick={() => setPage(15)}
          >
            <HiOutlinePlusSmall className='text-lg'/> Add First Property
          </button>
        </div>
      ) : (
        <div className='w-full h-full flex gap-3 overflow-x-auto flex-nowrap pb-5 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:overflow-visible lg:flex-wrap lg:gap-6'>
          {properties.map((property) => (
            <div 
              key={property.propertyId} 
              id={`property-${property.propertyId}`}
              className={`h-auto min-w-[90vw] lg:min-w-0 lg:w-full flex flex-col relative overflow-x-hidden group bg-white rounded-lg border shadow-sm lg:hover:shadow-md transition-all duration-500 ${
                highlightedId === property.propertyId 
                  ? 'border-customViolet border-2 ring-4 ring-customViolet/30 shadow-lg scale-[1.02]' 
                  : 'border-customViolet/20 lg:border-gray-200'
              }`}
            >
              {/* Property Image/Header */}
              <div className={`w-full aspect-square lg:aspect-video ${property.images.length === 0 ? (property.isAvailable ? 'bg-green-200' : 'bg-customViolet/70') : ''} relative overflow-hidden`}>
                {property.images.length > 0 ? (
                  <img 
                    src={property.images[0].url} 
                    alt={property.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🏠</span>
                  </div>
                )}
                {/* Edit Button on Hover */}
                <div className='hidden group-hover:flex group-focus:flex absolute inset-0 bg-black/20 z-50 items-center justify-center transition-all duration-200'>
                  <button
                    type="button"
                    className="h-16 w-16 rounded-md p-1 text-white/50 border-4 border-white/50 hover:border-white/70 hover:text-white/70 focus:border-white focus:text-white ease-out duration-200"
                    onClick={() => handleEditClick(property)}
                  >
                    <RiEdit2Line className="h-full w-full" />
                  </button>
                </div>
              </div>
              
              {/* Property Details */}
              <div className='h-max w-full flex items-center justify-between mt-3 px-4'>
                <span className='flex flex-col justify-center leading-5'>
                  <h3 className='text-lg font-semibold'>{property.name}</h3>
                  <p className='text-xs text-gray-600'>{property.address}</p>
                  <h4 className='flex mt-1 gap-1 text-xs text-gray-500'>
                    <strong className='font-semibold'>{property.area}</strong> sqm.
                    {property.renovated && <span className='ml-2 text-green-600'>• Renovated</span>}
                  </h4>
                </span>
                <span className='flex flex-col items-end'>
                  <h4 className='flex items-center text-sm'>
                    <TbCurrencyPeso className='text-lg'/>
                    <strong className='text-lg font-semibold'>{formatCurrency(property.rent)}</strong>
                    <span className='text-[10px] ml-1'>/month</span>
                  </h4>
                  <p className={`text-[10px] mt-1 ${property.isAvailable ? 'text-green-600 font-medium' : 'text-orange-600'}`}>
                    <em>{property.isAvailable ? "Available" : `Occupied (${property.currentTenants} tenant${property.currentTenants !== 1 ? 's' : ''})`}</em>
                  </p>
                </span>
              </div>

              {/* Feedbacks Section */}
              <div className='w-full flex flex-col px-4 mt-4'>
                <span className='w-full flex items-center justify-between'>
                  <h4 className='text-base font-medium'>Feedbacks</h4>
                  <DropDownBtn 
                    list={['Latest', 'Oldest', 'All']} 
                    onSelect={(selected) => setFeedbackSort(selected)}
                  />
                </span>
                
                {property.feedbacks.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center py-8 text-center border-b border-customViolet/30">
                    <div className="text-4xl text-customViolet/30 mb-2">💬</div>
                    <p className="text-customViolet/70 text-xs">No feedbacks yet</p>
                    <p className="text-customViolet/50 text-[10px] mt-1">Tenants haven't left any reviews</p>
                  </div>
                ) : (
                  <div className='w-full flex flex-col gap-2 mt-2'>
                    {/* Overall Rating Summary */}
                    <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-amber-400">
                          {property.averageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-1 text-sm">
                          {renderStars(property.averageRating)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {property.totalFeedbacks} review{property.totalFeedbacks !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Individual Feedbacks */}
                    {getSortedFeedbacks(property.feedbacks).slice(0, 5).map((feedback) => (
                      <div key={feedback.feedbackID} className='w-full flex flex-col bg-white border-b border-customViolet/30 py-3 last:border-b-0'>
                        <div className='w-full flex items-center justify-between mb-2'>
                          <span className='flex gap-1 items-center text-amber-400 text-xs'>
                            {renderStars(feedback.ratings)}
                            <span className='font-medium ml-1'>
                              {feedback.ratings.toFixed(1)}/<span className='font-light'>5</span>
                            </span>
                          </span>
                          <h5 className="text-[10px] text-gray-500">{formatDate(feedback.dateIssued)}</h5>
                        </div>
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed">{feedback.message}</p>
                        <div className='flex items-center gap-2'>
                          <span className='h-6 w-6 rounded-full bg-customViolet/20 flex items-center justify-center text-[10px] text-customViolet font-medium'>
                            {feedback.userName.charAt(0).toUpperCase()}
                          </span>
                          <h3 className="text-xs font-medium text-customViolet">{feedback.userName}</h3>
                        </div>
                      </div>
                    ))}
                    
                    {property.feedbacks.length > 5 && (
                      <div className="text-center pt-2">
                        <button className="text-xs text-customViolet/70 hover:text-customViolet transition-colors">
                          + {property.feedbacks.length - 5} more feedback{property.feedbacks.length - 5 !== 1 ? 's' : ''}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManageProperty