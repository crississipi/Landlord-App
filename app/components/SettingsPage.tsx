'use client';

import { ChangePageProps } from '@/types'
import React, { useState, useEffect, useCallback } from 'react'
import { TitleButton } from './customcomponents'
import { AiOutlineUser } from 'react-icons/ai'
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi'
import { signOut } from 'next-auth/react'

interface UserProfile {
  userID: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  middleInitial: string | null;
  email: string | null;
  firstNumber: string | null;
  secondNumber: string | null;
  role: string;
}

const SettingsPage = ({ setPage }: ChangePageProps) => {
  // User profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states for personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [email, setEmail] = useState('');
  const [firstNumber, setFirstNumber] = useState('');
  const [secondNumber, setSecondNumber] = useState('');

  // Form states for security
  const [username, setUsername] = useState('');
  const [useEmailAsUsername, setUseEmailAsUsername] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Logout state
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        // Populate form fields
        setFirstName(data.user.firstName || '');
        setLastName(data.user.lastName || '');
        setMiddleInitial(data.user.middleInitial || '');
        setEmail(data.user.email || '');
        setFirstNumber(data.user.firstNumber || '');
        setSecondNumber(data.user.secondNumber || '');
        setUsername(data.user.username || '');
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Network error: Unable to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle form submission
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Validate password confirmation
      if (newPassword && newPassword !== confirmPassword) {
        setError('New password and confirmation do not match');
        setSaving(false);
        return;
      }

      // Validate password length if changing
      if (newPassword && newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        setSaving(false);
        return;
      }

      // Require current password if changing password
      if (newPassword && !currentPassword) {
        setError('Current password is required to change password');
        setSaving(false);
        return;
      }

      const updateData: Record<string, string | boolean> = {
        firstName,
        lastName,
        middleInitial,
        email,
        firstNumber,
        secondNumber,
        username: useEmailAsUsername ? email : username,
        useEmailAsUsername,
      };

      // Only include password fields if changing password
      if (currentPassword && newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Profile updated successfully!');
        setProfile(data.user);
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error: Unable to save changes');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel - reset form to original values
  const handleCancel = () => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setMiddleInitial(profile.middleInitial || '');
      setEmail(profile.email || '');
      setFirstNumber(profile.firstNumber || '');
      setSecondNumber(profile.secondNumber || '');
      setUsername(profile.username || '');
      setUseEmailAsUsername(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessMessage(null);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      console.error('Error logging out:', err);
      setLoggingOut(false);
    }
  };

  // Update username when useEmailAsUsername changes
  useEffect(() => {
    if (useEmailAsUsername && email) {
      setUsername(email);
    } else if (!useEmailAsUsername && profile) {
      setUsername(profile.username || '');
    }
  }, [useEmailAsUsername, email, profile]);

  if (loading) {
    return (
      <div className='column__align gap-3 md:gap-5 py-3 md:py-5 text-customViolet overflow-hidden bg-white rounded-t-2xl'>
        <div className='px-5 md:px-8 lg:px-12'>
          <TitleButton setPage={setPage} title="Settings"/>
        </div>
        <div className='w-full flex justify-center py-12 md:py-16'>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 border-3 border-customViolet border-t-transparent rounded-full animate-spin" />
            <p className="text-customViolet/70 md:text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='column__align gap-3 md:gap-5 py-3 md:py-5 text-customViolet overflow-hidden bg-white rounded-t-2xl'>
      <div className='px-5 md:px-8 lg:px-12'>
        <TitleButton setPage={setPage} title="Settings"/>
      </div>
      <div className='max__size overflow-x-hidden flex md:mt-5 max-w-5xl mx-auto'>
        <div className='column__align gap-5 md:gap-6 lg:gap-8 px-5 md:px-8 lg:px-12'>
          {/* Error/Success Messages */}
          {error && (
            <div className='w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}
          {successMessage && (
            <div className='w-full bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm'>
              {successMessage}
            </div>
          )}

          <h2 className='h2__style text-xl md:text-2xl lg:text-3xl'>Personal Information</h2>
          <div className='flex__center__all h-auto w-full py-2 md:py-4'>
            <button className='focus__action click__action hover__action outline-none rounded-full bg-customViolet h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 text-white hover:scale-105 transition-transform'>
              <AiOutlineUser className='max__size mt-2'/>
            </button>
          </div>
          <div className='primary__btn__holder text-sm md:text-base lg:text-lg'>
            <input 
              type="text" 
              placeholder='Last Name' 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className='col-span-full text__overflow input__text main__input md:col-span-5'
            />
            <input 
              type="text" 
              placeholder='First Name' 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className='col-span-9 text__overflow input__text main__input md:col-span-5'
            />
            <input 
              type="text" 
              placeholder='M. I.' 
              value={middleInitial}
              onChange={(e) => setMiddleInitial(e.target.value.slice(0, 1).toUpperCase())}
              maxLength={1}
              className='col-span-3 text__overflow input__text main__input md:col-span-2'
            />
            <input 
              type="email" 
              placeholder='Email Address' 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='col-span-full text__overflow input__text main__input'
            />
            <div className='main__input col-span-6 gap-3 flex__center__y'>
              <span className='font-medium'>+63</span>
              <input 
                type="text" 
                className='text__overflow input__text w-full' 
                placeholder='9xx xxx xxxx'
                value={firstNumber}
                onChange={(e) => setFirstNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div>
            <div className='main__input col-span-6 gap-3 flex__center__y'>
              <span className='font-medium'>+63</span>
              <input 
                type="text" 
                className='text__overflow input__text w-full' 
                placeholder='9xx xxx xxxx'
                value={secondNumber}
                onChange={(e) => setSecondNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div>
          </div>

          <h2 className='h2__style mr-auto md:mt-5'>Security</h2>
          <div className='text-sm column__align md:text-base gap-3 lg:flex-row'>
            <div className='primary__btn__holder lg:max-h-22'>
              <h3 className='col-span-6 font-medium mb-1 text-base'>Change Username</h3>
              <div className='flex gap-2 col-span-6 justify-end items-center'>
                <input 
                  type="checkbox" 
                  className='h-5 w-5 md:h-6 md:w-6 cursor-pointer'
                  checked={useEmailAsUsername}
                  onChange={(e) => setUseEmailAsUsername(e.target.checked)}
                />
                <span className='text-sm'>Use Email Address</span>
              </div>
              <input 
                type="text" 
                placeholder='Username' 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={useEmailAsUsername}
                className={`col-span-full text__overflow input__text main__input md:max-h-12 ${useEmailAsUsername ? 'bg-zinc-100 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className='primary__btn__holder gap-3'>
              <h3 className='col-span-full font-medium mt-5 mb-1 text-base lg:mt-0'>Change Password</h3>
              <input 
                type="password" 
                placeholder='Current Password' 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='col-span-full text__overflow input__text main__input'
              />
              <input 
                type="password" 
                placeholder='New Password' 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='col-span-full text__overflow input__text main__input'
              />
              <input 
                type="password" 
                placeholder='Confirm Password' 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`col-span-full text__overflow input__text main__input ${
                  confirmPassword && newPassword !== confirmPassword ? 'border-red-400' : ''
                }`}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className='col-span-full text-xs text-red-500'>Passwords do not match</p>
              )}
            </div>
          </div>

          <button 
            type="button" 
            className='w-full py-3 rounded-md border border-rose-500 text-rose-500 hover:bg-rose-500/70 focus:bg-rose-500 focus:text-white ease-out duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>

          <div className='w-full flex justify-end gap-2 mt-5 md:flex md:items-center md:justify-center md:mt-10'>
            <button 
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className='click__action hover__action focus__action flex__center__y border border-zinc-400 rounded-sm gap-3 text-zinc-400 justify-between px-5 md:gap-5 disabled:opacity-50'
            >
              <HiOutlineArrowNarrowLeft className='text-2xl'/> Cancel
            </button>
            <button 
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
              className='primary__btn click__action hover__action focus__action flex__center__y justify-between px-5 md:gap-5 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {saving ? 'Saving...' : 'Confirm Changes'} <HiOutlineArrowNarrowRight className='text-2xl'/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
