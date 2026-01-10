import { ChangePageProps, ImageProps, MaintenanceRequest, DocumentationMaterial } from '@/types'
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AiOutlineLeft, AiOutlinePlus } from 'react-icons/ai';
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { ImageButton } from './customcomponents';
import { HiMiniMinus } from 'react-icons/hi2';

interface DocuProps extends ChangePageProps, ImageProps {
  maintenanceId?: number;
}

interface ImageFile {
  file: File;
  preview: string;
}

const Documentation: React.FC<DocuProps> = ({ setPage, setImage, maintenanceId }) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImg, setSelectedImg] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  
  // Form states
  const [remarks, setRemarks] = useState('');
  const [inChargeName, setInChargeName] = useState('');
  const [inChargeNumber, setInChargeNumber] = useState('');
  const [inChargePayment, setInChargePayment] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Maintenance details
  const [maintenance, setMaintenance] = useState<MaintenanceRequest | null>(null);

  // Fetch maintenance details if maintenanceId is provided
  useEffect(() => {
    if (maintenanceId) {
      fetchMaintenanceDetails();
    }
  }, [maintenanceId, fetchMaintenanceDetails]);

  const fetchMaintenanceDetails = useCallback(async () => {
    if (!maintenanceId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/maintenance?maintenanceId=${maintenanceId}`);
      const data = await response.json();
      if (data.success && data.maintenances?.length > 0) {
        setMaintenance(data.maintenances[0]);
      }
    } catch (err) {
      console.error('Error fetching maintenance:', err);
    } finally {
      setLoading(false);
    }
  }, [maintenanceId]);

  const accessFile = () => { inputRef.current?.click(); }

  const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(selectedImg.length >= 8) return;

    const files = event.target.files;
    if(!files) return;

    const newImageURLs: string[] = [];
    const newImageFiles: ImageFile[] = [];

    Array.from(files).forEach((file) => {
      if(file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImageURLs.push(imageUrl);
        newImageFiles.push({ file, preview: imageUrl });
      }
    });

    setSelectedImg((prev) => [...prev, ...newImageURLs]);
    setImageFiles((prev) => [...prev, ...newImageFiles]);
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

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Upload images to GitHub
  const uploadImages = async (): Promise<{ url: string; fileName: string }[]> => {
    if (imageFiles.length === 0) return [];

    const images = await Promise.all(
      imageFiles.map(async (imgFile) => ({
        name: `${Date.now()}-${imgFile.file.name}`,
        content: await fileToBase64(imgFile.file)
      }))
    );

    const response = await fetch('/api/upload-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images,
        folderName: `maintenance-docs/${maintenanceId}`
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to upload images');
    }

    return data.urls.map((url: string, idx: number) => ({
      url,
      fileName: images[idx].name
    }));
  };

  // Submit documentation
  const handleSubmit = async () => {
    if (!maintenanceId) {
      setError('No maintenance request selected');
      return;
    }

    if (!remarks.trim()) {
      setError('Please provide remarks about the fix');
      return;
    }

    if (imageFiles.length < 2) {
      setError('Please attach at least 2 images');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload images first
      const uploadedImages = await uploadImages();

      // Filter out empty materials
      const validMaterials = materials.filter(m => m.material.trim() && m.cost.trim());

      // Create documentation
      const response = await fetch('/api/maintenance/documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceId,
          remarks,
          inChargeName: inChargeName || null,
          inChargeNumber: inChargeNumber || null,
          inChargePayment: inChargePayment || null,
          materials: validMaterials.map(m => ({
            material: m.material,
            cost: parseFloat(m.cost) || 0
          })),
          images: uploadedImages
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect back to maintenance page after 2 seconds
        setTimeout(() => {
          changePage(4);
        }, 2000);
      } else {
        setError(data.error || 'Failed to save documentation');
      }
    } catch (err) {
      console.error('Error submitting documentation:', err);
      setError('Failed to save documentation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total material cost
  const totalMaterialCost = materials.reduce((sum, m) => {
    return sum + (parseFloat(m.cost) || 0);
  }, 0);

  if (success) {
    return (
      <div className='max__size flex flex-col px-5 gap-5 text-customViolet py-3 text-sm bg-white rounded-t-2xl md:text-base items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <HiOutlineArrowNarrowRight className='text-3xl text-emerald-600' />
          </div>
          <h2 className='text-xl font-semibold text-emerald-600'>Documentation Saved!</h2>
          <p className='text-neutral-500 mt-2'>Redirecting to maintenance page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max__size flex flex-col px-5 gap-5 text-customViolet py-3 text-sm bg-white rounded-t-2xl md:text-base'>
      <div className='h-auto w-full flex__center__y gap-3'>
        <button className='rounded-sm h-9 w-9 p-1 focus__action hover__action click__action outline-none' onClick={() => changePage(4)}>
          <AiOutlineLeft className='max__size text-emerald-700'/>
        </button>
        <h1 className='h1__style'>Documentation</h1>
      </div>

      {/* Maintenance Info Header */}
      {maintenance && (
        <div className='w-full bg-neutral-100 rounded-lg p-3'>
          <h3 className='font-medium'>{maintenance.processedRequest || maintenance.rawRequest}</h3>
          <p className='text-sm text-neutral-600'>
            {maintenance.property?.name} • {maintenance.tenantName}
          </p>
        </div>
      )}

      {error && (
        <div className='w-full bg-red-50 border border-red-200 text-red-600 rounded-lg p-3'>
          {error}
        </div>
      )}

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
        <h2 className='h2__style mt-5'>Remarks <span className='text-red-500'>*</span></h2>
        <textarea 
          name="noticeInfo" 
          id="noticeInfo" 
          placeholder='Describe what was done to fix the issue...'  
          className='min-h-40 w-full input__text text-base border border-zinc-400 rounded-sm px-3 py-2 hover:border-customViolet/50 focus:border-customViolet ease-out duration-200'
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <h2 className='h2__style mt-5'>Additional</h2>
        <div className='w-full flex flex-col gap-3 items-start'>
          <h3 className='text-base'>Maintenance in-charge</h3>
          <div className='w-full flex gap-3'>
            <div className='w-full grid grid-cols-3 gap-2'>
              <input 
                type="text" 
                placeholder='Full Name' 
                className='col-span-full p-3 border border-zinc-400 rounded-md hover:border-customViolet/50 focus:border-customViolet ease-out duration-200'
                value={inChargeName}
                onChange={(e) => setInChargeName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder='Number' 
                className='col-span-2 p-3 border border-zinc-400 rounded-md hover:border-customViolet/50 focus:border-customViolet ease-out duration-200'
                value={inChargeNumber}
                onChange={(e) => setInChargeNumber(e.target.value)}
              />
              <input 
                type="text" 
                placeholder='Payment' 
                className='col-span-1 p-3 border border-zinc-400 rounded-md hover:border-customViolet/50 focus:border-customViolet ease-out duration-200'
                value={inChargePayment}
                onChange={(e) => setInChargePayment(e.target.value)}
              />
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
            >
              add <AiOutlinePlus />
            </button>
          </div>
          {totalMaterialCost > 0 && (
            <div className='w-full flex justify-end mt-2'>
              <span className='font-medium'>Total: ₱{totalMaterialCost.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
      <div className='w-full flex justify-end gap-2 sticky top-full md:items-center md:justify-center md:mt-10'>
        <button 
          className='click__action hover__action focus__action flex__center__y border border-zinc-400 rounded-sm gap-3 text-zinc-400 justify-between px-5 md:gap-5'
          onClick={() => changePage(4)}
          disabled={submitting}
        >
          <HiOutlineArrowNarrowLeft className='text-2xl'/> 
          Cancel
        </button>
        <button 
          className='primary__btn click__action hover__action focus__action flex__center__y justify-between px-5 md:gap-5 disabled:opacity-50'
          onClick={handleSubmit}
          disabled={submitting || !remarks.trim() || imageFiles.length < 2}
        >
          {submitting ? 'Saving...' : 'Confirm'}
          <HiOutlineArrowNarrowRight className='text-2xl'/>
        </button>
      </div>
    </div>
  )
}

export default Documentation
