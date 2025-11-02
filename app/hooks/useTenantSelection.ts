"use client";
import { useState } from 'react';

export interface Tenant {
  userID: number;
  firstName: string;
  lastName: string;
  email: string;
  unitNumber?: string;
  property?: {
    propertyId: number;
    name: string;
    address: string;
  };
  resources?: { url: string }[];
}

export const useTenantSelection = () => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const selectTenant = async (userID: number) => {
    try {
      const res = await fetch(`/api/tenant/${userID}`);
      if (!res.ok) throw new Error("Failed to fetch tenant info");
      const data = await res.json();
      setSelectedTenant(data.tenant);
      return data.tenant;
    } catch (error) {
      console.error("Error fetching tenant details:", error);
      return null;
    }
  };

  return {
    selectedTenant,
    selectTenant,
    clearSelectedTenant: () => setSelectedTenant(null)
  };
};