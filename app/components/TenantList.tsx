"use client";
import React, { useEffect, useState } from "react";
import { TenantsPerUnit } from "./customcomponents";
import { ChangePageProps } from "@/types";

interface Tenant {
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

interface TenantListProps extends ChangePageProps {
  onTenantSelect: (tenant: any) => void;
}

const TenantList: React.FC<TenantListProps> = ({ setPage, onTenantSelect }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenants() {
      try {
        setLoading(true);
        const res = await fetch("/api/get-tenants");
        if (!res.ok) throw new Error("Failed to fetch tenants");
        const data = await res.json();
        setTenants(data.tenants);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTenants();
  }, []);

  // Group tenants by unit number
  const tenantsByUnit = tenants.reduce((groups, tenant) => {
    const unit = tenant.unitNumber || "Unknown Unit";
    if (!groups[unit]) groups[unit] = [];
    groups[unit].push(tenant);
    return groups;
  }, {} as Record<string, Tenant[]>);

  if (loading) {
    return (
      <div className="flex__center__all h-32">
        <span className="text-gray-500">Loading tenants...</span>
      </div>
    );
  }

  return (
    <div className="primary__btn__holder">
      {Object.entries(tenantsByUnit).map(([unit, group]) => (
        <TenantsPerUnit
          key={unit}
          setPage={setPage}
          unit={unit}
          tenants={group}
          onTenantSelect={onTenantSelect}
        />
      ))}
    </div>
  );
};

export default TenantList;