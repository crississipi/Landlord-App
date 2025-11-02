"use client";

import React, { useEffect, useState } from "react";
import UnitDetails from "./UnitDetails";
import { HiArrowSmallLeft } from "react-icons/hi2";
import { TbLayoutColumns } from "react-icons/tb";
import { ChangePageProps } from "@/types";

export type PropertyWithResources = {
  propertyId: number
  name: string
  rent: number
  area: number
  yearBuilt: number
  renovated: boolean
  address: string
  description: string
  createdAt: string
  resources: {
    id: number
    url: string
  }[]
}

const ViewAllUnits = ({ setPage }: ChangePageProps) => {
  const [layout, setLayout] = useState(false);
  const [properties, setProperties] = useState<PropertyWithResources[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/show-property", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading properties...
      </div>
    );

  return (
    <div className="h-full w-full flex flex-col gap-5">
      <div className="w-full flex items-center justify-between mt-10 px-5 text-white">
        <button type="button" className="text-4xl" onClick={() => setPage(99)}>
          <HiArrowSmallLeft />
        </button>
        <h1 className="font-poppins text-xl font-light w-full text-center">
          All Available Units
        </h1>
        <button
          type="button"
          className="text-3xl"
          onClick={() => setLayout(!layout)}
        >
          <TbLayoutColumns
            className={`${
              layout ? "rotate-0" : "rotate-90"
            } transition-all transform-3d ease-out duration-200`}
          />
        </button>
      </div>

      <div
        className={`h-auto w-full ${
          layout ? "grid grid-cols-2" : "flex flex-col"
        } gap-3 px-3 pb-5 transition-all transform-view ease-out duration-200`}
      >
        {properties.map((property) => (
          <UnitDetails
            key={property.propertyId}
            property={property}
            layout={layout}
          />
        ))}
      </div>
    </div>
  );
};

export default ViewAllUnits;
