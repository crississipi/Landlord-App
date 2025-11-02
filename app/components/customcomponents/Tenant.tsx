"use client";
import { ChangePageProps, TenantProps } from "@/types";
import React, { useState } from "react";
import Image from "next/image";
import { AiOutlineRight } from "react-icons/ai";

interface TenantComponentProps extends TenantProps, ChangePageProps {
  userID: number;
  onTenantSelect: (tenant: any) => void;
}

const Tenant: React.FC<TenantComponentProps> = ({ 
  setPage, 
  name, 
  profile, 
  userID, 
  onTenantSelect 
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      console.log("Fetching tenant data for userID:", userID); // Debug log
      
      const res = await fetch(`/api/tenant/${userID}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch tenant info");
      }

      const data = await res.json();
      console.log("Tenant details received:", data.tenant); // Debug log

      if (!data.tenant) {
        throw new Error("No tenant data received");
      }

      // Store tenant data and navigate to tenant details
      onTenantSelect(data.tenant);
      setPage(7);
    } catch (error) {
      console.error("Error fetching tenant details:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to load tenant details'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="flex__center__y gap-3 w-full text-sm outline-none py-2 px-3 focus:bg-white md:px-5 md:py-2 group hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleClick}
      disabled={loading}
    >
      <div className="flex__center__all h-9 w-9 rounded-full bg-sky-500 overflow-hidden text-white">
        <Image
          alt="Profile Picture"
          src={profile}
          height={36}
          width={36}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <span className="text__overflow w-full text-left">
        {name}
        {loading && " (Loading...)"}
      </span>
      <AiOutlineRight className="text-2xl p-1 rounded-full text-emerald-700 group-hover:bg-customViolet group-hover:text-white transition-colors" />
    </button>
  );
};

export default Tenant;