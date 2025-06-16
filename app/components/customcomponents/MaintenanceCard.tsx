import { ChangePageProps, ImageProps, MaintenanceCardProps } from '@/types'
import React, { useState } from 'react'
import { AiOutlineCheck, AiOutlineDown } from 'react-icons/ai';
import ImageButton from './ImageButton';

type MaintenancePageProps = MaintenanceCardProps & ChangePageProps & ImageProps;

const MaintenanceCard: React.FC<MaintenancePageProps> = ( { urgent, unit, dateSent, tenant, info, docu, setPage, setImage }) => {
  const [showDetails, setDetails] = useState(false);
  const toggleDetails = () => {
    setDetails(!showDetails);
  }
  const [showDocu, setDocu] = useState(false);
  const toggleDocu = () => {
    setDocu(!showDocu);
  }
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  return (
    <div className='column__align'>
      <button className={`column__align click__action outline-none text-left relative text-customViolet text-sm group focus:bg-zinc-100 py-1 px-1 md:text-base`} onClick={toggleDetails}>
        <div className='w-full grid grid-cols-12 items-center bg-transparent py-2 rounded-sm gap-2 md:gap-0'>
          <span className='col-span-2 text-left pl-3 font-medium'>{unit}</span>
          <span className='col-span-6 text__overflow font-normal text-left'>{tenant}</span>
          <span className='col-span-2 font-light md:text-sm text-xs'>{dateSent}</span>
          <span className={`col-span-2 mx-auto contents-[""] h-3 w-3 rounded-full ${ urgent ? 'bg-rose-700' : 'bg-emerald-700'}`}></span>
        </div>
      </button>
      <div className={`${showDetails ? 'h-max block' : 'h-0 hidden'} max-h-32 w-full px-3 py-2 font-light text-sm rounded-sm bg-zinc-50 md:text-base`}>
        <h4 className='font-normal'>Summary of the Concern</h4>
        <p className='px-2 text-justify'>{info}</p>
      </div>
      <div className={`h-auto w-full ${showDetails ? 'block' : 'h-0 hidden'} flex justify-end mt-2 pr-2 mb-2`}>
        <button className='focus__action click__action flex__center__y outline-none px-3 py-2 rounded-sm bg-customViolet text-white gap-3 text-sm md:text-base md:py-2 md:pl-3 md:pr-4' onClick={() => changePage(12)}><AiOutlineCheck className='text-base md:text-xl'/>Fixed</button>
      </div>
      { docu && (
        <div className='column__align text-sm font-normal bg-white overflow-hidden p-0.5 border-b border-zinc-200'>
          <button className='flex__center__y click__action hover__action justify-between outline-none text-left p-3 rounded-sm focus:ring-1 focus:ring-customViolet/50 md:text-base' onClick={toggleDocu}>Completed: Mar 14, 2025<AiOutlineDown className={`${!showDocu && 'rotate-90'} click__action`}/></button>
          {showDocu && (
          <div className='column__align'>
            <div className='w-full grid grid-cols-4 gap-2 p-1 text-customViolet px-3 py-1'>
              <ImageButton setImage={setImage}/>
              <ImageButton setImage={setImage}/>
              <ImageButton setImage={setImage}/>
              <ImageButton setImage={setImage}/>
            </div>
            <div className='column__align text-sm p-3 mt-2 md:text-sm bg-zinc-50'>
              <span>Remarks:</span>
              <p className='px-2 font-light text-justify'>Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ui labore et dolore magna.</p>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MaintenanceCard
