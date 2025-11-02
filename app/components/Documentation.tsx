import { ChangePageProps, ImageProps } from '@/types'
import React, { useRef, useState } from 'react';
import { AiOutlineLeft, AiOutlineMinus, AiOutlinePlus, AiOutlineUser } from 'react-icons/ai';
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { ImageButton } from './customcomponents';
import { HiMiniMinus } from 'react-icons/hi2';

type DocuProps = ChangePageProps & ImageProps;

const Documentation: React.FC<DocuProps> = ({ setPage, setImage }) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImg, setSelectedImg] = useState<string[]>([]);

  const accessFile = () => { inputRef.current?.click(); }

  const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(selectedImg.length >= 8) return;

    const files = event.target.files;
    const newImageURLs: string[] = [];

    if(!files) return;

    Array.from(files).forEach((file) => {
      if(file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImageURLs.push(imageUrl);
      }
    });

    setSelectedImg((prev) => [...prev, ...newImageURLs]);
  }
  const [materials, setMaterials] = useState([
    { material: "", cost: "" },
  ]);

  const handleAdd = () => {
    setMaterials([...materials, { material: "", cost: "" }]);
  };

  const handleRemove = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: "material" | "cost",
    value: string
  ) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  return (
    <div className='max__size flex flex-col px-5 gap-5 text-customViolet py-3 text-sm bg-white rounded-t-2xl md:text-base'>
      <div className='h-auto w-full flex__center__y gap-3'>
        <button className='rounded-sm h-9 w-9 p-1 focus__action hover__action click__action outline-none' onClick={() => changePage(4)}>
          <AiOutlineLeft className='max__size text-emerald-700'/>
        </button>
        <h1 className='h1__style'>Documentation</h1>
      </div>
      <div className='h-full w-full flex flex-col overflow-x-hidden'>
        <h2 className='h2__style mt-3'>Insert Images</h2>
        <div className='h-auto w-full grid grid-cols-4 gap-3 rounded-sm'>
          <div className='col-span-full w-full flex__center__y gap-3 px-1'>
            <button className='focus__action hover__action click__action flex__center__all h-20 min-w-20 outline-none rounded-sm bg-zinc-50 border border-zinc-200 text-emerald-700 md:h-36 md:w-42' onClick={accessFile}>
              <AiOutlinePlus className='text-4xl md:text-5xl'/>
              <input 
                type="file" 
                ref={inputRef} 
                accept='image/*' 
                multiple 
                className='hidden' 
                onChange={fileChange}
              />
            </button>
            <span className='text-zinc-400'>Include images of before and after repairing the broken item. Attach at least 2 images. Maximum of 8 images only.</span>
          </div>
          {selectedImg.map((url, i) => (
            <ImageButton 
              key={i} 
              setImage={setImage} 
              removable={true} 
              imageURL={url}
              setSelectedImg={setSelectedImg}
            />
          ))}
        </div>
        <h2 className='h2__style mt-5'>Remarks</h2>
        <textarea name="noticeInfo" id="noticeInfo" placeholder='Write a Message...'  className='min-h-40 w-full input__text text-base border border-zinc-400 rounded-sm px-3 py-2 hover:border-customViolet/50 focus:border-customViolet ease-out duration-200'></textarea>
        <h2 className='h2__style mt-5'>Additional</h2>
        <div className='w-full flex flex-col gap-3 items-start'>
          <h3 className='text-base'>Maintenance in-charge</h3>
          <div className='w-full flex gap-3'>
            <div className='w-full grid grid-cols-3 gap-2'>
              <input type="text" placeholder='Full Name' className='col-span-full p-3 border border-zinc-400 rounded-md hover:border-customViolet/50 focus:border-customViolet ease-out duration-200'/>
              <input type="text" placeholder='Number' className='col-span-2 p-3 border border-zinc-400 rounded-md hover:border-customViolet/50 focus:border-customViolet ease-out duration-200'/>
              <input type="text" placeholder='Payment' className='col-span-1 p-3 border border-zinc-400 rounded-md hover:border-customViolet/50 focus:border-customViolet ease-out duration-200'/>
            </div>
          </div>
          <h3 className='text-base'>Material Cost</h3>
          <div className='w-full flex flex-col gap-3'>
            {materials.map((item, index) => (
              <div key={index} className="w-full grid grid-cols-10 gap-2">
                <input
                  type="text"
                  placeholder="Material"
                  value={item.material}
                  onChange={(e) => handleChange(index, "material", e.target.value)}
                  className="col-span-6 p-3 border border-zinc-400 rounded-md hover:border-customViolet/50 focus:border-customViolet ease-out duration-200"
                />
                <input
                  type="text"
                  placeholder="Cost"
                  value={item.cost}
                  onChange={(e) => handleChange(index, "cost", e.target.value)}
                  className="col-span-3 p-3 border border-zinc-400 rounded-md hover:border-customViolet/50 focus:border-customViolet ease-out duration-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="col-span-1 bg-neutral-200 flex items-center justify-center rounded-md text-xl hover:bg-rose-500/30 focus:bg-rose-500 focus:text-white ease-out duration-200"
                >
                  <HiMiniMinus />
                </button>
              </div>
            ))}
            <button 
            type="button" 
            className='flex gap-1 items-center px-3 py-1.5 rounded-md border border-customViolet/50 hover:border-customViolet focus:bg-customViolet focus:text-white ease-out duration-200 ml-auto'
            onClick={handleAdd}
            >add <AiOutlinePlus /></button>
          </div>
        </div>
      </div>
      <div className='w-full flex justify-end gap-2 sticky top-full md:items-center md:justify-center md:mt-10'>
        <button className='click__action hover__action focus__action flex__center__y border border-zinc-400 rounded-sm gap-3 text-zinc-400 justify-between px-5 md:gap-5'>
          <HiOutlineArrowNarrowLeft className='text-2xl'/> 
          Cancel
        </button>
        <button className='primary__btn click__action hover__action focus__action flex__center__y justify-between px-5 md:gap-5'>
          Confirm 
          <HiOutlineArrowNarrowRight className='text-2xl'/>
        </button>
      </div>
    </div>
  )
}

export default Documentation
