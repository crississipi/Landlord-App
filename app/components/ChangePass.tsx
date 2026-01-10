import React, { useState } from 'react'
import { CustomInput } from './customcomponents'
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi'

const ChangePass = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  return (
    <div className='max__size px-5 flex flex-col justify-center'>
        <h1 className='h1__style mt-5'>Change Password</h1>
        <div className='max__size flex__center__all flex-col'>
            <CustomInput placeholder='New Password' inputType='password' marginBottom={true} hookValue={newPassword} hookVariable={setNewPassword}/>
            <CustomInput placeholder='Confirm Password' inputType='password' marginBottom={false} hookValue={confirmPassword} hookVariable={setConfirmPassword}/>
            <div className='primary__btn__holder flex__center__all mt-20'>
                <button className='col-span-5 primary__btn click__action hover__action focus__action'><HiOutlineArrowNarrowLeft className='text-3xl'/> BACK</button>
                <button className='col-span-7 primary__btn click__action hover__action focus__action'>CONFIRM <HiOutlineArrowNarrowRight className='text-3xl'/></button>
            </div>
        </div>
    </div>
  )
}

export default ChangePass
