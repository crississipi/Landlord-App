"use client";
import { ChangePageProps } from '@/types';
import React, { useState, useEffect } from 'react';
import { 
  AiOutlineDelete, 
  AiOutlineMan, 
  AiOutlineWoman,
  AiOutlineUpload, 
  AiOutlineUser,
  AiOutlineDownload,
  AiOutlineFileText
} from 'react-icons/ai';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { TitleButton } from './customcomponents';
import Image from 'next/image';

interface TenantInfoProps extends ChangePageProps {
  tenant?: any;
  chatUserId?: number;
  fromChatInfo?: boolean;
}

interface TenantData {
  userID: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  middleInitial: string | null;
  sex: string | null;
  age: number | null;
  birthDate: string | null;
  email: string | null;
  firstNumber: string | null;
  secondNumber: string | null;
  created_at: Date | null;
  property?: {
    propertyId: number;
    name: string;
    address: string;
    rent: number;
  } | null;
  phoneNumber: string | null;
  unitNumber: string | null;
  moveInDate: string | null;
  rentAmount: number;
  signedContractUrl?: string | null;
  signedRulesUrl?: string | null;
  profileImage?: string | null;
  primaryId?: string | null;
  secondaryId?: string | null;
  resources?: { 
    url: string; 
    fileName?: string; 
    resourceId?: number;
    type?: string;
  }[];
}

