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
    <div className="column__align h-full text-customViolet gap-3 md:gap-5 px-5 md:px-8 lg:px-12 py-3 md:py-5 bg-white rounded-t-2xl overflow-hidden">
      <div className="h-max w-full flex__center__y justify-between">
        <TitleButton setPage={setPage} title="Tenants" />
        <button
          className="flex__center__all focus__action hover__action click__action py-2 md:py-3 px-3 md:px-4 lg:px-5 text-white rounded-sm outline-none bg-customViolet gap-2 text-sm md:text-base lg:text-lg transition-all"
          onClick={() => changePage(8)}
        >
          <AiOutlinePlus className="text-base md:text-xl lg:text-2xl" />
          Add New
        </button>
      </div>

      <div className="h-full w-full flex flex-col gap-5 md:gap-6 overflow-x-hidden max-w-7xl mx-auto">
        <TenantList
          setPage={setPage}
          onTenantSelect={onTenantSelect}
        />
      </div>
    </div>
  );
};

export default TenantListPage;