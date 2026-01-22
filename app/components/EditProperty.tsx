"use client";

import { handleUploadAndSubmit, PropertyFormData } from "@/lib/addProperty";
import { ChangePageProps } from "@/types";
import React, { useRef, useState, useEffect } from "react";
import { HiArrowSmallLeft, HiOutlinePlus, HiXMark } from "react-icons/hi2";

const EditProperty = ({ setPage }: ChangePageProps) => {
  const [renovated, setRenovated] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [, setUploadedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Controlled input states
  const [name, setName] = useState("");
  const [rent, setRent] = useState("");
  const [area, setArea] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  // Open file manager manually
  const handleOpenFileManager = () => {
    fileInputRef.current?.click();
  };

  // When new files are selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImages((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const urlToRemove = prev[index];
      URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    setName("");
    setRent("");
    setArea("");
    setYearBuilt("");
    setAddress("");
    setDescription("");
    // Revoke old URLs before clearing
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setPreviewUrls([]);
    setUploadedUrls([]);
    setRenovated(false);
  };

  const handleSubmit = () => {
    const data: PropertyFormData = {
      name,
      rent,
      area,
      yearBuilt,
      renovated,
      address,
      description,
    };

    handleUploadAndSubmit(data, images, setLoading, setUploadedUrls, resetForm);
  };

  return (
    <div className="max__size px-5 py-3 gap-5 text-customViolet flex flex-col items-start overflow-hidden bg-white rounded-t-2xl">
      <div className="w-full flex items-center justify-between mt-3 gap-3 text-customViolet">
        <button type="button" className="text-4xl" onClick={() => setPage(0)}>
          <HiArrowSmallLeft />
        </button>
        <h1 className="font-poppins text-xl font-light w-full text-left">
          Manage Properties
        </h1>
      </div>

      <div className="w-full h-full flex flex-col gap-5 overflow-x-hidden">
        {/* Image Upload Section */}
        <div className="w-full grid grid-cols-3 gap-2">
          <span className="col-span-full flex items-center justify-between">
            <h2 className="font-medium">Images</h2>
            <button
              type="button"
              className="px-3 pl-2 py-2 text-sm rounded-md border border-customViolet text-customViolet flex items-center justify-center hover:bg-customViolet/50 focus:bg-customViolet focus:text-white ease-out duration-200"
              onClick={handleOpenFileManager}
            >
              <HiOutlinePlus className="text-xl" /> Add
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </span>

          {previewUrls.map((src, i) => (
            <div
              key={i}
              className="relative w-full aspect-square rounded-md border border-customViolet/50 bg-neutral-50 overflow-hidden group"
            >
              <img src={src} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Remove image"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Property Form Section */}
        <div className="w-full grid grid-cols-5 gap-3">
          <h2 className="font-medium col-span-full">Unit Details</h2>

          <span className="col-span-3 flex flex-col">
            <label className="text-sm font-light">Unit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unit 304"
              className="p-3 rounded-md border border-customViolet/50 hover:border-customViolet/70 focus:border-customViolet ease-out duration-200"
            />
          </span>

          <span className="col-span-2 flex flex-col">
            <label className="text-sm font-light">Rent</label>
            <input
              type="text"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="3,500.00"
              className="p-3 rounded-md border border-customViolet/50 hover:border-customViolet/70 focus:border-customViolet ease-out duration-200"
            />
          </span>

          <span className="col-span-2 flex flex-col">
            <label className="text-sm font-light">Area</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="sqm"
              className="p-3 rounded-md border border-customViolet/50 hover:border-customViolet/70 focus:border-customViolet ease-out duration-200"
            />
          </span>

          <span className="col-span-1 flex flex-col">
            <label className="text-sm font-light">Year Built</label>
            <input
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
              placeholder="2020"
              className="p-3 rounded-md border border-customViolet/50 hover:border-customViolet/70 focus:border-customViolet ease-out duration-200"
            />
          </span>

          <span className="col-span-2 flex flex-col">
            <label className="text-sm font-light">Renovated</label>
            <span className="w-full grid grid-cols-2 gap-1">
              <button
                type="button"
                className={`col-span-1 p-3 rounded-md border ${
                  renovated
                    ? "border-customViolet/50"
                    : "bg-customViolet border-customViolet text-white"
                }`}
                onClick={() => setRenovated(false)}
              >
                No
              </button>
              <button
                type="button"
                className={`col-span-1 p-3 rounded-md border ${
                  !renovated
                    ? "border-customViolet/50"
                    : "bg-customViolet border-customViolet text-white"
                }`}
                onClick={() => setRenovated(true)}
              >
                Yes
              </button>
            </span>
          </span>

          <span className="col-span-full flex flex-col">
            <label className="text-sm font-light">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Pasay City"
              className="p-3 rounded-md border border-customViolet/50 hover:border-customViolet/70 focus:border-customViolet ease-out duration-200"
            />
          </span>

          <span className="col-span-full flex flex-col gap-1">
            <label className="text-sm font-light">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-48 p-3 rounded-md border border-customViolet/50 hover:border-customViolet/70 focus:border-customViolet ease-out duration-200"
            />
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="col-span-full mt-3 px-3 py-2 rounded-md bg-customViolet text-white hover:bg-customViolet/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default EditProperty;
