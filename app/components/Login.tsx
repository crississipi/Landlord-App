import React from 'react'
import { CustomInput } from './customcomponents'

const Login = () => {
  return (
    <div className='max__size px-5 flex flex-col'>
      <h1 className='font-poppins text-3xl text-customViolet font-light'>Log In Account</h1>
      <div className='max__size flex__center__all flex-col'>
        <CustomInput placeholder='Username' inputType='text' marginBottom={true}/>
        <CustomInput placeholder='Password' inputType='password' marginBottom={false}/>
        <button className='click__action h-auto w-full text-lg text-right outline-none text-customViolet no-underline hover:underline focus:underline mt-2 mb-14'>
            forgot password?
        </button>
        <button className='px-14 primary__btn click__action hover__action focus__action bg-white text-customViolet text-lg font-medium'>LOGIN</button>
      </div>
    </div>
  )
}

export default Login
