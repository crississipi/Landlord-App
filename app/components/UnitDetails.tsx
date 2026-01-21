"use client";

import React, { useState } from "react";
import { HiMiniArrowDownRight, HiMiniArrowUpRight } from "react-icons/hi2";
import { IoMdPricetag } from "react-icons/io";
import {
  MdFeedback,
  MdLocationOn,
  MdManageHistory,
  MdOutlineStar,
  MdOutlineStarHalf,
} from "react-icons/md";
import { RiUser5Fill } from "react-icons/ri";
import { RxDimensions } from "react-icons/rx";
import { ImageSlider, MaintenanceHistory } from ".";

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

interface UnitDetailsProps {
  property: PropertyWithResources;
  layout: boolean;
}

const UnitDetails = ({ property, layout }: UnitDetailsProps) => {
  const [details, showDetails] = useState(false);

  return (
    <div className="col-span-1 h-auto flex flex-col bg-white rounded-xl p-3 ease-out duration-200">
      {/* 🖼️ Property Image Slider */}
      <div
        className={`rounded-xl overflow-hidden ${
          layout ? "h-44" : "h-64"
        } w-full flex items-end justify-center`}
      >
        <ImageSlider images={property.resources} />
      </div>

      <div className="px-2 pt-3 gap-3 flex flex-col">
        {/* Header */}
        <div
          className={`w-full bg-white flex ${
            layout ? "flex-col items-start" : "flex-row items-center gap-5"
          } rounded-xl justify-between`}
        >
          <span className={`font-medium ${!layout && "text-xl"}`}>
            {property.name}
          </span>
          <div className="flex gap-1 items-center text-xl text-rose-500">
            <MdOutlineStar />
            <MdOutlineStar />
            <MdOutlineStar />
            <MdOutlineStar />
            <MdOutlineStarHalf />
          </div>
        </div>

        {/* Property Info */}
        {!layout && (
          <>
            <span className="flex gap-1 font-medium text-sm items-center">
              <MdLocationOn className="text-2xl text-rose-500" />
              {property.address}
            </span>
            <p>{property.description}</p>
          </>
        )}

        {/* Property Details */}
        <div
          className={`w-full ${
            layout ? "grid grid-cols-2" : "pt-2 flex"
          } items-center gap-5`}
        >
          <span className="flex gap-1 font-medium text-sm items-center">
            <RxDimensions className="text-blue-400 text-2xl" /> {property.area} sqm
          </span>
          <span className="flex gap-1 font-medium text-sm items-center">
            <IoMdPricetag className="text-2xl text-emerald-400" />
            ₱{property.rent.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button
            type="button"
            className={`${
              layout && "col-span-2 w-full py-2 justify-center"
            } ml-auto flex items-center gap-1 text-sm py-1.5 px-3 rounded-full border border-customViolet`}
            onClick={() => showDetails(!details)}
          >
            {!details ? (
              <>
                see more
                <HiMiniArrowUpRight />
              </>
            ) : (
              <>
                see less
                <HiMiniArrowDownRight />
              </>
            )}
          </button>
        </div>

        {/* Extra Info (Feedbacks + Maintenance) */}
        {details && (
          <div className="w-full flex flex-col gap-3">
            <span className="text-base flex gap-2 items-center">
              <MdFeedback className="text-2xl mt-1" />
              Feedbacks
            </span>

            <div className="flex flex-col gap-3 h-80 overflow-x-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-neutral-100 shadow-md px-3 py-2 flex flex-col gap-3"
                >
                  <span className="flex gap-2 items-center">
                    <RiUser5Fill className="text-2xl" />
                    <h3>Juan Dela Cruz</h3>
                    <div className="flex gap-1 ml-auto text-rose-500">
                      <MdOutlineStar />
                      <MdOutlineStar />
                      <MdOutlineStar />
                      <MdOutlineStar />
                      <MdOutlineStarHalf />
                    </div>
                  </span>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              ))}
            </div>

            <span className="text-base flex gap-2 items-center">
              <MdManageHistory className="text-2xl" />
              Maintenance History
            </span>

            <MaintenanceHistory 
              propertyId={property.propertyId} 
              propertyName={property.name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitDetails;
