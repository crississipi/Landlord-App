import React from "react";
import Tenant from "./Tenant";
import { ChangePageProps } from "@/types";

interface TenantInf {
  userID: number;
  firstName: string;
  lastName: string;
  resources?: { url: string }[];
}

interface TenantPerUnitProps extends ChangePageProps {
  unit: string;
  tenants: TenantInf[];
  location?: string;
  onTenantSelect: (tenant: any) => void;
}

const TenantsPerUnit: React.FC<TenantPerUnitProps> = ({
  setPage,
  unit,
  tenants = [],
  location,
  onTenantSelect
}) => {
  return (
    <div className="col-span-full flex flex-col text-customViolet gap-2 md:gap-3 lg:gap-4 text-sm md:text-base lg:text-lg pb-2 md:pb-3">
      <div className="w-full flex__center__y justify-between border-b border-zinc-200 pb-2 md:pb-3">
        <span className="font-semibold pl-3 md:pl-4 md:text-lg lg:text-xl">UNIT {unit}</span>
        <span className="pr-3 md:pr-4">{location || "N/A"}</span>
      </div>

      <div className="column__align gap-x-2 md:gap-x-3">
        {tenants.length > 0 ? (
          tenants.map((tenant) => (
            <Tenant
              key={tenant.userID}
              userID={tenant.userID}
              setPage={setPage}
              onTenantSelect={onTenantSelect}
              name={`${tenant.firstName} ${tenant.lastName}`}
              profile={tenant.resources?.[0]?.url || "/default-avatar.png"}
            />
          ))
        ) : (
          <p className="text-gray-400 italic px-3 md:px-4">No tenants found.</p>
        )}
      </div>
    </div>
  );
};

export default TenantsPerUnit;