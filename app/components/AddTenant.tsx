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
} from "react-icons/hi";
import { TitleButton } from "./customcomponents";
import { ChangePageProps } from "@/types";
import { TenantFormData, handleTenantUploadAndSubmit } from "@/lib/addTenant";

interface Property {
  propertyId: number;
  name: string;
  address: string;
  rent: number;
  currentTenants: number;
}

const AddTenant = ({ setPage }: ChangePageProps) => {
  const sexSelect = ["M", "F"];
  const [currSex, setCurrSex] = useState("Sex");
  const [sex, setSex] = useState(false);
  const toggleSex = () => setSex(!sex);
  const changeSex = (s: string) => {
    setCurrSex(s);
    setSex(false);
  };
  const [agreed, setAgreed] = useState(false);

  // -----------------------------
  // 📷 Profile Image Upload (Now Required)
  // -----------------------------
  const [image, setImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<(string | null)[]>([null, null]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [idImages, setIdImages] = useState<File[]>([null as any, null as any]);
  
  // Property dropdown state
  const [properties, setProperties] = useState<Property[]>([]);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    sex: "",
    age: "",
    bday: "",
    unitNumber: "",
    email: "",
    firstNumber: "",
    secondNumber: "",
  });

  const [loading, setLoading] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    profileImage: false,
    credentials: false,
    property: false
  });

  // Fetch properties on component mount
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
      
      // Clear credential validation error if at least one image is uploaded
      if (idImages.some(img => img) || file) {
        setValidationErrors(prev => ({ ...prev, credentials: false }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Property dropdown handlers
  const togglePropertyDropdown = () => {
    setShowPropertyDropdown(!showPropertyDropdown);
  };

  const selectProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData(prev => ({ ...prev, unitNumber: property.name }));
    setShowPropertyDropdown(false);
    setValidationErrors(prev => ({ ...prev, property: false }));
  };

  // Function to rename files with proper format
  const renameFiles = (): { profileFile: File | null; idFiles: File[] } => {
    if (!selectedProperty || !formData.firstName || !formData.lastName) {
      return { profileFile, idFiles: idImages.filter(Boolean) as File[] };
    }

    const unitNo = selectedProperty.name.replace(/\s+/g, "_");
    const firstName = formData.firstName.replace(/\s+/g, "_");
    const lastName = formData.lastName.replace(/\s+/g, "_");

    // Rename profile image
    let renamedProfileFile: File | null = null;
    if (profileFile) {
      const profileExtension = profileFile.name.split('.').pop();
      const profileFileName = `${unitNo}_${firstName}_${lastName}_profileImage.${profileExtension}`;
      renamedProfileFile = new File([profileFile], profileFileName, { type: profileFile.type });
    }

    // Rename ID images
    const renamedIdFiles = idImages
      .filter(Boolean)
      .map((file, index) => {
        if (file) {
          const idExtension = file.name.split('.').pop();
          const idFileName = `${unitNo}_${firstName}_${lastName}_ID_${index + 1}.${idExtension}`;
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

  const validateForm = (): boolean => {
    const errors = {
      profileImage: !profileFile,
      credentials: !idImages[0] && !idImages[1],
      property: !selectedProperty
    };

    setValidationErrors(errors);
    return !errors.profileImage && !errors.credentials && !errors.property;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Rename files before submission
    const { profileFile: renamedProfileFile, idFiles: renamedIdFiles } = renameFiles();

    const tenantData: TenantFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleInitial: formData.middleInitial,
      sex: currSex,
      age: formData.age,
      bday: formData.bday,
      unitNumber: selectedProperty?.name || "",
      propertyId: selectedProperty?.propertyId || 0,
      email: formData.email,
      firstNumber: formData.firstNumber,
      secondNumber: formData.secondNumber,
      profileImage: renamedProfileFile,
      idImages: renamedIdFiles,
    };

    await handleTenantUploadAndSubmit(tenantData, setLoading, () => {
      
      // Send email after successful account creation
      sendCredentialsEmail();
      
      // Reset form
      setFormData({
        lastName: "",
        firstName: "",
        middleInitial: "",
        sex: "",
        age: "",
        bday: "",
        unitNumber: "",
        email: "",
        firstNumber: "",
        secondNumber: "",
      });
      setSelectedProperty(null);
      setImage(null);
      setProfileFile(null);
      setSelectedImages([null, null]);
      setIdImages([null as any, null as any]);
      setCurrSex("Sex");
      setAgreed(false);
    });
  };

  
  // Generate password for display
  const generatedPassword = formData.firstName && formData.lastName && formData.unitNumber
    ? formData.firstName.replace(/\s+/g, "").toLowerCase() + 
      formData.lastName.replace(/\s+/g, "").toLowerCase() + 
      "_" + 
      formData.unitNumber.replace(/Unit/gi, '').replace(/\s+/g, "").toLowerCase()
    : "";

  const sendCredentialsEmail = async () => {
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
        }),
      });

      const emailResult = await emailResponse.json();
    } catch (error) {
      console.error('Failed to send credentials email:', error);
    }
  };

  return (
    <div className="column__align text-customViolet gap-3 px-5 py-3 select-none bg-white rounded-t-2xl overflow-hidden relative">
      
      <TitleButton setPage={setPage} title="Tenant Information" />
      <div className="max__size flex flex-col gap-5 overflow-x-hidden">
        <h2 className="h2__style mr-auto md:mt-5">Personal Information</h2>

        {/* Profile Image - Required */}
        <div className="flex__center__all h-auto w-full py-2 flex-col gap-2">
          <button
            onClick={handleButtonClick}
            className={`focus__action click__action outline-none rounded-full bg-customViolet h-24 w-24 text-white md:h-28 md:w-28 overflow-hidden flex items-center justify-center ${
              validationErrors.profileImage ? "ring-2 ring-red-500" : ""
            }`}
            type="button"
          >
            {image ? (
              <img
                src={image}
                alt="Selected"
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <AiOutlineUser className="max__size mt-2" />
            )}
          </button>
          {validationErrors.profileImage && (
            <p className="text-red-500 text-sm">Profile image is required</p>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            required
          />
        </div>

        {/* Form Inputs */}
        <div className="primary__btn__holder text-sm md:text-base">
          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="col-span-6 main__input input__text text__overflow md:col-span-6"
            required
          />
          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="col-span-6 main__input input__text text__overflow md:col-span-6"
            required
          />
          <input
            name="middleInitial"
            type="text"
            placeholder="M"
            value={formData.middleInitial}
            onChange={handleChange}
            className="col-span-2 main__input input__text text__overflow md:col-span-1 md:text-center text-center"
            maxLength={1}
          />

          {/* Sex Dropdown */}
          <div className="h-auto w-auto relative col-span-3 md:col-span-2">
            <button
              type="button"
              className="main__input flex__center__y pr-3 w-full group justify-between"
              onClick={toggleSex}
            >
              {currSex}{" "}
              <AiOutlineDown className="click__action text-base rounded-xs group-focus:text-emerald-700 group-focus:scale-110" />
            </button>
            {sex && (
              <div className="column__align rounded-sm items-center gap-0.5 text-sm font-light tracking-wide absolute top-12 bg-zinc-100 overflow-hidden ring-1 ring-white z-10 w-full">
                {sexSelect.map((s, i) => (
                  <button
                    key={i}
                    className="w-full py-2 px-3 outline-none text-left hover:bg-customViolet/70 hover:text-white focus:bg-customViolet/70 focus:text-white"
                    onClick={() => changeSex(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            name="age"
            type="number"
            placeholder="0"
            min={0}
            max={120}
            value={formData.age}
            onChange={handleChange}
            className="col-span-2 main__input input__text text__overflow md:col-span-1 md:text-center text-center"
          />
          <input
            name="bday"
            type="date"
            value={formData.bday}
            onChange={handleChange}
            className="col-span-5 main__input input__text md:col-span-5"
          />
          
          {/* Property Dropdown */}
          <div className="h-auto w-auto relative col-span-5">
            <button
              type="button"
              className={`main__input flex__center__y pr-3 w-full group justify-between ${
                validationErrors.property ? "ring-2 ring-red-500" : ""
              }`}
              onClick={togglePropertyDropdown}
            >
              {selectedProperty ? selectedProperty.name : "Select Unit"}
              <AiOutlineDown className="click__action text-base rounded-xs group-focus:text-emerald-700 group-focus:scale-110" />
            </button>
            {showPropertyDropdown && (
              <div className="column__align rounded-sm items-center gap-0.5 text-sm font-light tracking-wide absolute top-12 bg-zinc-100 overflow-hidden ring-1 ring-white w-full max-h-60 overflow-y-auto z-10">
                {properties.map((property) => (
                  <button
                    key={property.propertyId}
                    className="w-full py-2 px-3 outline-none flex items-center text-left hover:bg-customViolet/70 hover:text-white focus:bg-customViolet/70 focus:text-white"
                    onClick={() => selectProperty(property)}
                  >
                    <span className="flex flex-col flex-1 min-w-0">
                      <p className="font-medium truncate">{property.name}</p>
                      <p className="text-xs text-gray-600 truncate">{property.address}</p>
                    </span>
                    <span className="ml-2 px-2 py-1 rounded-full bg-customViolet text-white text-xs whitespace-nowrap">
                      {property.currentTenants}
                    </span>
                  </button>
                ))}
                {properties.length === 0 && (
                  <div className="w-full py-2 px-3 text-center text-gray-500">
                    No properties available
                  </div>
                )}
              </div>
            )}
            {validationErrors.property && (
              <p className="text-red-500 text-sm mt-1">Property selection is required</p>
            )}
          </div>

          <input
            name="email"
            type="email"
            placeholder="@email.com"
            value={formData.email}
            onChange={handleChange}
            className="col-span-7 main__input input__text text__overflow md:col-span-full"
            required
          />
          <div className="col-span-6 main__input text__overflow flex gap-3">
            <span className="font-medium">+63</span>
            <input
              name="firstNumber"
              type="tel"
              value={formData.firstNumber}
              onChange={handleChange}
              className="input__text text__overflow w-full"
              placeholder="9xx xxx xxxx"
              pattern="[0-9]{10}"
            />
          </div>
          <div className="col-span-6 main__input text__overflow flex gap-3">
            <span className="font-medium">+63</span>
            <input
              name="secondNumber"
              type="tel"
              value={formData.secondNumber}
              onChange={handleChange}
              className="input__text text__overflow w-full"
              placeholder="9xx xxx xxxx"
              pattern="[0-9]{10}"
            />
          </div>
        </div>

        {/* Credential Uploads - Required */}
        <h2 className="h2__style mr-auto">Credentials *</h2>
        {validationErrors.credentials && (
          <p className="text-red-500 text-sm -mt-3">At least one credential image is required</p>
        )}
        <div className="primary__btn__holder md:gap-5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`col-span-6 rounded-sm bg-zinc-100 h-40 flex flex-col relative md:col-span-4 md:h-52 shadow-sm ${
                validationErrors.credentials && !idImages[0] && !idImages[1] ? "ring-2 ring-red-500" : ""
              }`}
            >
              <label className="flex__center__all click__action h-full w-full text-xs flex-col text-customViolet/70 bg-slate-50 outline-none focus:text-customViolet group md:text-base cursor-pointer">
                {idImages[i] ? (
                  <img
                    src={selectedImages[i]!}
                    alt={`Uploaded Image ${i + 1}`}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <>
                    <AiOutlineUpload className="click__action text-5xl group-focus:text-6xl md:text-6xl" />
                    Upload Image *
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleIDUpload(i, e)}
                  className="hidden"
                />
              </label>
            </div>
          ))}
        </div>

        {/* Terms and Conditions Section */}
        <div className="column__align gap-2 mt-3">
          <div className="column__align py-2 text-xs tracking-wide font-light gap-2 md:text-sm">
            <h6 className="text-sm font-medium md:text-base">
              Please Read the Business Rules and Regulations.
            </h6>

            <div className="bg-slate-50 px-3 py-2 leading-relaxed text-justify max-h-60 overflow-y-auto">
              I permit the use of my personal information for the optimization and utilization
              of the application (<strong>Co-Living</strong>). I also understand and will obey
              the stated rules and regulations below:
              <br />
              <strong>1.)</strong> I will never smoke cigarette in public
              comfort room, balcony, and hallway.
              <br />
              <strong>2.)</strong> I will pay the rent upon due notice and
              in any case I delayed the payment, it will be no longer than 1 month.
              <br />
              <strong>3.)</strong> I will adhere to stated announcements
              posted by the landlord in the app.
              <br />
              <strong>4.)</strong> I will not let any visitations within
              curfew hours.
              <br />
              <strong>5.)</strong> I will not make any loud noises within
              curfew hours.
              <br />
              <strong>6.)</strong> I will be responsible for the damages in
              the unit upon my whole stay.
              <br />
              <strong>7.)</strong> I will discuss any concerns to the
              landlord.
              <br />
              <strong>8.)</strong> I will be up-to-date with the latest
              announcements made by the landlord.
              <br />
              <strong>9.)</strong> I will not conduct any illegal activities
              nor operations in the unit.
              <br />
              <strong>10.)</strong> I will observe and maintain good conduct
              in the building and community.
              <br />
              Doing any of the stated rules above will cause me to face proper penalties and
              charges.
            </div>
          </div>

          {/* Agreement checkbox */}
          <div className="flex__center__y gap-2 text-sm md:text-base">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-5 w-5 md:h-6 md:w-6 accent-customViolet"
            />
            <label htmlFor="agree">I agree to the terms and conditions.</label>
          </div>
        </div>

        {/* Submit */}
        <div className="w-full flex justify-end gap-2 mt-5 md:flex md:items-center md:justify-center md:mt-10">
          <button
            disabled={loading}
            onClick={() => setPage(5)}
            className="click__action hover__action focus__action flex__center__y border border-zinc-400 rounded-sm gap-3 text-zinc-400 justify-between px-5 py-3 md:gap-5 disabled:opacity-50"
          >
            <HiOutlineArrowNarrowLeft className="text-2xl" /> Cancel
          </button>
          <button
            disabled={loading || !agreed}
            onClick={handleSubmit}
            className={`primary__btn click__action hover__action focus__action flex__center__y justify-between px-5 py-3 md:gap-5 ${
              !agreed ? "opacity-50 cursor-not-allowed" : ""
            } disabled:opacity-50`}
          >
            {loading ? "Creating..." : "Create Account"}
            <HiOutlineArrowNarrowRight className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTenant;