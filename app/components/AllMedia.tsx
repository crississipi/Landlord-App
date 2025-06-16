import { ChangePageProps, ImageProps } from '@/types';
import React from 'react';
import { AiOutlineLeft } from 'react-icons/ai';
import { ImageButton } from './customcomponents';

type allmedia = ChangePageProps & ImageProps;

const AllMedia: React.FC<allmedia> = ({ setPage, setImage }) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  return (
    <div className='max__size flex flex-col gap-5 text-customViolet bg-slate-50 overflow-hidden'>
      <div className='flex__center__y h-auto w-full gap-3 bg-white px-5 py-2'>
        <button className='focus__action click__action hover__action rounded-sm h-11 w-11 p-1 outline-none' onClick={() => changePage(10)}>
          <AiOutlineLeft className='max__size text-emerald-700'/>
        </button>
        <h1 className='h1__style'>All Images</h1>
      </div>
      <div className='h-5/6 w-full flex px-5 overflow-x-hidden'>
        <div className='h-auto w-full grid grid-cols-2 gap-3 lg:grid-cols-5'>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
          <ImageButton setImage={setImage} allMedia={true}/>
        </div>
      </div>
    </div>
  )
}

export default AllMedia
