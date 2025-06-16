import { LoadingProps } from '@/types'
import React from 'react'
import LoadingBar from './LoadingBar'

const LoadingScreen = ({page}: LoadingProps) => {
  return (
    <div className='max__size flex flex-col fixed bg-white/20 mt-16 px-3 overflow-hidden z-50 gap-1'>
        { page === 0 && (
        <div className='column__align gap-1'>
            <div className='min-h-10 w-full flex__center__y justify-between mt-2.5'>
                <LoadingBar size='h-6 w-30'/>
                <LoadingBar size='h-8.5 w-19.5 mr-1'/>
            </div>
            <LoadingBar size='h-56 w-full' />
            <div className='h-46 grid grid-cols-12 grid-rows-11 gap-1'>
                <LoadingBar size='col-span-6 row-span-8'/>
                <LoadingBar size='col-span-6 row-span-4'/>
                <LoadingBar size='col-span-6 row-span-4'/>
                <LoadingBar size="col-span-6 row-span-3"/>
                <LoadingBar size="col-span-3 row-span-3"/>
                <LoadingBar size="col-span-3 row-span-3"/>
            </div>
            <div className='min-h-10 w-full flex__center__y justify-between mt-7.5'>
                <LoadingBar size='h-6 w-22'/>
                <LoadingBar size="h-8.5 w-25.5 mr-1"/>
            </div>
            <div className='h-auto w-full flex gap-1 overflow-hidden'>
                <LoadingBar size="h-57 min-w-11/12"/>
                <LoadingBar size="h-57 min-w-11/12"/>
            </div>
            <div className='min-h-12 w-full flex__center__y justify-between mt-6'>
                <LoadingBar size="h-6 w-36"/>
                <LoadingBar size="h-8.5 w-19.5 mr-1"/>
            </div>
            <LoadingBar size="h-50 w-full"/>
        </div>
        )}

        { page === 1 && (
        <div className='column__align gap-1'>
            <div className='h-10 w-full flex__center__y justify-between mt-2 ml-3'>
                <LoadingBar size='h-8 w-40'/>
                <LoadingBar size='h-9 w-33 mr-5' />
            </div>
            <LoadingBar size='h-55 w-full mt-4' />
            <div className='h-35 w-full grid grid-cols-12 grid-rows-12 gap-1'>
                <LoadingBar size='col-span-6 row-span-8 mt-1' />
                <LoadingBar size='col-span-6 row-span-6 mt-1' />
                <LoadingBar size='col-span-6 row-span-6' />
                <LoadingBar size='col-span-6 row-span-4' />
            </div>
            <div className='flex w-full justify-between'>
                <LoadingBar size='h-7 w-21 mt-9' />
                <LoadingBar size='h-9 w-34 mt-7.5 mr-1' />
            </div>
            <div className='grid grid-cols-2 gap-1'>
                <LoadingBar size='h-54 mt-2'/>
                <LoadingBar size='h-54 mt-2'/>
                <LoadingBar size='h-16'/>
                <LoadingBar size='h-16'/>
            </div>
        </div>
        )}
      
        { page === 2 && (
            <div className='column__align py-3'>
                <LoadingBar size='h-7 w-37 ml-3' />
                <LoadingBar size='h-13 w-full mt-5' rounded='rounded-full'/>
                <div className='w-full flex gap-1 py-7.5 pl-4 overflow-hidden'>
                    <div className='flex flex-col items-center gap-1'>
                        <LoadingBar size='h-16 w-16 ml-1' rounded='rounded-full'/>
                        <LoadingBar size='h-4 w-19'/>
                    </div>
                    <div className='flex flex-col items-center gap-1'>
                        <LoadingBar size='h-16 w-16 ml-1' rounded='rounded-full'/>
                        <LoadingBar size='h-4 w-19'/>
                    </div>
                    <div className='flex flex-col items-center gap-1'>
                        <LoadingBar size='h-16 w-16 ml-1' rounded='rounded-full'/>
                        <LoadingBar size='h-4 w-19'/>
                    </div>
                    <div className='flex flex-col items-center gap-1'>
                        <LoadingBar size='h-16 w-16 ml-1' rounded='rounded-full'/>
                        <LoadingBar size='h-4 w-19'/>
                    </div>
                    <div className='flex flex-col items-center gap-1'>
                        <LoadingBar size='h-16 w-16 ml-1' rounded='rounded-full'/>
                        <LoadingBar size='h-4 w-19'/>
                    </div>
                </div>
                <div className='column__align mt-3 px-5 pr-4'>
                    <div className='w-full flex gap-2'>
                        <LoadingBar size='h-12 w-12' rounded='rounded-full'/>
                        <div className='flex flex-col gap-1.5 mt-1.5'>
                            <LoadingBar size='h-4 w-30'/>
                            <LoadingBar size='h-4 w-30'/>
                        </div>
                        <LoadingBar size='mt-7 h-4 w-10 ml-auto'/>
                    </div>
                    <div className='w-full flex gap-2 mt-6'>
                        <LoadingBar size='h-12 w-12' rounded='rounded-full'/>
                        <div className='flex flex-col gap-1.5 mt-1.5'>
                            <LoadingBar size='h-4 w-30'/>
                            <LoadingBar size='h-4 w-30'/>
                        </div>
                        <LoadingBar size='mt-7 h-4 w-10 ml-auto'/>
                    </div>
                    <div className='w-full flex gap-2 mt-6'>
                        <LoadingBar size='h-12 w-12' rounded='rounded-full'/>
                        <div className='flex flex-col gap-1.5 mt-1.5'>
                            <LoadingBar size='h-4 w-30'/>
                            <LoadingBar size='h-4 w-30'/>
                        </div>
                        <LoadingBar size='mt-7 h-4 w-10 ml-auto'/>
                    </div>
                    <div className='w-full flex gap-2 mt-6'>
                        <LoadingBar size='h-12 w-12' rounded='rounded-full'/>
                        <div className='flex flex-col gap-1.5 mt-1.5'>
                            <LoadingBar size='h-4 w-30'/>
                            <LoadingBar size='h-4 w-30'/>
                        </div>
                        <LoadingBar size='mt-7 h-4 w-10 ml-auto'/>
                    </div>
                    <div className='w-full flex gap-2 mt-6'>
                        <LoadingBar size='h-12 w-12' rounded='rounded-full'/>
                        <div className='flex flex-col gap-1.5 mt-1.5'>
                            <LoadingBar size='h-4 w-30'/>
                            <LoadingBar size='h-4 w-30'/>
                        </div>
                        <LoadingBar size='mt-7 h-4 w-10 ml-auto'/>
                    </div>
                </div>
            </div>
        )}

        { page === 3 && (
            <div className='max__size mt-3 flex flex-col'>
                <LoadingBar size='h-7 w-30 ml-3'/>
                <LoadingBar size='h-5.5 w-48 mt-5'/>
                <div className='column__align gap-1 mt-4.5'>
                    <LoadingBar size='w-full h-12.5' />
                    <LoadingBar size='w-full h-37.5' />
                    <div className='flex justify-between'>
                        <LoadingBar size='h-7 w-33 mt-1' />
                        <LoadingBar size='h-9 w-20' />
                    </div>
                </div>
                <LoadingBar size='h-5.5 w-40 mt-10' />
                <div className='column__align gap-1 mt-4'>
                    <LoadingBar size='h-58 w-full' />
                    <LoadingBar size='h-36 w-full' />
                </div>
            </div>
        )}

        { page === 4 && (
            <div className='column__align'>
                <div className='flex justify-between px-3 '>
                    <LoadingBar size='h-7 w-45 mt-3.5'/>
                    <LoadingBar size='h-10 w-10 mt-2' rounded='rounded-full'/>
                </div>
                <LoadingBar size='h-6 w-25 mt-4'/>
                <LoadingBar size='h-50 w-full mt-5'/>
                <LoadingBar size='h-6 w-22 mt-6'/>
                <LoadingBar size='h-25 w-full mt-5'/>
                <LoadingBar size='h-23 w-full mt-5'/>
                <LoadingBar size='h-23 w-full mt-5'/>
                <LoadingBar size='h-23 w-full mt-5'/>
            </div>
        )}

        { page === 5 && (
            <div className='column__align pl-2 pr-1'>
                <div className='w-full flex justify-between'>
                    <LoadingBar size='h-7 w-32 mt-3.5 ml-1' />
                    <LoadingBar size='h-8 w-28 mt-4' />
                </div>
                <div className='w-full grid grid-cols-2 gap-1 mt-1'>
                    <LoadingBar size='h-44 w-auto mt-3.5' />
                    <LoadingBar size='h-44 w-auto mt-3.5' />
                    <LoadingBar size='h-44 w-auto mt-1' />
                    <LoadingBar size='h-44 w-auto mt-1' />
                    <LoadingBar size='h-44 w-auto mt-1' />
                    <LoadingBar size='h-44 w-auto mt-1' />
                </div>
            </div>
        )}

        { page === 6 && (
            <div className='column__align'>
                <LoadingBar size='h-7 w-33 ml-2 mt-3'/>
                <LoadingBar size='h-6 w-55 mt-7'/>
                <div className='flex__center__x'>
                    <LoadingBar size='h-25 w-25 mt-6.5' rounded='rounded-full'/>
                </div>
                <div className='primary__btn__holder px-2 gap-2'>
                    <LoadingBar size='col-span-full h-11 mt-6' />
                    <LoadingBar size='col-span-9 h-11 mt-2' />
                    <LoadingBar size='col-span-3 h-11 mt-2' />
                    <LoadingBar size='col-span-full h-11 mt-0.5' />
                    <LoadingBar size='col-span-6 h-11 mt-0.5' />
                    <LoadingBar size='col-span-6 h-11 mt-0.5' />
                </div>
                <LoadingBar size='h-6 w-23 mt-6.5' />
                <div className='w-full flex justify-between'>
                    <LoadingBar size='w-43 h-6 mt-5' />
                    <LoadingBar size='w-43 h-7 mt-4' />
                </div>
                <LoadingBar size='w-full h-11 mt-4' />
                <LoadingBar size='w-41 h-6 mt-8' />
                <LoadingBar size='w-full h-11 mt-4' />
                <div className='flex gap-2'>
                <LoadingBar size='w-1/2 h-11 mt-3' />
                <LoadingBar size='w-1/2 h-11 mt-3' />
                </div>
            </div>
        )}

        { (page === 7 || page === 8) && (
            <div className='column__align'>
                <LoadingBar size='h-7 w-60 mt-3 ml-2'/>
                <LoadingBar size={`h-6 w-54 ${page != 8 ? 'mt-4.5' : 'mt-6.5'}`} />
                <div className='flex__center__x'>
                    <LoadingBar size={`h-25 w-25 ${page != 8 ? 'mt-7' : 'mt-7'}`} rounded='rounded-full'/>
                </div>
                <div className='primary__btn__holder gap-3 px-2'>
                    <LoadingBar size={`col-span-6 mt-6.5 h-11`} />
                    <LoadingBar size={`col-span-6 h-11 mt-6.5`} />
                    <LoadingBar size={`col-span-2 h-11.5`} />
                    <LoadingBar size={`${page != 8 ? 'col-span-2' : 'col-span-3'} h-11.5`} />
                    <LoadingBar size={`col-span-2 h-11.5`} />
                    <LoadingBar size={`${page != 8 ? 'col-span-6' : 'col-span-5'}  h-11.5`} />
                    <LoadingBar size={`${page != 8 ? 'col-span-4' : 'col-span-3'}  h-11.5`} />
                    <LoadingBar size={`${page != 8 ? 'col-span-8' : 'col-span-9'}  h-11.5`} />
                    <LoadingBar size={`${page != 8 ? 'col-span-6' : 'col-span-6'}  h-11`} />
                    <LoadingBar size='col-span-6 h-11' />
                    <LoadingBar size={`${page != 8 ? 'col-span-8' : 'col-span-0'}  h-0`} />
                    {page != 8 && <LoadingBar size='col-span-4 h-11' />}
                </div>
                <LoadingBar size={`w-33 h-6 ${page != 8 ? 'mt-11' : 'mt-2'}`} />
                <div className={`primary__btn__holder gap-2 ${page != 8 ? "mt-5" : 'mt-3'}`}>
                    <LoadingBar size='col-span-6 h-44' />
                    <LoadingBar size='col-span-6 h-44' />
                </div>
                {page != 8 ? (
                <div className='primary__btn__holder gap-1 px-1 mt-8'>
                    <LoadingBar size='col-span-6 h-14' />
                    <LoadingBar size='col-span-6 h-14' />
                </div>) : (
                    <LoadingBar size='w-full h-22 mt-5'/>
                )}

            </div> 
        )}

        { page === 9 && (
            <div className='column_align'>
                <div className='w-full flex justify-between'>
                    <LoadingBar size='h-10 w-60 mt-2 ml-3' />
                    <LoadingBar size='h-7 w-7 mt-3.5 mr-2' rounded='rounded-full'/>
                </div>
                <div className='h-17 flex items-end gap-1'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-19 flex items-end gap-2 flex-row-reverse -mt-2'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-17 flex items-end gap-1'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-19 flex items-end gap-2 flex-row-reverse -mt-2'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-17 flex items-end gap-1'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-19 flex items-end gap-2 flex-row-reverse -mt-2'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-17 flex items-end gap-1'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-19 flex items-end gap-2 flex-row-reverse -mt-2'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-17 flex items-end gap-1'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='h-19 flex items-end gap-2 flex-row-reverse -mt-2'>
                    <LoadingBar size='h-7 w-7 mt-4' rounded='rounded-full'/>
                    <LoadingBar size='h-14 w-77 mt-4 ml-1' />
                </div>
                <div className='w-full flex mt-3'>
                    <LoadingBar size='h-8 w-8 mt-4' />
                    <LoadingBar size='h-8 w-8 mt-4 ml-1.5' />
                    <LoadingBar size='h-10 w-76 mt-3 ml-1' />
                    <LoadingBar size='h-8 w-8 mt-4.5 ml-1.5' />
                </div>
            </div>
        )}

        { page === 10 && (
            <div className='column__align'>
                <LoadingBar size='h-8 w-48 mt-4.5 ml-2'/>
                <div className='flex__center__y flex-col'>
                    <LoadingBar size='h-25 w-25 mt-18' rounded='rounded-full'/>
                    <LoadingBar size='h-6 w-40 mt-3'/>
                </div>
                <LoadingBar size='h-12 w-93 mt-10 ml-2' rounded='rounded-full'/>
                <LoadingBar size='h-9 w-38 mt-14 ml-2'/>
                <LoadingBar size='h-7 w-38 mt-7 ml-2'/>
                <LoadingBar size='h-9 w-59 mt-12 ml-2'/>
            </div>
        )}

        { page === 11 && (
            <div className='column__align'>
                <LoadingBar size='h-9 w-43 mt-4.5 ml-2'/>
                <div className='primary__btn__holder gap-1 gap-y-2 px-2 mt-7'>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                    <LoadingBar size='h-41 col-span-6'/>
                </div>
            </div>
        )}

        { page === 12 && (
            <div className='column__align'>
                <LoadingBar size='h-7 w-55 mt-4 ml-2'/>
                <LoadingBar size='h-6 w-36 mt-10'/>
                <LoadingBar size='h-50 w-99 mt-4 ml-2'/>
                <LoadingBar size='h-7 w-25 mt-10'/>
                <LoadingBar size='h-64 w-99 mt-4.5 ml-2'/>
                <div className='primary__btn__holder gap-2 px-2'>
                    <LoadingBar size='h-13 col-span-6 mt-15'/>
                    <LoadingBar size='h-13 col-span-6 mt-15'/>
                </div>
            </div>
        )}
    </div>
  )
}

export default LoadingScreen
