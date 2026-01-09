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
      className="flex items-center gap-3 md:gap-4 w-full text-xs md:text-sm lg:text-base outline-none py-3 px-3 md:px-4 rounded-xl hover:bg-zinc-50 focus:bg-zinc-50 focus:ring-2 focus:ring-customViolet/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group border border-transparent hover:border-zinc-200"
      onClick={handleClick}
      disabled={loading}
    >
      <div className="flex-shrink-0 h-10 w-10 md:h-10 md:w-10 rounded-full bg-zinc-200 overflow-hidden border-2 border-white shadow-sm group-hover:border-customViolet/20 transition-colors">
        <Image
          alt="Profile Picture"
          src={profile}
          height={40}
          width={40}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <span className="flex-1 text-left font-medium text-zinc-700 group-hover:text-zinc-900 truncate">
        {name}
        {loading && <span className="text-zinc-400 font-normal text-xs ml-2">(Loading...)</span>}
      </span>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-customViolet group-hover:text-white transition-all">
        <AiOutlineRight className="text-base" />
      </div>
    </button>
  );
};

export default Tenant;