const TenantInfo = ({ setPage, tenant, chatUserId, fromChatInfo }: TenantInfoProps) => {
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (chatUserId) {
      fetchTenantData(chatUserId);
    } else if (tenant) {
      setTenantData(tenant);
    }
  }, [chatUserId, tenant]);

  const fetchTenantData = async (userId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTenantData(data);
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      setError('Failed to load tenant information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  const handleBack = () => {
    if (fromChatInfo) {
      setPage(9, chatUserId);
    } else {
      setPage(5);
    }
  };

  if (loading) {
    return (
      <div className='max__size flex flex-col px-5 gap-3 text-customViolet py-3 overflow-hidden bg-white rounded-t-2xl'>
        <TitleButton setPage={handleBack} title="Tenant Information" />
        <div className='flex justify-center py-12'>
          <div className="w-8 h-8 border-3 border-customViolet border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className='max__size flex flex-col px-5 gap-3 text-customViolet py-3 overflow-hidden bg-white rounded-t-2xl'>
        <TitleButton setPage={handleBack} title="Tenant Information" />
        <div className='flex justify-center py-12'>
          <p className='text-zinc-500'>No tenant data available</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatRentSince = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return '';
    return phone.replace('+63', '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const getGenderIcon = () => {
    return tenantData.sex?.toLowerCase() === 'female' ? 
      <AiOutlineWoman /> : <AiOutlineMan />;
  };

  // Use the direct properties from API response
  const profileImage = tenantData.profileImage || null;
  const primaryId = tenantData.primaryId || null;
  const secondaryId = tenantData.secondaryId || null;

  return (
    <div className='max__size flex flex-col px-5 md:px-8 lg:px-12 gap-3 md:gap-5 text-customViolet py-3 md:py-5 overflow-hidden bg-white lg:bg-gray-50 rounded-t-2xl lg:rounded-none'>
      <div className="lg:hidden">
        <TitleButton setPage={handleBack} title="Tenant Information" />
      </div>
      <h1 className="hidden lg:block text-2xl lg:text-xl font-semibold text-gray-800 mb-4">Tenant Information</h1>
      
      {error && (
        <div className='w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm'>
          {error}
        </div>
      )}
      {success && (
        <div className='w-full bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl text-sm'>
          {success}
        </div>
      )}
      
      <div className='h-full w-full flex flex-col gap-5 md:gap-6 lg:gap-6 overflow-y-auto overflow-x-hidden pb-5 max-w-6xl mx-auto custom-scrollbar'>
        <h2 className='h2__style mr-auto md:mt-5 text-xl md:text-2xl lg:text-xl'>Personal Information</h2>
        
        {/* Profile Image */}
        <div className='h-auto w-full flex__center__all py-2 md:py-4'>
          <div className='relative rounded-full bg-gradient-to-br from-indigo-500 to-customViolet h-24 w-24 md:h-32 md:w-32 lg:h-28 lg:w-28 overflow-hidden flex items-center justify-center text-white text-3xl md:text-4xl lg:text-4xl font-bold hover:scale-105 transition-transform'>
            {profileImage ? (
              <Image
                src={profileImage}
                alt={`${tenantData.firstName} ${tenantData.lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <AiOutlineUser className="h-12 w-12 md:h-16 md:w-16" />
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className='primary__btn__holder text-sm md:text-base lg:text-sm'>
          <input type="text" value={tenantData.lastName || ''} placeholder='Last Name' className='col-span-6 lg:col-span-4 text__overflow input__text main__input' disabled />
          <input type="text" value={tenantData.firstName || ''} placeholder='First Name' className='col-span-6 lg:col-span-4 text__overflow input__text main__input' disabled />
          <input type="text" value={tenantData.middleInitial || ''} placeholder='M.I.' className='col-span-2 lg:col-span-2 text__overflow input__text main__input text-center md:col-span-1' disabled />
          <div className='col-span-2 lg:col-span-1 text__overflow input__text main__input flex__center__all md:col-span-1'>{getGenderIcon()}</div>
          <input type="number" value={tenantData.age || ''} placeholder='Age' className='col-span-2 lg:col-span-1 text__overflow input__text main__input text-center md:col-span-1' disabled />
          <input type="date" value={tenantData.birthDate || ''} className='col-span-6 lg:col-span-3 text__overflow input__text main__input md:col-span-6' disabled />
          <div className='col-span-4 lg:col-span-3 text__overflow input__text main__input md:col-span-3'><p>Unit No: {tenantData.unitNumber || 'N/A'}</p></div>
          <input type="email" value={tenantData.email || ''} placeholder='Email' className='col-span-8 lg:col-span-6 text__overflow input__text main__input md:col-span-7' disabled />
          <div className='col-span-6 lg:col-span-3 text__overflow input__text main__input flex gap-3 md:col-span-5'>
            <span className='font-medium'>+63</span>
            <input type="text" value={formatPhoneNumber(tenantData.firstNumber)} className='text__overflow input__text w-full bg-transparent' placeholder='9xx xxx xxxx' disabled />
          </div>
          <div className='col-span-6 lg:col-span-3 bg-zinc-100 py-3 px-5 tracking-wide flex gap-3 md:col-span-5'>
            <span className='font-medium'>+63</span>
            <input type="text" value={formatPhoneNumber(tenantData.secondNumber)} className='outline-none placeholder:text-customViolet/70 w-full bg-transparent' placeholder='9xx xxx xxxx' disabled />
          </div>
          <div className='col-span-8 lg:col-span-3 text__overflow main__input md:col-span-4'><p>Renting Since: {formatRentSince(tenantData.moveInDate)}</p></div>
          <div className='col-span-4 lg:col-span-3 text__overflow main__input md:col-span-3'>
            <p className='flex__center__y'>Rent: <span className='text-emerald-700'>{formatCurrency(tenantData.rentAmount || 0)}</span></p>
          </div>
        </div>

        {/* Property Information */}
        {tenantData.property && (
          <>
            <h2 className='h2__style mr-auto mt-5'>Property Information</h2>
            <div className='primary__btn__holder text-sm md:text-base lg:text-sm'>
              <div className='col-span-12 text__overflow input__text main__input'><p><strong>Property:</strong> {tenantData.property.name}</p></div>
              <div className='col-span-12 text__overflow input__text main__input'><p><strong>Address:</strong> {tenantData.property.address}</p></div>
            </div>
          </>
        )}

        {/* Credentials Section */}
        <h2 className='h2__style mr-auto mt-5 text-xl md:text-2xl lg:text-xl'>ID Credentials</h2>
        <div className='primary__btn__holder md:gap-5 lg:gap-6'>
          {/* Primary ID */}
          <div className='col-span-6 rounded-xl bg-zinc-100 h-40 flex flex-col relative md:col-span-4 lg:col-span-6 md:h-52 lg:h-44 shadow-sm overflow-hidden'>
            {primaryId ? (
              <div className="relative w-full h-full">
                <Image src={primaryId} alt="Primary ID" fill className="object-cover" />
              </div>
            ) : (
              <span className='flex__center__all h-full w-full text-xs flex-col text-customViolet/70 bg-slate-50'>
                <AiOutlineUpload className='text-5xl md:text-6xl'/>No Primary ID Uploaded
              </span>
            )}
          </div>
          
          {/* Secondary ID */}
          <div className='col-span-6 rounded-xl bg-zinc-100 h-40 flex flex-col relative md:col-span-4 lg:col-span-6 md:h-52 lg:h-44 shadow-sm overflow-hidden'>
            {secondaryId ? (
              <div className="relative w-full h-full">
                <Image src={secondaryId} alt="Secondary ID" fill className="object-cover" />
              </div>
            ) : (
              <span className='flex__center__all h-full w-full text-xs flex-col text-customViolet/70 bg-slate-50'>
                <AiOutlineUpload className='text-5xl md:text-6xl'/>No Secondary ID Uploaded
              </span>
            )}
          </div>
        </div>

        {/* Signed Documents */}
        <div className='mt-5'>
          <h2 className='h2__style mb-3'>Signed Documents</h2>
          <div className='flex flex-col lg:grid lg:grid-cols-2 gap-3'>
            {tenantData.signedContractUrl ? (
              <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center'><HiOutlineDocumentText className='text-2xl text-white' /></div>
                  <div><h4 className='font-semibold text-zinc-900'>Signed Contract</h4><p className='text-sm text-zinc-600'>Rental agreement document</p></div>
                </div>
                <button onClick={() => handleDownloadDocument(tenantData.signedContractUrl!, 'Signed_Contract.pdf')} className='px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2'><AiOutlineDownload className='text-lg' />Download</button>
              </div>
            ) : (
              <div className='bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center'><AiOutlineFileText className='text-4xl text-zinc-400 mx-auto mb-2' /><p className='text-sm text-zinc-500'>No signed contract available</p></div>
            )}

            {tenantData.signedRulesUrl ? (
              <div className='bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center'><HiOutlineDocumentText className='text-2xl text-white' /></div>
                  <div><h4 className='font-semibold text-zinc-900'>Signed Rules</h4><p className='text-sm text-zinc-600'>House rules agreement</p></div>
                </div>
                <button onClick={() => handleDownloadDocument(tenantData.signedRulesUrl!, 'Signed_Rules.pdf')} className='px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 flex items-center gap-2'><AiOutlineDownload className='text-lg' />Download</button>
              </div>
            ) : (
              <div className='bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center'><AiOutlineFileText className='text-4xl text-zinc-400 mx-auto mb-2' /><p className='text-sm text-zinc-500'>No signed rules available</p></div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='primary__btn__holder mt-5 md:flex md:items-center md:justify-center md:mt-10 md:gap-5'>
          <button className='col-span-12 primary__btn click__action hover__action focus__action flex__center__all md:min-w-[200px] md:gap-3 hover:bg-rose-600 transition-colors group'>
            <AiOutlineDelete className='text-xl group-hover:text-rose-100'/> Delete Tenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantInfo;
