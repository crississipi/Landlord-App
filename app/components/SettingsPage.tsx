import { ChangePageProps } from '@/types'
import React from 'react'
import { TitleButton } from './customcomponents'
import { AiOutlineUser } from 'react-icons/ai'
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi'

const SettingsPage = ({ setPage }:ChangePageProps ) => {
  return (
    <div className='column__align gap-3 py-3 text-customViolet overflow-hidden bg-white rounded-t-2xl'>
      <div className='px-5'>
        <TitleButton setPage={setPage} title="Settings"/>
      </div>
      <div className='max__size overflow-x-hidden flex md:mt-5'>
        <div className='column__align gap-5 px-5'>
          <h2 className='h2__style'>Personal Information</h2>
          <div className='flex__center__all h-auto w-full py-2'>
            <button className='focus__action click__action hover__action outline-none rounded-full bg-customViolet h-24 w-24 text-white'><AiOutlineUser className='max__size mt-2'/></button>
          </div>
          <div className='primary__btn__holder text-sm md:text-base'>
            <input type="text" placeholder='Last Name' className='col-span-full text__overflow input__text main__input md:col-span-5'/>
            <input type="text" placeholder='First Name' className='col-span-9 text__overflow input__text main__input md:col-span-5'/>
            <input type="text" placeholder='M. I.' className='col-span-3 text__overflow input__text main__input md:col-span-2'/>
            <input type="email" placeholder='Email Address' className='col-span-full text__overflow input__text main__input'/>
            <div className='main__input col-span-6 gap-3 flex__center__y'>
                <span className='font-medium'>+63</span>
                <input type="text" className='text__overflow input__text w-full' placeholder='9xx xxx xxxx'/>
            </div>
            <div className='main__input col-span-6 gap-3 flex__center__y'>
                <span className='font-medium'>+63</span>
                <input type="text" className='text__overflow input__text w-full' placeholder='9xx xxx xxxx'/>
            </div>
          </div>
          <h2 className='h2__style mr-auto md:mt-5'>Security</h2>
          <div className='text-sm column__align md:text-base gap-3 lg:flex-row'>
            <div className='primary__btn__holder lg:max-h-22'>
              <h3 className='col-span-6 font-medium mb-1 text-base'>Change Username</h3>
              <div className='flex gap-2 col-span-6 justify-end'>
                <input type="checkbox" className='h-5 w-5 md:h-6 md:w-6'/>
                Use Email Address
              </div>
              <input type="text" placeholder='Username' className='col-span-full text__overflow input__text main__input md:max-h-12'/>
            </div>
            <div className='primary__btn__holder gap-3'>
              <h3 className='col-span-full font-medium mt-5 mb-1 text-base lg:mt-0'>Change Password</h3>
              <input type="password" placeholder='Current Password' className='col-span-full text__overflow input__text main__input'/>
              <input type="password" placeholder='New Password' className='col-span-full text__overflow input__text main__input'/>
              <input type="password" placeholder='Confirm Password' className='col-span-full text__overflow input__text main__input'/>
            </div>
          </div>
          <div className='w-full flex justify-end gap-2 mt-5 md:flex md:items-center md:justify-center md:mt-10'>
            <button className='click__action hover__action focus__action flex__center__y border border-zinc-400 rounded-sm gap-3 text-zinc-400 justify-between px-5 md:gap-5'><HiOutlineArrowNarrowLeft className='text-2xl'/> Cancel</button>
            <button className='primary__btn click__action hover__action focus__action flex__center__y justify-between px-5 md:gap-5'>Confirm Changes <HiOutlineArrowNarrowRight className='text-2xl'/></button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
