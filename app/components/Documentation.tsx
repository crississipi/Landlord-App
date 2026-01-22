import { ChangePageProps, ImageProps, MaintenanceRequest, DocumentationMaterial } from '@/types'
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AiOutlineLeft, AiOutlinePlus } from 'react-icons/ai';
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { ImageButton } from './customcomponents';
import { HiMiniMinus } from 'react-icons/hi2';
import { FaRobot } from 'react-icons/fa';

interface DocuProps extends ChangePageProps, ImageProps {
  maintenanceId?: number;
}

interface ImageFile {
  file: File;
  preview: string;
}

interface AIAnalysisResult {
  description: string;
  description_tl: string;
  work_done: string;
  work_done_tl: string;
  confidence_score: number;
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
  
  // AI Generation states
  const [enableAI, setEnableAI] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiDescriptionTl, setAiDescriptionTl] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Maintenance details
  const [maintenance, setMaintenance] = useState<MaintenanceRequest | null>(null);

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

  // Fetch maintenance details if maintenanceId is provided
  useEffect(() => {
    if (maintenanceId) {
      fetchMaintenanceDetails();
    }
  }, [maintenanceId, fetchMaintenanceDetails]);

  // Generate AI description when images are added and AI is enabled
  const generateAIDescription = useCallback(async () => {
    if (!enableAI || imageFiles.length < 2) {
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const formData = new FormData();
      imageFiles.forEach(imgFile => formData.append('files', imgFile.file));
      
      // Add maintenance context if available
      if (maintenance) {
        formData.append('maintenanceContext', maintenance.processedRequest || maintenance.rawRequest);
      }

      const response = await fetch('/api/analyze-documentation', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.result) {
        const result: AIAnalysisResult = data.result;
        setAiDescription(result.description);
        setAiDescriptionTl(result.description_tl);
        
        // Auto-populate remarks if empty
        if (!remarks.trim()) {
          setRemarks(result.work_done);
        }
      } else {
        setAiError(data.error || 'Failed to generate AI description');
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      setAiError('Failed to connect to AI service');
    } finally {
      setAiLoading(false);
    }
  }, [enableAI, imageFiles, maintenance, remarks]);

  // Trigger AI generation when enabled and images change
  useEffect(() => {
    if (enableAI && imageFiles.length >= 2) {
      generateAIDescription();
    }
  }, [enableAI, imageFiles.length, generateAIDescription]);

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
          aiDescription: enableAI && aiDescription ? aiDescription : null,
          aiDescriptionTl: enableAI && aiDescriptionTl ? aiDescriptionTl : null,
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
    <div className='max__size flex flex-col px-5 gap-5 text-customViolet py-5 text-sm bg-white rounded-t-2xl md:text-base lg:flex-row lg:gap-8 lg:px-8 lg:h-full lg:overflow-hidden'>
      
      {/* HEADER & INFO SECTION (Left on Large Screens) */}
      <div className='w-full lg:w-1/3 flex flex-col gap-4 lg:h-full lg:overflow-y-auto no__scrollbar shrink-0'>
        <div className='h-auto w-full flex__center__y gap-3'>
          <button className='rounded-xl h-10 w-10 flex__center__all hover:bg-gray-100 transition-colors' onClick={() => changePage(4)}>
            <AiOutlineLeft className='text-xl text-emerald-700'/>
          </button>
          <h1 className='h1__style'>Documentation</h1>
        </div>

        {/* Maintenance Info Header */}
        {maintenance && (
          <div className='w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full w-fit'>
                {maintenance.urgency || 'Normal'} Priority
              </span>
              <span className='text-xs text-gray-400'>#{maintenance.maintenanceId}</span>
            </div>
            <h3 className='font-semibold text-lg text-gray-800 leading-tight'>
              {maintenance.processedRequest || maintenance.rawRequest}
            </h3>
            <div className='flex items-center gap-2 text-sm text-gray-500 mt-1'>
              <span className='font-medium text-gray-700'>{maintenance.tenantName}</span>
              <span>•</span>
              <span>{maintenance.property?.name}</span>
            </div>
          </div>
        )}

        {error && (
          <div className='w-full bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm'>
            {error}
          </div>
        )}

        {/* Desktop-only explanation or extra info could go here */}
        <div className='hidden lg:block p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm text-blue-800'>
          <p className='font-medium mb-1'>Documentation Guide</p>
          <ul className='list-disc list-inside space-y-1 opacity-80'>
            <li>Upload clear before & after photos</li>
            <li>Use AI to generate detailed descriptions</li>
            <li>Record all material costs</li>
            <li>Include labor details if applicable</li>
          </ul>
        </div>
      </div>

      {/* FORM SECTION (Right on Large Screens) */}
      <div className='h-full w-full flex flex-col overflow-y-auto overflow-x-hidden no__scrollbar lg:w-2/3 lg:pr-2 pb-20'>
        <h2 className='h2__style mb-4'>Evidence & Details</h2>
        
        {/* Image Grid */}
        <div className='w-full grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
          <button className='aspect-square flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 text-gray-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all group' onClick={accessFile}>
            <AiOutlinePlus className='text-3xl group-hover:scale-110 transition-transform'/>
            <span className='text-xs font-medium'>Add Photo</span>
            <input 
              type="file" 
              ref={inputRef} 
              accept='image/*' 
              multiple 
              className='hidden' 
              onChange={fileChange}
            />
          </button>
          
          {selectedImg.map((url, i) => (
            <div key={i} className='aspect-square relative rounded-xl overflow-hidden border border-gray-100 shadow-sm group'>
              <ImageButton 
                setImage={setImage} 
                removable={true} 
                imageURL={url}
                setSelectedImg={setSelectedImg}
              />
            </div>
          ))}
        </div>

        {/* AI Description Toggle */}
        <div className='w-full mb-6 p-1 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>
             <div className='w-full p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                    <FaRobot className='text-2xl text-blue-600' />
                    <div>
                        <h3 className='font-medium text-blue-900'>AI Analysis</h3>
                        <p className='text-xs text-blue-700'>Auto-generate report from images</p>
                    </div>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                    <input 
                        type='checkbox' 
                        className='sr-only peer' 
                        checked={enableAI}
                        onChange={(e) => setEnableAI(e.target.checked)}
                        disabled={imageFiles.length < 2}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                    </label>
                </div>
            </div>
          
          <div className='p-4'>
            {imageFiles.length < 2 && (
                <p className='text-sm text-amber-600 flex items-center gap-2'>
                    <span className='text-lg'>⚠️</span> Requires min. 2 images
                </p>
            )}

            {enableAI && aiLoading && (
                <div className='flex items-center gap-2 text-blue-600 py-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent'></div>
                <span className='text-sm font-medium'>Analyzing content...</span>
                </div>
            )}

            {enableAI && aiError && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center justify-between'>
                <span>{aiError}</span>
                <button 
                    onClick={generateAIDescription}
                    className='text-xs font-semibold uppercase tracking-wider hover:text-red-800'
                >
                    Retry
                </button>
                </div>
            )}

            {enableAI && aiDescription && !aiLoading && (
                <div className='space-y-3 pt-2'>
                <div className='p-3 bg-white rounded-lg border border-gray-100 shadow-sm'>
                    <h4 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>English Report</h4>
                    <p className='text-sm text-gray-700 leading-relaxed'>{aiDescription}</p>
                </div>
                <div className='p-3 bg-white rounded-lg border border-gray-100 shadow-sm'>
                    <h4 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Tagalog Report</h4>
                    <p className='text-sm text-gray-700 leading-relaxed'>{aiDescriptionTl}</p>
                </div>
                <button 
                    onClick={generateAIDescription}
                    className='text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-2'
                    disabled={aiLoading}
                >
                    🔄 Regenerate Analysis
                </button>
                </div>
            )}
            </div>
        </div>

        <div className='space-y-6'>
            {/* Remarks Section */}
            <div>
                <h2 className='h2__style mb-3'>Remarks <span className='text-red-500'>*</span></h2>
                <textarea 
                    name="noticeInfo" 
                    id="noticeInfo" 
                    placeholder='Describe the repair work done, observations, and recommendations...'  
                    className='w-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-customViolet/20 focus:border-customViolet transition-all resize-y'
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            {/* Additional Info Section */}
            <div>
                <h2 className='h2__style mb-4'>Cost & Labor Breakdown</h2>
                <div className='bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-5'>
                    
                    {/* Personnel */}
                    <div>
                        <h3 className='text-sm font-semibold text-gray-700 mb-3'>Personnel In-Charge</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <input 
                                type="text" 
                                placeholder='Name of technician/worker' 
                                className='main__input'
                                value={inChargeName}
                                onChange={(e) => setInChargeName(e.target.value)}
                            />
                            <div className='grid grid-cols-2 gap-3'>
                                <input 
                                    type="text" 
                                    placeholder='Contact #' 
                                    className='main__input'
                                    value={inChargeNumber}
                                    onChange={(e) => setInChargeNumber(e.target.value)}
                                />
                                <input 
                                    type="number" 
                                    placeholder='Labor Fee' 
                                    className='main__input'
                                    value={inChargePayment}
                                    onChange={(e) => setInChargePayment(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='border-t border-gray-100'></div>

                    {/* Material Costs */}
                    <div>
                        <div className='flex items-center justify-between mb-3'>
                            <h3 className='text-sm font-semibold text-gray-700'>Material Expenses</h3>
                            {totalMaterialCost > 0 && (
                                <span className='text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md'>
                                    Total: ₱{totalMaterialCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                            )}
                        </div>
                        
                        <div className='space-y-2'>
                            {materials.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                type="text"
                                placeholder="Item name"
                                value={item.material}
                                onChange={(e) => handleChange(index, "material", e.target.value)}
                                className="main__input flex-1"
                                />
                                <input
                                type="number"
                                placeholder="Cost"
                                value={item.cost}
                                onChange={(e) => handleChange(index, "cost", e.target.value)}
                                className="main__input w-24 md:w-32"
                                />
                                <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                >
                                <HiMiniMinus className="text-xl" />
                                </button>
                            </div>
                            ))}
                            <button 
                            type="button" 
                            className='w-full py-2 border border-dashed border-gray-300 text-gray-400 rounded-xl hover:text-customViolet hover:border-customViolet transition-colors text-sm font-medium flex items-center justify-center gap-2'
                            onClick={handleAdd}
                            >
                            <AiOutlinePlus /> Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-8 flex justify-end gap-3'>
           <button 
            className='px-6 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium transition-colors'
            onClick={() => changePage(4)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            className='primary__btn flex items-center gap-2 px-8'
            onClick={handleSubmit}
            disabled={submitting || !remarks.trim() || imageFiles.length < 2}
          >
            {submitting ? 'Saving...' : 'Submit Documentation'}
            <HiOutlineArrowNarrowRight className='text-xl'/>
          </button>
        </div>

      </div>
    </div>
  )
}

export default Documentation
