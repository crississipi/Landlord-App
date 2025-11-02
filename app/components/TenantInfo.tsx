"use client";
import { ChangePageProps } from '@/types';
import React, { useState } from 'react';
import { 
  AiOutlineDelete, 
  AiOutlineDown, 
  AiOutlineEdit, 
  AiOutlineMan, 
  AiOutlineWoman,
  AiOutlineUpload, 
  AiOutlineUser 
} from 'react-icons/ai';
import { TbCurrencyPeso } from 'react-icons/tb';
import { TitleButton } from './customcomponents';
import Image from 'next/image';

interface TenantInfoProps extends ChangePageProps {
  tenant: any;
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
  resources?: { 
    url: string; 
    fileName?: string; 
    resourceId?: number;
    type?: string;
  }[];
}

const TenantInfo = ({ setPage, tenant }: TenantInfoProps) => {
  // Safe tenant data with fallbacks
  const tenantData: TenantData = tenant || {
    userID: 0,
    firstName: '',
    lastName: '',
    middleInitial: '',
    sex: '',
    age: null,
    birthDate: '',
    email: '',
    firstNumber: '',
    secondNumber: '',
    unitNumber: '',
    moveInDate: '',
    created_at: '',
    rentAmount: 0
  };

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
    // Remove +63 if present and format
    return phone.replace('+63', '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const getGenderIcon = () => {
    return tenantData.sex?.toLowerCase() === 'female' ? 
      <AiOutlineWoman /> : <AiOutlineMan />;
  };

  // Get profile image (first resource or resource with type 'profile')
  const getProfileImage = () => {
    if (!tenantData.resources || tenantData.resources.length === 0) return null;
    
    const profileResource = tenantData.resources.find(res => 
      res.type === 'profile' || res.fileName?.includes('profile')
    ) || tenantData.resources[0];
    
    return profileResource.url;
  };

  // Get credential images (all resources except profile)
  const getCredentialImages = () => {
    if (!tenantData.resources || tenantData.resources.length === 0) return [];
    
    return tenantData.resources.filter(res => 
      !res.type?.includes('profile') && !res.fileName?.includes('profile')
    );
  };

  const profileImage = getProfileImage();
  const credentialImages = getCredentialImages();

  return (
    <div className='max__size flex flex-col px-5 gap-3 text-customViolet py-3 overflow-hidden bg-white rounded-t-2xl'>
      <TitleButton setPage={setPage} title="Tenant Information" />
      
      <div className='h-full w-full flex flex-col gap-5 overflow-x-hidden'>
        <h2 className='h2__style mr-auto md:mt-5'>Personal Information</h2>
        
        {/* Profile Image */}
        <div className='h-auto w-full flex__center__all py-2'>
          <div className='relative rounded-full bg-customViolet h-24 w-24 md:h-28 md:w-28 overflow-hidden'>
            {profileImage ? (
              <Image
                src={profileImage}
                alt={`${tenantData.firstName} ${tenantData.lastName}`}
                fill
                className="object-cover h-full w-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex__center__all h-full w-full">
                <AiOutlineUser className="h-12 w-12 text-white md:h-16 md:w-16" />
              </div>
            )}
          </div>
        </div>

        {/* Personal Information Form */}
        <div className='primary__btn__holder text-sm md:text-base'>
          <input 
            type="text" 
            value={tenantData.lastName || ''}
            placeholder='Last Name'
            className='col-span-6 text__overflow input__text main__input'
            disabled
          />
          <input 
            type="text" 
            value={tenantData.firstName || ''}
            placeholder='First Name'
            className='col-span-6 text__overflow input__text main__input'
            disabled
          />
          <input 
            type="text" 
            value={tenantData.middleInitial || ''}
            placeholder='M.I.'
            className='col-span-2 text__overflow input__text main__input text-center md:col-span-1'
            disabled
          />
          <div className='col-span-2 text__overflow input__text main__input flex__center__all md:col-span-1'>
            {getGenderIcon()}
          </div>
          <input 
            type="number" 
            value={tenantData.age || ''}
            placeholder='Age'
            min={0}
            className='col-span-2 text__overflow input__text main__input text-center md:col-span-1'
            disabled
          />
          <input 
            type="date" 
            value={tenantData.birthDate || ''}
            className='col-span-6 text__overflow input__text main__input md:col-span-6'
            disabled
          />
          <div className='col-span-4 text__overflow input__text main__input md:col-span-3'>
            <p>Unit No: {tenantData.unitNumber || 'N/A'}</p>
          </div>
          <input 
            type="email" 
            value={tenantData.email || ''}
            placeholder='Email'
            className='col-span-8 text__overflow input__text main__input md:col-span-7'
            disabled
          />
          <div className='col-span-6 text__overflow input__text main__input flex gap-3 md:col-span-5'>
            <span className='font-medium'>+63</span>
            <input 
              type="text" 
              value={formatPhoneNumber(tenantData.firstNumber)}
              className='text__overflow input__text w-full bg-transparent'
              placeholder='9xx xxx xxxx'
              disabled
            />
          </div>
          <div className='col-span-6 bg-zinc-100 py-3 px-5 tracking-wide flex gap-3 md:col-span-5'>
            <span className='font-medium'>+63</span>
            <input 
              type="text" 
              value={formatPhoneNumber(tenantData.secondNumber)}
              className='outline-none placeholder:text-customViolet/70 w-full bg-transparent'
              placeholder='9xx xxx xxxx'
              disabled
            />
          </div>
          <div className='col-span-8 text__overflow main__input md:col-span-4'>
            <p>Renting Since: {formatRentSince(tenantData.moveInDate)}</p>
          </div>
          <div className='col-span-4 text__overflow main__input md:col-span-3'>
            <p className='flex__center__y'>
              Rent: 
              <TbCurrencyPeso className='text-xs ml-1 text-emerald-700'/>
              <span className='text-emerald-700'>
                {formatCurrency(tenantData.rentAmount || 0)}
              </span>
            </p>
          </div>
        </div>

        {/* Property Information */}
        {tenantData.property && (
          <>
            <h2 className='h2__style mr-auto mt-5'>Property Information</h2>
            <div className='primary__btn__holder text-sm md:text-base'>
              <div className='col-span-12 text__overflow input__text main__input'>
                <p><strong>Property:</strong> {tenantData.property.name}</p>
              </div>
              <div className='col-span-12 text__overflow input__text main__input'>
                <p><strong>Address:</strong> {tenantData.property.address}</p>
              </div>
            </div>
          </>
        )}

        {/* Credentials Section */}
        <h2 className='h2__style mr-auto mt-5'>Credentials</h2>
        <div className='primary__btn__holder md:gap-5'>
          {/* Credential 1 */}
          <div className='col-span-6 rounded-sm bg-zinc-100 h-40 flex flex-col relative md:col-span-4 md:h-52 shadow-sm overflow-hidden'>
            {credentialImages[0] ? (
              <div className="relative w-full h-full">
                <Image
                  src={credentialImages[0].url}
                  alt={`Credential 1 - ${credentialImages[0].fileName || 'ID Document'}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to upload UI if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <span className='flex__center__all h-full w-full text-xs flex-col text-customViolet/70 bg-slate-50 outline-none group md:text-base'>
                <AiOutlineUpload className='text-5xl group-focus:text-6xl md:text-6xl'/>
                No Image Uploaded
              </span>
            )}
          </div>

          {/* Credential 2 */}
          <div className='col-span-6 rounded-sm bg-zinc-100 h-40 flex flex-col relative md:col-span-4 md:h-52 shadow-sm overflow-hidden'>
            {credentialImages[1] ? (
              <div className="relative w-full h-full">
                <Image
                  src={credentialImages[1].url}
                  alt={`Credential 2 - ${credentialImages[1].fileName || 'ID Document'}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to upload UI if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <span className='flex__center__all h-full w-full text-xs flex-col text-customViolet/70 bg-slate-50 outline-none group md:text-base'>
                <AiOutlineUpload className='text-5xl group-focus:text-6xl md:text-6xl'/>
                No Image Uploaded
              </span>
            )}
          </div>

          {/* Additional Credentials (if more than 2) */}
          {credentialImages.slice(2).map((credential, index) => (
            <div key={index + 2} className='col-span-6 rounded-sm bg-zinc-100 h-40 flex flex-col relative md:col-span-4 md:h-52 shadow-sm overflow-hidden'>
              <div className="relative w-full h-full">
                <Image
                  src={credential.url}
                  alt={`Credential ${index + 3} - ${credential.fileName || 'ID Document'}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className='primary__btn__holder mt-5 md:flex md:items-center md:justify-center md:mt-10 md:gap-5'>
          <button className='col-span-6 primary__btn click__action hover__action focus__action flex__center__all md:min-w-[200px] md:gap-3 hover:bg-customViolet/90 transition-colors'>
            <AiOutlineEdit className='text-xl'/> 
            Edit
          </button>
          <button className='col-span-6 primary__btn click__action hover__action focus__action flex__center__all md:min-w-[200px] md:gap-3 hover:bg-rose-600 transition-colors group'>
            <AiOutlineDelete className='text-xl group-hover:text-rose-100'/> 
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantInfo;