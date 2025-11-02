"use client";
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { TitleButton } from "./customcomponents";
import { ChangePageProps } from "@/types";
import TenantList from "./TenantList";

interface TenantListPageProps extends ChangePageProps {
  onTenantSelect: (tenant: any) => void;
}

const TenantListPage = ({ setPage, onTenantSelect }: TenantListPageProps) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  };

  return (
    <div className="column__align h-full text-customViolet gap-3 px-5 py-3 bg-white rounded-t-2xl overflow-hidden">
      <div className="h-max w-full flex__center__y justify-between">
        <TitleButton setPage={setPage} title="Tenants" />
        <button
          className="flex__center__all focus__action hover__action click__action py-2 px-3 text-white rounded-sm outline-none bg-customViolet gap-2 text-sm md:text-base"
          onClick={() => changePage(8)}
        >
          <AiOutlinePlus className="text-base md:text-xl" />
          Add New
        </button>
      </div>

      <div className="h-full w-full flex flex-col gap-5 overflow-x-hidden">
        <TenantList
          setPage={setPage}
          onTenantSelect={onTenantSelect}
        />
      </div>
    </div>
  );
};

export default TenantListPage;