"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  AiOutlineDown,
  AiOutlineUpload,
  AiOutlineUser,
} from "react-icons/ai";
import {
  HiOutlineArrowNarrowLeft,
  HiOutlineArrowNarrowRight,
  HiX
} from "react-icons/hi";
import { TitleButton } from "./customcomponents";
import { ChangePageProps } from "@/types";
import { handleTenantUploadAndSubmit } from "@/lib/addTenant";

interface Property {
  propertyId: number;
  name: string;
  address: string;
  rent: number;
  currentTenants: number;
}

const AddTenant = ({ setPage }: ChangePageProps) => {
  const sexSelect = ["Male", "Female"];
  const [currSex, setCurrSex] = useState("Sex");
  const [sex, setSex] = useState(false);
  const toggleSex = () => setSex(!sex);
  const changeSex = (s: string) => {
    setCurrSex(s);
    setSex(false);
  };
  const [showRules, setShowRules] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [signedRules, setSignedRules] = useState(false);
  const [signedContract, setSignedContract] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<(string | null)[]>([null, null]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [idImages, setIdImages] = useState<File[]>([null as any, null as any]);
  
  const [rulesSignature, setRulesSignature] = useState<string>("");
  const [contractSignature, setContractSignature] = useState<string>("");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState<"rules" | "contract" | null>(null);
  const signaturePadRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    sex: "",
    bday: "",
    unitNumber: "",
    email: "",
    firstNumber: "",
    secondNumber: "",
  });

  const [loading, setLoading] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    profileImage: false,
    credentials: false,
    property: false,
    rulesSignature: false,
    contractSignature: false,
    lastName: false,
    firstName: false,
    firstNumber: false,
    secondNumber: false
  });

  const [fieldErrors, setFieldErrors] = useState({
    lastName: "",
    firstName: "",
    firstNumber: "",
    secondNumber: ""
  });

  // Validation functions
  const validateName = (name: string): boolean => {
    // Only allow letters, spaces, hyphens, and apostrophes
    return /^[A-Za-z\s\-']+$/.test(name);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Philippine phone number format: 9xx xxx xxxx (without +63)
    // Remove any spaces and validate format
    const cleaned = phone.replace(/\s/g, '');
    return /^9\d{9}$/.test(cleaned);
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as 9xx xxx xxxx
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate that the input contains only letters and allowed characters
    if (value === "" || validateName(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setValidationErrors(prev => ({ ...prev, [name]: false }));
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    } else {
      setFieldErrors(prev => ({ 
        ...prev, 
        [name]: "Name should only contain letters, spaces, hyphens, and apostrophes" 
      }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatPhoneNumber(value);
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    
    // Validate phone number format
    const cleanedValue = formattedValue.replace(/\s/g, '');
    if (cleanedValue === "" || validatePhoneNumber(cleanedValue)) {
      setValidationErrors(prev => ({ ...prev, [name]: false }));
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    } else if (cleanedValue) { // Only show error if there's actually input
      setValidationErrors(prev => ({ ...prev, [name]: true }));
      setFieldErrors(prev => ({ 
        ...prev, 
        [name]: "Please enter a valid Philippine phone number (9xx xxx xxxx format)" 
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Use specialized handlers for name and phone fields
    if (name === 'lastName' || name === 'firstName') {
      handleNameChange(e);
    } else if (name === 'firstNumber' || name === 'secondNumber') {
      handlePhoneChange(e);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties || []);
        } else {
          console.error('Failed to fetch properties');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (showSignaturePad && signaturePadRef.current) {
      const canvas = signaturePadRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#574964';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showSignaturePad, currentSignatureType]);

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setImage(event.target.result as string);
      };
      reader.readAsDataURL(file);
      setValidationErrors(prev => ({ ...prev, profileImage: false }));
    }
  };

  const handleIDUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...idImages];
      newImages[index] = file;
      setIdImages(newImages);
      const imageUrl = URL.createObjectURL(file);
      const updatedImages = [...selectedImages];
      updatedImages[index] = imageUrl;
      setSelectedImages(updatedImages);
      
      if (idImages.some(img => img) || file) {
        setValidationErrors(prev => ({ ...prev, credentials: false }));
      }
    }
  };

  const togglePropertyDropdown = () => {
    setShowPropertyDropdown(!showPropertyDropdown);
  };

  const selectProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData(prev => ({ ...prev, unitNumber: property.name }));
    setShowPropertyDropdown(false);
    setValidationErrors(prev => ({ ...prev, property: false }));
  };

  // Enhanced file naming function
  const renameFiles = (): { profileFile: File | null; idFiles: File[] } => {
    if (!selectedProperty || !formData.firstName || !formData.lastName) {
      return { profileFile, idFiles: idImages.filter(Boolean) as File[] };
    }

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const unitNo = selectedProperty.name.replace(/[^a-zA-Z0-9]/g, "_");
    const firstName = formData.firstName.replace(/[^a-zA-Z0-9]/g, "_");
    const lastName = formData.lastName.replace(/[^a-zA-Z0-9]/g, "_");

    // Rename profile image
    let renamedProfileFile: File | null = null;
    if (profileFile) {
      const profileExtension = profileFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const profileFileName = `PROFILE_${unitNo}_${firstName}_${lastName}_${timestamp}.${profileExtension}`;
      renamedProfileFile = new File([profileFile], profileFileName, { type: profileFile.type });
    }

    // Rename ID images with descriptive names
    const renamedIdFiles = idImages
      .filter(Boolean)
      .map((file, index) => {
        if (file) {
          const idExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const idType = index === 0 ? 'PRIMARY_ID' : 'SECONDARY_ID';
          const idFileName = `${idType}_${unitNo}_${firstName}_${lastName}_${timestamp}.${idExtension}`;
          return new File([file], idFileName, { type: file.type });
        }
        return file;
      })
      .filter(Boolean) as File[];

    return {
      profileFile: renamedProfileFile,
      idFiles: renamedIdFiles
    };
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signaturePadRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const canvas = signaturePadRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const canvas = signaturePadRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signaturePadRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    const canvas = signaturePadRef.current;
    if (canvas && currentSignatureType) {
      const signatureData = canvas.toDataURL('image/png');
      
      if (currentSignatureType === 'rules') {
        setRulesSignature(signatureData);
        setSignedRules(true);
        setValidationErrors(prev => ({ ...prev, rulesSignature: false }));
      } else if (currentSignatureType === 'contract') {
        setContractSignature(signatureData);
        setSignedContract(true);
        setValidationErrors(prev => ({ ...prev, contractSignature: false }));
      }
      
      setShowSignaturePad(false);
      setCurrentSignatureType(null);
      setShowContract(false);
      setShowRules(false);
    }
  };

  const openSignaturePad = (type: "rules" | "contract") => {
    setCurrentSignatureType(type);
    setShowSignaturePad(true);
  };

  const validateForm = (): boolean => {
    const nameErrors = {
      lastName: !formData.lastName || !validateName(formData.lastName),
      firstName: !formData.firstName || !validateName(formData.firstName)
    };

    // Clean phone numbers by removing spaces for validation
    const firstNumberCleaned = formData.firstNumber.replace(/\s/g, '');
    const secondNumberCleaned = formData.secondNumber.replace(/\s/g, '');

    const phoneErrors = {
      firstNumber: firstNumberCleaned ? !validatePhoneNumber(firstNumberCleaned) : false,
      secondNumber: secondNumberCleaned ? !validatePhoneNumber(secondNumberCleaned) : false
    };

    const errors = {
      profileImage: !profileFile,
      credentials: !idImages[0] && !idImages[1],
      property: !selectedProperty,
      rulesSignature: !rulesSignature || !signedRules,
      contractSignature: !contractSignature || !signedContract,
      lastName: nameErrors.lastName,
      firstName: nameErrors.firstName,
      firstNumber: phoneErrors.firstNumber,
      secondNumber: phoneErrors.secondNumber
    };

    setValidationErrors(errors);

    // Set field error messages
    if (nameErrors.lastName && formData.lastName) {
      setFieldErrors(prev => ({ ...prev, lastName: "Last name should only contain letters" }));
    } else {
      setFieldErrors(prev => ({ ...prev, lastName: "" }));
    }
    
    if (nameErrors.firstName && formData.firstName) {
      setFieldErrors(prev => ({ ...prev, firstName: "First name should only contain letters" }));
    } else {
      setFieldErrors(prev => ({ ...prev, firstName: "" }));
    }
    
    if (phoneErrors.firstNumber && formData.firstNumber) {
      setFieldErrors(prev => ({ ...prev, firstNumber: "Please enter a valid Philippine phone number (9xx xxx xxxx format)" }));
    } else {
      setFieldErrors(prev => ({ ...prev, firstNumber: "" }));
    }
    
    if (phoneErrors.secondNumber && formData.secondNumber) {
      setFieldErrors(prev => ({ ...prev, secondNumber: "Please enter a valid Philippine phone number (9xx xxx xxxx format)" }));
    } else {
      setFieldErrors(prev => ({ ...prev, secondNumber: "" }));
    }

    return !Object.values(errors).some(error => error);
  };

  const resetForm = () => {
    setFormData({
      lastName: '',
      firstName: '',
      middleInitial: '',
      sex: '',
      bday: '',
      unitNumber: '',
      email: '',
      firstNumber: '',
      secondNumber: '',
    });
    setSelectedProperty(null);
    setImage(null);
    setProfileFile(null);
    setSelectedImages([null, null]);
    setIdImages([null as any, null as any]);
    setCurrSex('Male');
    setRulesSignature('');
    setContractSignature('');
    setSignedRules(false);
    setSignedContract(false);
    setFieldErrors({
      lastName: '',
      firstName: '',
      firstNumber: '',
      secondNumber: '',
    });
  };  

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please complete all required fields correctly and sign both documents.');
      return;
    }
  
    setLoading(true);
  
    try {
      // 1. Check if email already exists in database
      const emailCheckResponse = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.toLowerCase() }),
      });
  
      const emailCheckResult = await emailCheckResponse.json();
  
      if (!emailCheckResult.available) {
        alert('This email address is already registered in our system. Please use a different email.');
        setLoading(false);
        return;
      }
  
      // 2. Generate PDF documents and upload to GitHub
      const documentsResponse = await fetch('/api/generate-tenancy-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleInitial: formData.middleInitial,
            sex: currSex,
            bday: formData.bday,
            email: formData.email,
            firstNumber: formData.firstNumber.replace(/\s/g, ''),
            unitNumber: selectedProperty?.name,
            rulesAgreed: signedRules,
            contractAgreed: signedContract,
          },
          // Signatures must be at root level for API validation
          rulesSignature: rulesSignature,
          contractSignature: contractSignature,
          property: selectedProperty,
        }),
      });
  
      const documentsResult = await documentsResponse.json();
      if (!documentsResult.success) {
        alert('Failed to generate tenancy documents. Please try again.');
        setLoading(false);
        return;
      }
  
      const rulesDoc = documentsResult.documents.find((doc: any) => doc.type === 'rules');
      const contractDoc = documentsResult.documents.find((doc: any) => doc.type === 'contract');
  
      // 3. Rename files before submission (no arguments)
      const { profileFile: renamedProfileFile, idFiles: renamedIdFiles } = renameFiles();
  
      // 4. Build tenant data payload
      const tenantData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleInitial: formData.middleInitial,
        sex: currSex,
        bday: formData.bday,
        // force string here
        unitNumber: selectedProperty?.name ?? '',
        propertyId: selectedProperty?.propertyId ?? 0,
        email: formData.email,
        firstNumber: formData.firstNumber.replace(/\s/g, ''),
        secondNumber: formData.secondNumber.replace(/\s/g, ''),
        profileImage: renamedProfileFile,
        idImages: renamedIdFiles,
        signature: contractSignature,
        agreedToRules: signedRules,
        agreedToContract: signedContract,
        signedRulesUrl: rulesDoc?.url,
        signedContractUrl: contractDoc?.url,
      };
  
      // 5. Submit tenant data (with resetForm as 3rd arg)
      await handleTenantUploadAndSubmit(tenantData, setLoading, resetForm);
  
      // 6. Send credentials email with document URLs (2 args)
      await sendCredentialsEmail(rulesDoc?.url, contractDoc?.url);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('An error occurred during submission. Please try again.');
      setLoading(false);
    }
  };
  
  

  // Generate password for display
  const generatedPassword = formData.firstName && formData.lastName && formData.unitNumber
    ? formData.firstName.replace(/\s+/g, "").toLowerCase() + 
      formData.lastName.replace(/\s+/g, "").toLowerCase() + 
      "_" + 
      formData.unitNumber.replace(/Unit/gi, '').replace(/\s+/g, "").toLowerCase()
    : "";

  const sendCredentialsEmail = async (rulesUrl?: string, contractUrl?: string) => {
    try {
      const emailResponse = await fetch('/api/send-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          unitNumber: selectedProperty?.name || "",
          username: formData.email,
          password: generatedPassword,
          rulesDocumentUrl: rulesUrl,
          contractDocumentUrl: contractUrl
        }),
      });

      const emailResult = await emailResponse.json();
      if (!emailResult.success) {
        console.error('Failed to send credentials email:', emailResult.error);
      } else {
        console.log('Credentials email sent successfully with documents');
      }
    } catch (error) {
      console.error('Failed to send credentials email:', error);
    }
  };

  const TenancyRules = () => (
    <div className="bg-slate-50 text-customViolet px-4 py-3 leading-relaxed text-justify max-h-[80%] w-[95%] rounded-xl shadow-md shadow-black/50 overflow-x-hidden text-sm fixed flex flex-col top-1/2 left-1/2 -translate-1/2">
      <h3 className="text-lg font-bold text-center mb-4" style={{color: '#574964'}}>MGA PANUNTUNAN, REGULASYON, AT PANANAGUTAN SA PAG-UPA</h3>
      
      <div className="space-y-3">
        <p className="text-center font-semibold">RODRIGUEZ PROPERTIES</p>
        <p className="text-center mb-4">Ako, <span className="underline">{formData.firstName} {formData.lastName}</span>, ay sumasang-ayon na sumunod sa mga sumusunod na panuntunan at regulasyon:</p>

        <div className="space-y-3">
          <p><strong>1. PANGKALAHATANG TUNTUNIN</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ang kontrata ng pag-upa (Contract of Lease) ay ang pangunahing gabay ng ugnayan ng partido</li>
            <li>Ang anumang probisyon dito ang susundin hangga't hindi ito labag sa umiiral na batas</li>
            <li>Sundin ang mga probisyon ng Batas Pambansa at kontrata ng pag-upa</li>
          </ul>

          <p><strong>2. PAGBABAYAD NG UPA AT MGA DEPOSITO</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ang buwanang upa ay babayaran sa itinakdang araw na nakasaad sa kontrata</li>
            <li>Karaniwang ang pamantayan ay bayad nang advance sa loob ng unang limang (5) araw ng buwan</li>
            <li>Hindi maaaring hingin ng lessor ang higit sa isang (1) buwan na advance rent</li>
            <li>Hindi maaaring hingin ang higit sa dalawang (2) buwan na deposito</li>
            <li>Ang deposito ay dapat panatilihin sa bangko sa pangalan ng lessor sa buong panahon ng kontrata</li>
          </ul>

          <p><strong>3. SECURITY DEPOSIT AT PAGBABALIK</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ang security deposit ay ginagamit lamang para sa mga pinahihintulutang bawas:</li>
            <ul className="list-circle list-inside ml-4 space-y-1">
              <li>Hindi nabayarang upa</li>
              <li>Bayarin para sa mga nai-uyong pagkukumpuni na dapat sagutin ng lessee</li>
              <li>Hindi nabayarang utility at association dues</li>
              <li>Pinsalang lampas sa normal na pagsuot at pagluwal</li>
            </ul>
            <li>Ang anumang balanse ng deposito ay dapat ibalik sa lessee pagkatapos ng pag-termino</li>
            <li>Dapat ibalik ang deposito ayon sa napagkasunduan sa kontrata o alinsunod sa batas</li>
          </ul>

          <p><strong>4. MGA PANANAGUTAN NG NAGPAPAUPA (LESSOR)</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ibigay ang unit sa kundisyon na angkop para sa nilalayong gamit</li>
            <li>Tiyaking mapayapa at sapat ang pag-aari sa buong panahon ng pag-upa</li>
            <li>Tiyaking magsagawa ng kinakailangang mga pagkukumpuni</li>
            <li>Responsibilidad sa major structural repairs maliban kung may kasunduan</li>
          </ul>

          <p><strong>5. MGA PANANAGUTAN NG UMUUPA (LESSEE)</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Bayaran ang upa sa takdang oras</li>
            <li>Gamitin ang unit nang may pananagutang katulad ng maingat na tao</li>
            <li>Huwag magsagawa ng pagbabago o malakihang improvement nang walang nakasulat na pahintulot</li>
            <li>Ibalik ang unit sa katapusan ng lease sa kondisyon na katulad ng tinanggap maliban sa normal na pagsuot</li>
            <li>Panatilihing malinis at maayos ang unit</li>
          </ul>

          <p><strong>6. PAGWAWAKAS NG KONTRATA AT PAUNAWA</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ang paunang pagwawakas (early termination) ay dapat nakasaad sa kontrata</li>
            <li>Karaniwang may kinakailangang paunang abiso (30 hanggang 60 araw)</li>
            <li>Maaaring may kabayaran bilang kompensasyon depende sa napagkasunduan</li>
            <li>Kapag ang yunit ay ibinalik bago matapos ang kontrata, ang mga obligasyon sa pag-aayos ng upa at deposito ay iuulat ayon sa kontraktwal na mga probisyon</li>
          </ul>

          <p><strong>7. MGA BAYARIN SA UTILITIES AT ASSOCIATION FEES</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ang responsibilidad para sa kuryente, tubig, internet, at condo/HOA dues ay dapat malinaw na nakasaad sa kontrata</li>
            <li>Alamin kung sino ang sasagot at kung paano ibabayad</li>
          </ul>

          <p><strong>8. PANUNTUNAN SA MGA BISITA, PAGSASALIN-SALIN AT SUBLEASE</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ang regular na bisita (guests) ay pinahihintulutan hangga't hindi nagiging permanente</li>
            <li>Hindi dapat lumalabag sa kasunduan ang mga bisita</li>
            <li>Ang assignment ng lease o subleasing ay dapat may nakasulat na pahintulot mula sa lessor</li>
          </ul>

          <p><strong>9. INSPEKSYON, ACCESS AT MAINTENANCE</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Maaaring magkaroon ng makatwirang inspeksyon ang lessor matapos magbigay ng sapat na paunawa (24-48 oras)</li>
            <li>Sa mga emergency (sunog, baha, malaking sira), ang lessor ay maaaring pumasok agad</li>
          </ul>

          <p><strong>10. PAGLABAG, MULTA AT RESOLUSYON NG ALITAN</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ang hindi pagbabayad ng upa sa itinakdang panahon ay maaaring magresulta sa penalty o interest</li>
            <li>Para sa mga seryosong paglabag (ilegal na gawain, malakihang pinsala), maaaring simulan ang pag-uutos ng pag-alis</li>
            <li>Ang mga usapin ay unang sisikaping maresolba sa pamamagitan ng pag-uusap</li>
            <li>Kung hindi, maaaring gumamit ng mediation o arbitrasyon at huli ay pagdala sa korte</li>
          </ul>

          <p><strong>11. IBA PANG TUNTUNIN AT KONDISYON</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Sumunod sa lokal na ordinansa at mga regulasyon ng building o barangay</li>
            <li>Garbage segregation at noise ordinances</li>
            <li>Ang paglalagay ng signage, negosyo o komersyal na operasyon ay dapat malinaw na pinapayagan sa kontrata</li>
          </ul>

          <p className="font-semibold mt-4">Ako ay nagpapatunay na nabasa at naintindihan ko ang lahat ng panuntunan at regulasyong nakasaad sa itaas at sumasang-ayon na sundin ang mga ito.</p>

          <div className="mt-6 border-t pt-4">
            <div className="flex flex-col items-center">
              <p className="font-semibold mb-2">Lagda ng Umuupa (Lessee's Signature)</p>
              {rulesSignature ? (
                <div className="text-center">
                  <img src={rulesSignature} alt="Rules Signature" className="h-20 mx-auto"/>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openSignaturePad('rules')}
                  className="px-4 py-2 text-sm border rounded"
                  style={{borderColor: '#574964', color: '#574964'}}
                >
                  Lagdaan ang Mga Panuntunan at Regulasyon
                </button>
              )}
              <p className="text-sm text-gray-600 mt-2">{formData.firstName} {formData.lastName}</p>
              <p className="text-sm text-gray-600">Petsa: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TenancyContract = () => (
    <div className="bg-slate-50 px-4 py-3 leading-relaxed text-justify max-h-[80%] w-[95%] rounded-xl shadow-md shadow-black/50 overflow-x-hidden text-sm fixed flex flex-col top-1/2 left-1/2 -translate-1/2">
      <h3 className="text-lg font-bold text-center mb-4 px-11" style={{color: '#574964'}}>KASUNDUAN SA PAUPA (LEASE AGREEMENT)</h3>
        
      <div className="space-y-3">
          <div className="text-center border-b pb-2 mb-3">
            <p>
              Ang kasunduang ito ay pinirmahan ngayong 
              <span className="border-b mx-1">{new Date().toLocaleString('en-US', { day: 'numeric' })}</span> 
              araw ng 
              <span className="border-b mx-1">{new Date().toLocaleString('en-US', { month: 'long' })}</span>
              , 
              <span className="border-b mx-1">{new Date().toLocaleString('en-US', { year: 'numeric' })}</span>
              </p>
            <p className="mt-5"><strong>SA PAGITAN NG:</strong></p>
          </div>

          <div className="space-y-2">
            <p className="flex flex-col"><strong>NAGPAPAUPA (LESSOR):</strong> <span>MARILOU STA ANA RODRIGUEZ</span></p>
            
            <p className="text-center"><strong>AT</strong></p>
            
            <p className="uppercase flex flex-col"><strong>UMUUPA (LESSEE):</strong> {formData.firstName} {formData.middleInitial ? formData.middleInitial + '. ' : ''}{formData.lastName}</p>

            <p className="pt-5 border-t mt-3"><strong>1. LAYUNIN NG KASUNDUAN</strong></p>
            <p>Ang NAGPAPAUPA ay pumapayag na magpaupa at ang UMUUPA ay tumatanggap sa pag-upa ng sumusunod na ari-arian:<span className="font-semibold ml-1">{selectedProperty?.name}, {selectedProperty?.address}</span></p>
            

            <p><strong>2. HALAGA NG UPA</strong></p>
            <p>Ang buwanang upa ay nagkakahalaga ng <strong>₱{selectedProperty?.rent?.toLocaleString()}</strong>, na babayaran tuwing <strong>unang araw</strong> ng bawat buwan.</p>

            <p><strong>3. DEPOSITO</strong></p>
            <p>Ang UMUUPA ay magbibigay ng isang (1) buwang advance at isang (1) buwang security deposit. Ang security deposit ay maaaring gamitin para sa anumang hindi nabayarang upa o sira sa ari-arian at ibabalik matapos ang inspeksiyon sa pag-alis ng UMUUPA.</p>

            <p><strong>4. GAMIT NG ARI-ARIAN</strong></p>
            <p>Ang Ari-arian ay gagamitin lamang bilang tirahan at hindi maaaring gamitin sa ilegal o komersyal na aktibidad nang walang pahintulot ng NAGPAPAUPA.</p>

            <p><strong>5. RESPONSIBILIDAD SA PAGPAPAREPAIR</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Minor repairs</strong> (hal. ilaw, gripo, maliit na sira) ay responsibilidad ng UMUUPA</li>
              <li><strong>Major structural repairs</strong> ay sagot ng NAGPAPAUPA maliban kung ang sira ay dulot ng kapabayaan ng UMUUPA</li>
            </ul>

            <p><strong>6. MGA ALITUNTUNIN SA BAHAY (HOUSE RULES)</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Ipinagbabawal ang malakas na ingay mula 10:00 PM hanggang 6:00 AM</li>
              <li>Hindi pinahihintulutan ang pagdadala ng mga alagang hayop maliban kung may pahintulot ng NAGPAPAUPA</li>
              <li>Mahigpit na ipinagbabawal ang paninigarilyo sa loob ng Ari-arian</li>
              <li>Responsibilidad ng UMUUPA na panatilihing malinis at maayos ang Ari-arian</li>
            </ul>

            <p><strong>7. PENALTIES</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>Sira sa Ari-arian:</strong> Ang anumang sira maliban sa normal wear and tear ay ibabawas sa security deposit o ipapabayad sa UMUUPA</li>
              <li><strong>Paglabag sa house rules:</strong> Maaaring magresulta sa verbal warning; paulit-ulit na paglabag ay maaaring magresulta sa termination ng kontrata</li>
            </ul>

            <p><strong>8. BISITA AT MGA NAKATIRA</strong></p>
            <p>Hindi maaaring manirahan ang sinumang hindi nakasaad sa kasunduang ito nang walang abiso at pahintulot mula sa NAGPAPAUPA. Ang mga bisita ay hindi maaaring manatili nang lampas 3 araw nang walang pahintulot.</p>

            <p><strong>9. PAGTATAPOS NG KONTRATA</strong></p>
            <p>Ang alinmang partido ay maaaring magbigay ng paunang abiso na hindi bababa sa 30 araw bago umalis o tapusin ang kontrata.</p>

            <p><strong>10. PAGLABAG SA KASUNDUAN</strong></p>
            <p>Ang paglabag ng alinmang partido sa mga probisyon ay maaaring magresulta sa agarang pagpapaalis o legal na aksyon alinsunod sa batas ng Pilipinas.</p>

            <p><strong>11. PAGPAPATUPAD NG BATAS</strong></p>
            <p>Ang kasunduang ito ay pinamamahalaan at bibigyang-kahulugan ayon sa umiiral na batas ng Republika ng Pilipinas.</p>

            <p className="font-semibold mt-6 text-center">PINATUTUNAYAN NG MGA PARTIDO na kanilang nabasa, naintindihan, at kusang tinanggap ang lahat ng nilalaman ng kasunduang ito.</p>

            <div className="mt-6 space-y-4">
              <div className="flex flex-col">
                <div>
                  <p className="font-semibold">INAPRUBAHAN NG:</p>
                  <div className="mt-4">
                    <p className="font-semibold">NAGPAPAUPA:</p>
                    <p>MARILOU STA ANA RODRIGUEZ</p>
                    <p>Petsa: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-semibold mt-4">UMUUPA:</p>
                  <div>
                    {contractSignature ? (
                      <div className="text-center">
                        <img src={contractSignature} alt="Contract Signature" className="h-20 mx-auto"/>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Hindi pa nalalagdaan</p>
                    )}
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>Petsa: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              {!contractSignature && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => openSignaturePad('contract')}
                    className="px-4 py-2 text-sm border rounded"
                    style={{borderColor: '#574964', color: '#574964'}}
                  >
                    Lagdaan ang Kasunduan sa Paupa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 md:gap-5 px-5 md:px-8 lg:px-12 py-3 md:py-5 select-none bg-white rounded-t-2xl overflow-hidden relative" style={{color: '#574964'}}>
      <TitleButton setPage={setPage} title="Tenant Information" />

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8 overflow-x-hidden max-w-full mx-auto w-full">
        {/* Column 1: Personal Information */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl md:text-2xl lg:text-xl font-semibold">Personal Information</h2>

          <div className="flex items-center justify-center h-auto w-full py-2 md:py-4 flex-col gap-2 md:gap-3">
            <button
              onClick={handleButtonClick}
              className={`outline-none rounded-full h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 text-white overflow-hidden flex items-center justify-center hover:scale-105 transition-transform ${
                validationErrors.profileImage ? "ring-2 ring-red-500" : ""
              }`}
              style={{backgroundColor: '#574964'}}
              type="button"
            >
              {image ? (
                <img src={image} alt="Selected" className="object-cover w-full h-full rounded-full" />
              ) : (
                <AiOutlineUser className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />
              )}
            </button>
            {validationErrors.profileImage && (
              <p className="text-red-500 text-sm">Profile image is required</p>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" required />
          </div>

          <div className="grid grid-cols-12 gap-3 md:gap-4 text-sm md:text-base">
            <div className="col-span-full">
              <input 
                name="lastName" 
                type="text" 
                placeholder="Last Name *" 
                value={formData.lastName} 
                onChange={handleChange} 
                className={`w-full text-base p-3 px-5 border rounded placeholder:text-customViolet/50 hover:border-customViolet ease-out duration-200 ${
                  validationErrors.lastName || fieldErrors.lastName ? "border-red-500 ring-2 ring-red-500" : "border-customViolet/50"
                }`} 
                required 
              />
              {fieldErrors.lastName && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>
              )}
            </div>
            
            <div className="col-span-full">
              <input 
                name="firstName" 
                type="text" 
                placeholder="First Name *" 
                value={formData.firstName} 
                onChange={handleChange} 
                className={`w-full text-base p-3 px-5 border rounded placeholder:text-customViolet/50 hover:border-customViolet ease-out duration-200 ${
                  validationErrors.firstName || fieldErrors.firstName ? "border-red-500 ring-2 ring-red-500" : "border-customViolet/50"
                }`} 
                required 
              />
              {fieldErrors.firstName && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>
              )}
            </div>
            
            <input 
              name="middleInitial" 
              type="text" 
              placeholder="M" 
              value={formData.middleInitial}
              onChange={handleChange} 
              className="col-span-3 text-base p-3 text-center border border-customViolet/50 rounded placeholder:text-customViolet/50 hover:border-customViolet ease-out duration-200" 
              maxLength={1} 
            />

            <div className="col-span-3 relative">
              <button type="button" className="w-full flex items-center justify-between text-base p-3 border border-customViolet/50 rounded text-customViolet/50 hover:text-customViolet hover:border-customViolet ease-out duration-200" onClick={toggleSex}>
                {currSex} <AiOutlineDown className="w-4 h-4" />
              </button>
              {sex && (
                <div className="absolute top-12 bg-white border rounded w-full z-10">
                  {sexSelect.map((s, i) => (
                    <button key={i} className="w-full py-2 px-3 text-left hover:bg-gray-100" onClick={() => changeSex(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <input 
              name="bday" 
              type="date" 
              value={formData.bday} 
              onChange={handleChange} 
              className="col-span-6 text-base p-3 border border-customViolet/50 rounded text-customViolet/50 hover:text-customeViolet hover:border-customViolet ease-out duration-200" 
            />
            
            <div className="col-span-12 relative">
              <button
                type="button"
                className={`w-full flex items-center justify-between text-base p-3 px-5 border border-customViolet/50 rounded text-customViolet/50 hover:text-customViolet hover:border-customViolet ease-out duration-200 ${validationErrors.property ? "ring-2 ring-red-500" : ""}`}
                onClick={togglePropertyDropdown}
              >
                {selectedProperty ? selectedProperty.name : "Select Unit"} <AiOutlineDown className="w-4 h-4" />
              </button>
              {showPropertyDropdown && (
                <div className="absolute top-12 bg-white border rounded w-full max-h-60 overflow-y-auto z-10">
                  {properties.map((property) => (
                    <button key={property.propertyId} className="w-full py-2 px-3 text-left hover:bg-gray-100 flex items-center justify-between" onClick={() => selectProperty(property)}>
                      <span>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-xs text-gray-600">{property.address}</p>
                      </span>
                      <span className="px-2 py-1 rounded-full text-white text-xs" style={{backgroundColor: '#574964'}}>{property.currentTenants}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input name="email" type="email" placeholder="@email.com" value={formData.email} onChange={handleChange} className="col-span-12 text-base p-3 px-5 border border-customViolet/50 rounded placeholder:text-customViolet/50 hover:border-customViolet ease-out duration-200" required />
            
            <div className="col-span-6">
              <div className={`text-base p-3 px-5 border rounded placeholder:text-customViolet/50 hover:border-customViolet ease-out duration-200 flex gap-3 ${
                validationErrors.firstNumber || fieldErrors.firstNumber ? "border-red-500 ring-2 ring-red-500" : "border-customViolet/50"
              }`}>
                <span>+63</span>
                <input 
                  name="firstNumber" 
                  type="tel" 
                  value={formData.firstNumber} 
                  onChange={handleChange} 
                  className="w-full outline-none" 
                  placeholder="9xx xxx xxxx" 
                  maxLength={12}
                />
              </div>
              {fieldErrors.firstNumber && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.firstNumber}</p>
              )}
            </div>
            
            <div className="col-span-6">
              <div className={`text-base p-3 px-5 border rounded placeholder:text-customViolet/50 hover:border-customViolet ease-out duration-200 flex gap-3 ${
                validationErrors.secondNumber || fieldErrors.secondNumber ? "border-red-500 ring-2 ring-red-500" : "border-customViolet/50"
              }`}>
                <span>+63</span>
                <input 
                  name="secondNumber" 
                  type="tel" 
                  value={formData.secondNumber} 
                  onChange={handleChange} 
                  className="w-full outline-none" 
                  placeholder="9xx xxx xxxx" 
                  maxLength={12}
                />
              </div>
              {fieldErrors.secondNumber && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.secondNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Credentials */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Credentials *</h2>
          {validationErrors.credentials && (
            <p className="text-red-500 text-sm -mt-3">At least one credential image is required</p>
          )}
          <div className="grid grid-cols-12 lg:grid-cols-1 gap-3">
            {[0, 1].map((i) => (
              <div key={i} className={`col-span-6 lg:col-span-1 rounded bg-gray-100 h-40 flex flex-col relative ${validationErrors.credentials && !idImages[0] && !idImages[1] ? "ring-2 ring-red-500" : ""}`}>
                <label className="flex items-center justify-center h-full w-full text-xs flex-col bg-slate-50 cursor-pointer">
                  {idImages[i] ? (
                    <img src={selectedImages[i]!} alt={`Uploaded ${i + 1}`} className="object-cover w-full h-full" />
                  ) : (
                    <>
                      <AiOutlineUpload className="w-12 h-12" style={{color: '#574964'}} />
                      {i === 0 ? "Primary ID *" : "Secondary ID *"}
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleIDUpload(i, e)} className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Tenancy Agreement */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Tenancy Agreement</h2>
          <div className="flex flex-col gap-4">
            <div className={`w-full border rounded-lg p-4 ${signedRules ? 'border-transparent bg-emerald-600 text-white' : 'border-customViolet'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Rules and Regulations</h3>
                <button type="button" onClick={() => setShowRules(!showRules)} className="px-3 py-1 text-sm border rounded">
                  {showRules ? "Hide" : "View"}
                </button>
              </div>
              {showRules && 
                <>
                  <button 
                  type="button" 
                  className="fixed top-24 right-5 z-70 text-4xl text-customViolet/50 hover:text-customViolet focus:text-rose-500 ease-out duration-200"
                  onClick={() => setShowRules(false)}
                  ><HiX /></button>
                  <TenancyRules/>
                </>
              }
              {validationErrors.rulesSignature && (
                <p className="text-red-500 text-sm mt-2">Please sign the Rules and Regulations document</p>
              )}
            </div>

            <div className={`w-full border rounded-lg p-4 ${signedContract ? 'border-transparent bg-emerald-600 text-white' : 'border-customViolet'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Tenancy Contract</h3>
                <button type="button" onClick={() => setShowContract(!showContract)} className="px-3 py-1 text-sm border rounded">
                  {showContract ? "Hide" : "View"}
                </button>
              </div>
              {showContract && 
                <>
                  <button 
                  type="button" 
                  className="fixed top-24 right-5 z-70 text-4xl text-customViolet/50 hover:text-customViolet focus:text-rose-500 ease-out duration-200"
                  onClick={() => setShowContract(false)}
                  ><HiX /></button>
                  <TenancyContract />
                </>
              }
              {validationErrors.contractSignature && (
                <p className="text-red-500 text-sm mt-2">Please sign the Tenancy Contract document</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSignaturePad && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                Provide Your Signature for {currentSignatureType === 'rules' ? 'Rules and Regulations' : 'Tenancy Contract'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">Sign in the box below using your mouse or touch screen</p>
              
              <div className="border-2 border-gray-300 rounded mb-4">
                <canvas
                  ref={signaturePadRef}
                  width={400}
                  height={200}
                  className="w-full bg-white cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={clearSignature} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100">
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignaturePad(false);
                    setCurrentSignatureType(null);
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="button" onClick={saveSignature} className="px-4 py-2 text-sm text-white rounded" style={{backgroundColor: '#574964'}}>
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        )}

      <div className="w-full flex justify-end gap-2 mt-5">
        <button
          disabled={loading}
          onClick={() => setPage(5)}
          className="flex items-center border border-gray-400 rounded gap-3 text-gray-400 px-5 py-3 disabled:opacity-50"
        >
          <HiOutlineArrowNarrowLeft className="w-5 h-5" /> Cancel
        </button>
        <button
          disabled={loading || !signedRules || !signedContract || !rulesSignature || !contractSignature}
          onClick={handleSubmit}
          className={`flex items-center text-white rounded px-5 py-3 gap-3 ${
            (!signedRules || !signedContract || !rulesSignature || !contractSignature) ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{backgroundColor: '#574964'}}
        >
          {loading ? "Creating..." : "Create Account"}
          <HiOutlineArrowNarrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AddTenant;