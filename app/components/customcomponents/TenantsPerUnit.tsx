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
    <div className="col-span-full lg:col-span-6 xl:col-span-4 flex flex-col text-customViolet gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm lg:text-sm pb-2 md:pb-3 bg-white rounded-[1.5rem] border border-zinc-200 shadow-sm p-4 md:p-5 hover:border-customViolet/30 transition-colors">
      <div className="w-full flex__center__y justify-between border-b border-zinc-100 pb-3 md:pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-customViolet/10 flex items-center justify-center text-customViolet font-bold">
            {unit}
          </div>
          <span className="font-semibold md:text-base lg:text-base text-zinc-800">UNIT {unit}</span>
        </div>
        <span className="pr-2 text-zinc-500 text-xs">{location || "N/A"}</span>
      </div>

      <div className="column__align gap-y-1">
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
          <p className="text-zinc-400 italic px-3 md:px-4 py-2 text-center bg-zinc-50 rounded-xl">No tenants found.</p>
        )}
      </div>
    </div>
  );
};

export default TenantsPerUnit;