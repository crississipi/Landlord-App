"use client";

import React, { useEffect, useState } from "react";
import { MdManageHistory, MdClose } from "react-icons/md";
import { HiOutlineCalendar, HiOutlineCurrencyDollar } from "react-icons/hi2";

interface MaintenanceHistoryItem {
  maintenanceId: number;
  requestDescription: string;
  tenantName: string;
  propertyName: string;
  dateRequested: string;
  dateFixed: string;
  remarks: string;
  aiDescription: string | null;
  aiDescriptionTl: string | null;
  totalMaterialCost: number;
  inChargePayment: number;
  inChargeName: string | null;
  materials: Array<{ id: number; material: string; cost: number }>;
  images: Array<{ id: number; url: string; fileName: string }>;
  totalCost: number;
}

interface MaintenanceHistoryProps {
  propertyId: number;
  propertyName: string;
}

const MaintenanceHistory = ({ propertyId, propertyName }: MaintenanceHistoryProps) => {
  const [history, setHistory] = useState<MaintenanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<MaintenanceHistoryItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [propertyId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/maintenance/history?propertyId=${propertyId}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch history");
      }

      setHistory(data.history || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 h-80 overflow-hidden">
        <div className="animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-xl gap-3 mb-5">
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-16 w-16 rounded-xl bg-neutral-200"></div>
                ))}
              </div>
              <div className="px-3 py-2 rounded-xl bg-neutral-200 h-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-neutral-500 text-sm p-3 bg-neutral-50 rounded-lg text-center">
        No maintenance history available for this property yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5 h-96 overflow-y-auto overflow-x-hidden pr-2">
        {history.map((item) => (
          <div
            key={item.maintenanceId}
            className="flex flex-col rounded-xl gap-3 cursor-pointer hover:bg-neutral-50 transition-colors p-2"
            onClick={() => setSelectedItem(item)}
          >
            {/* Images */}
            <div className="flex gap-2 items-center">
              {item.images.slice(0, 3).map((img, i) => (
                <div
                  key={i}
                  className="h-16 w-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0"
                >
                  <img
                    src={img.url}
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {item.images.length > 3 && (
                <span className="text-xs text-neutral-500">
                  +{item.images.length - 3} more
                </span>
              )}
            </div>

            {/* Info Card */}
            <div className="px-3 py-2 rounded-xl bg-slate-100 shadow-md">
              <div className="w-full flex justify-between items-start mb-1">
                <h3 className="font-medium overflow-ellipsis line-clamp-1 flex-1">
                  {item.requestDescription}
                </h3>
                <p className="font-light text-nowrap text-xs ml-2">
                  {formatDate(item.dateFixed)}
                </p>
              </div>
              <p className="text-sm text-neutral-600 line-clamp-2">
                {item.aiDescription || item.remarks}
              </p>
              {item.totalCost > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  ₱{item.totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for detailed view */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdManageHistory className="text-2xl text-customViolet" />
                <h2 className="text-xl font-semibold text-customViolet">
                  Maintenance Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-2xl text-neutral-500 hover:text-neutral-700"
              >
                <MdClose />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Request Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {selectedItem.requestDescription}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <HiOutlineCalendar className="text-lg" />
                    <span>Fixed: {formatDate(selectedItem.dateFixed)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <HiOutlineCurrencyDollar className="text-lg" />
                    <span>
                      Total: ₱{selectedItem.totalCost.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Images */}
              {selectedItem.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Documentation Photos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedItem.images.map((img) => (
                      <div
                        key={img.id}
                        className="aspect-square rounded-lg overflow-hidden bg-neutral-100"
                      >
                        <img
                          src={img.url}
                          alt={img.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Description */}
              {selectedItem.aiDescription && (
                <div>
                  <h4 className="font-medium mb-2">AI-Generated Description</h4>
                  <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                    <p className="text-sm">{selectedItem.aiDescription}</p>
                    {selectedItem.aiDescriptionTl && (
                      <p className="text-sm text-neutral-600 italic border-t border-blue-200 pt-2">
                        {selectedItem.aiDescriptionTl}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Remarks */}
              <div>
                <h4 className="font-medium mb-2">Remarks</h4>
                <p className="text-sm bg-neutral-50 rounded-lg p-3">
                  {selectedItem.remarks}
                </p>
              </div>

              {/* Materials */}
              {selectedItem.materials.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Materials Used</h4>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Material</th>
                          <th className="text-right py-2">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.materials.map((material) => (
                          <tr key={material.id} className="border-b last:border-0">
                            <td className="py-2">{material.material}</td>
                            <td className="text-right py-2">
                              ₱{material.cost.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-semibold">
                          <td className="py-2">Subtotal (Materials)</td>
                          <td className="text-right py-2">
                            ₱{selectedItem.totalMaterialCost.toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* In-Charge Info */}
              {selectedItem.inChargeName && (
                <div>
                  <h4 className="font-medium mb-2">Maintenance In-Charge</h4>
                  <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-1">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedItem.inChargeName}
                    </p>
                    {selectedItem.inChargePayment && (
                      <p>
                        <span className="font-medium">Labor Cost:</span> ₱
                        {selectedItem.inChargePayment.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenanceHistory;
