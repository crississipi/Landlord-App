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
  MdStar,
  MdStarBorder,
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
  const [feedbackType, setFeedbackType] = useState("Visitor");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Fetch feedbacks when details are shown
  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch(`/api/feedbacks?propertyId=${property.propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      alert("Please write a feedback message");
      return;
    }
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.propertyId,
          ratings: rating,
          message: feedbackMessage,
          userType: feedbackType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Feedback submitted successfully!");
        // Reset form
        setFeedbackMessage("");
        setFeedbackType("Visitor");
        setRating(0);
        setShowFeedbackInput(false);
        // Refresh feedbacks
        fetchFeedbacks();
      } else {
        alert(data.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="flex items-center justify-between">
              <span className="text-base flex gap-2 items-center">
                <MdFeedback className="text-2xl mt-1" />
                Feedbacks
              </span>
              <button
                type="button"
                className="text-sm text-customViolet underline font-medium hover:text-opacity-80 transition-colors"
                onClick={() => {
                  setShowFeedbackInput(!showFeedbackInput);
                  if (!showFeedbackInput && feedbacks.length === 0) {
                    fetchFeedbacks();
                  }
                }}
              >
                {showFeedbackInput ? "Cancel" : "Add Comment"}
              </button>
            </div>

            {/* Display existing feedbacks */}
            {!showFeedbackInput && (
              <>
                {loadingFeedbacks ? (
                  <div className="w-full py-8 flex items-center justify-center text-gray-400">
                    Loading feedbacks...
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="w-full py-8 flex flex-col items-center justify-center text-gray-400 bg-neutral-50 rounded-xl border border-dashed border-gray-200">
                    <MdFeedback className="text-4xl mb-2 opacity-50" />
                    <p className="text-sm font-medium">No feedback yet</p>
                    <p className="text-xs">Share your experience with this property!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.feedbackID} className="p-4 bg-neutral-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {feedback.user 
                              ? `${feedback.user.firstName} ${feedback.user.lastName}` 
                              : feedback.name}
                          </span>
                          <div className="flex gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-sm">
                                {feedback.ratings >= star ? <MdStar /> : <MdStarBorder />}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{feedback.message}</p>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {new Date(feedback.dateIssued).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {showFeedbackInput && (
              <div className="flex flex-col gap-3 p-4 bg-neutral-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                
                {/* Star Rating */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-medium">Rate this property</span>
                  <div className="flex gap-1 text-2xl text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition-transform focus:outline-none"
                      >
                        {rating >= star ? <MdStar /> : <MdStarBorder />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:border-customViolet bg-white"
                  >
                    <option value="Visitor">Visitor</option>
                    <option value="Renter">Renter</option>
                  </select>
                  <span className="text-xs text-gray-500">Select user type</span>
                </div>

                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Write your feedback here..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:border-customViolet resize-none"
                />

                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  className="self-end px-5 py-2 bg-customViolet text-white text-sm rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            )}

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
