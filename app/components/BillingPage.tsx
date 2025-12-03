// components/BillingPage.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { TbCurrencyPeso, TbCalculator, TbReceipt, TbSend, TbX, TbCheck, TbAlertCircle } from 'react-icons/tb';
import { AiOutlineCaretDown } from 'react-icons/ai';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { MdCalendarToday, MdOutlineElectricBolt, MdWaterDrop, MdHome, MdPerson, MdAttachMoney } from 'react-icons/md';
import { BillingCreatePayload, UnbilledUnit, BillingRecord } from '@/types';

// Image Upload Component
function ImageUpload({ 
  label, 
  icon, 
  value, 
  onChange,
  preview 
}: { 
  label: string; 
  icon: React.ReactNode; 
  value: File | null;
  onChange: (file: File | null) => void;
  preview: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      <div className="relative">
        {preview ? (
          <div className="relative rounded-lg overflow-hidden border border-zinc-200">
            <img src={preview} alt={label} className="w-full h-32 object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <TbX className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
              {value?.name}
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-2">
              {icon}
            </div>
            <span className="text-sm text-zinc-600">Click to upload</span>
            <span className="text-xs text-zinc-400 mt-1">JPG, PNG up to 5MB</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

// Enhanced ReceiptRow with icons and better styling
function ReceiptRow({ utility, amount, icon }: { utility: string; amount: number; icon?: React.ReactNode }) {
  const isTotal = utility === 'Total';
  
  return (
    <div className={`flex items-center justify-between py-2 ${isTotal ? 'border-t border-zinc-200 pt-3 font-semibold' : ''}`}>
      <div className="flex items-center gap-2 text-zinc-700">
        {icon && <span className="text-zinc-400">{icon}</span>}
        {utility}
      </div>
      <div className={`font-mono ${isTotal ? 'text-lg text-indigo-600' : ''}`}>
        <TbCurrencyPeso className="inline mr-1 text-xs" />
        {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}

// Billing Card Component for Recent Billings
function BillingCard({
  billing,
  onSendReminder,
}: {
  billing: BillingRecord;
  onSendReminder: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = billing.totalAmount;

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <MdHome className="text-white text-xl" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Unit {billing.unit}</h4>
              <p className="text-sm text-zinc-500">{billing.tenant.name}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-zinc-900">
              ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-zinc-500">
              {new Date(billing.dateIssued).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-1">
              <MdOutlineElectricBolt />
              Electric
            </div>
            <div className="font-semibold text-zinc-900">₱{billing.totalElectric.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 p-3 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs text-cyan-600 mb-1">
              <MdWaterDrop />
              Water
            </div>
            <div className="font-semibold text-zinc-900">₱{billing.totalWater.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 p-3 rounded-lg">
            <div className="text-xs text-violet-600 mb-1">Rent</div>
            <div className="font-semibold text-zinc-900">₱{billing.totalRent.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              <TbAlertCircle className="w-3 h-3" /> Pending
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-1"
            >
              {expanded ? 'Hide' : 'Details'} 
              <AiOutlineCaretDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={onSendReminder}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
            >
              <TbSend className="w-4 h-4" /> Send
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-zinc-200 space-y-2">
            <ReceiptRow utility="Electric Bill" amount={billing.totalElectric} icon={<MdOutlineElectricBolt className="text-blue-500" />} />
            <ReceiptRow utility="Water Bill" amount={billing.totalWater} icon={<MdWaterDrop className="text-cyan-500" />} />
            <ReceiptRow utility="Monthly Rent" amount={billing.totalRent} icon={<MdHome className="text-violet-500" />} />
            <ReceiptRow utility="Total" amount={total} icon={<MdAttachMoney className="text-indigo-600" />} />
            
            {billing.tenant.email && (
              <div className="mt-3 pt-3 border-t border-zinc-100">
                <p className="text-xs text-zinc-500">
                  Email: <span className="text-zinc-700">{billing.tenant.email}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Quick Stats Component
function StatsCard({ title, value, subtitle, icon, color = 'indigo' }: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  icon: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber';
}) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-zinc-900">{value}</p>
          {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-sm`}>
          <span className="text-white">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 text-center max-w-sm">{description}</p>
    </div>
  );
}

export default function BillingPage({
  propertyId,
}: {
  propertyId: number;
}) {
  // Form state
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [rent, setRent] = useState<number>(0);
  const [water, setWater] = useState<number>(0);
  const [electric, setElectric] = useState<number>(0);
  const [tenantNames, setTenantNames] = useState<string>('');
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  
  // Image uploads
  const [waterMeterImage, setWaterMeterImage] = useState<File | null>(null);
  const [electricMeterImage, setElectricMeterImage] = useState<File | null>(null);
  const [waterMeterPreview, setWaterMeterPreview] = useState<string | null>(null);
  const [electricMeterPreview, setElectricMeterPreview] = useState<string | null>(null);
  
  // Data state
  const [unbilledUnits, setUnbilledUnits] = useState<UnbilledUnit[]>([]);
  const [recentBillings, setRecentBillings] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle water meter image change
  const handleWaterMeterChange = useCallback((file: File | null) => {
    setWaterMeterImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setWaterMeterPreview(url);
    } else {
      setWaterMeterPreview(null);
    }
  }, []);

  // Handle electric meter image change
  const handleElectricMeterChange = useCallback((file: File | null) => {
    setElectricMeterImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setElectricMeterPreview(url);
    } else {
      setElectricMeterPreview(null);
    }
  }, []);

  // Fetch unbilled units for current month
  const fetchUnbilledUnits = useCallback(async () => {
    try {
      const res = await fetch(`/api/units/unbilled/${propertyId}?month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setUnbilledUnits(data.units || []);
      }
    } catch (error) {
      console.error('Error fetching unbilled units:', error);
    }
  }, [propertyId, month]);

  // Fetch recent billings for current month
  const fetchRecentBillings = useCallback(async () => {
    try {
      const res = await fetch(`/api/billings?propertyId=${propertyId}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setRecentBillings(data.billings || []);
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
    }
  }, [propertyId, month]);

  // Load data on mount and when month changes
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      await Promise.all([fetchUnbilledUnits(), fetchRecentBillings()]);
      setLoadingData(false);
    };
    if (propertyId) loadData();
  }, [propertyId, month, fetchUnbilledUnits, fetchRecentBillings]);

  // Handle unit selection
  const handleUnitSelect = (unitNumber: string) => {
    const unit = unbilledUnits.find(u => u.unitNumber === unitNumber);
    if (unit) {
      setSelectedUnit(unitNumber);
      setRent(unit.rent);
      // Set tenant names (comma separated)
      const names = unit.tenants.map(t => t.name).join(', ');
      setTenantNames(names);
      // Set first tenant as selected for billing
      if (unit.tenants.length > 0) {
        setSelectedTenantId(unit.tenants[0].userID);
      }
    }
  };

  // Create billing
  const createBilling = async () => {
    if (!selectedUnit) {
      setMessage({ type: 'error', text: 'Please select a unit.' });
      return;
    }
    if (!selectedTenantId) {
      setMessage({ type: 'error', text: 'No tenant found for this unit.' });
      return;
    }
    if (!water && !electric) {
      setMessage({ type: 'error', text: 'Please enter water and/or electric bill amounts.' });
      return;
    }
    if (!waterMeterImage || !electricMeterImage) {
      setMessage({ type: 'error', text: 'Please upload both water and electric meter reading images.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Convert images to base64
      const waterBase64 = await fileToBase64(waterMeterImage);
      const electricBase64 = await fileToBase64(electricMeterImage);

      const payload: BillingCreatePayload = {
        userID: selectedTenantId,
        propertyId,
        unit: selectedUnit,
        month,
        totalRent: rent,
        totalWater: water,
        totalElectric: electric,
        waterMeterImage: waterBase64,
        electricMeterImage: electricBase64,
        tenantNames,
      };

      const res = await fetch('/api/billings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMessage({ 
          type: 'success', 
          text: json.emailSent 
            ? 'Billing created and sent to tenant successfully!' 
            : 'Billing created successfully! (Email not sent - tenant may not have email)'
        });
        // Reset form
        setSelectedUnit('');
        setRent(0);
        setWater(0);
        setElectric(0);
        setTenantNames('');
        setSelectedTenantId(null);
        setWaterMeterImage(null);
        setElectricMeterImage(null);
        setWaterMeterPreview(null);
        setElectricMeterPreview(null);
        // Refresh data
        await Promise.all([fetchUnbilledUnits(), fetchRecentBillings()]);
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to create billing' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalBilled = recentBillings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalUnits = recentBillings.length;
  const pendingUnits = unbilledUnits.length;

  // Get month display name
  const monthDisplay = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Billing Management</h1>
            <p className="text-zinc-500 mt-1">Create and manage billing statements for tenants</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard 
            title="Total Billed" 
            value={`₱${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subtitle={monthDisplay}
            icon={<TbCurrencyPeso className="text-xl" />}
            color="indigo"
          />
          <StatsCard 
            title="Units Billed" 
            value={totalUnits.toString()}
            subtitle="This month"
            icon={<TbCheck className="text-xl" />}
            color="emerald"
          />
          <StatsCard 
            title="Pending Units" 
            value={pendingUnits.toString()}
            subtitle="Awaiting billing"
            icon={<TbAlertCircle className="text-xl" />}
            color="amber"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Create Billing Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Billing Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 p-5 bg-gradient-to-r from-indigo-50 to-violet-50">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <TbCalculator className="text-indigo-600" /> Create New Billing
              </h3>
              <p className="text-sm text-zinc-500 mt-1">Generate billing statement for {monthDisplay}</p>
            </div>
            
            <div className="p-5">
              {/* Unit Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  Select Unit <span className="text-red-500">*</span>
                </label>
                {unbilledUnits.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {unbilledUnits.map((unit) => (
                      <button
                        key={unit.unitNumber}
                        onClick={() => handleUnitSelect(unit.unitNumber)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedUnit === unit.unitNumber
                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                            : 'border-zinc-200 hover:border-indigo-300 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MdHome className={`text-lg ${selectedUnit === unit.unitNumber ? 'text-indigo-600' : 'text-zinc-400'}`} />
                          <span className="font-semibold text-zinc-900">Unit {unit.unitNumber}</span>
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {unit.tenants.map(t => t.name).join(', ') || 'No tenant'}
                        </div>
                        <div className="text-sm font-medium text-indigo-600 mt-1">
                          ₱{unit.rent.toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-emerald-50 rounded-xl border border-emerald-200">
                    <TbCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-emerald-700 font-medium">All units have been billed for {monthDisplay}!</p>
                    <p className="text-sm text-emerald-600 mt-1">Select a different month to create new billings.</p>
                  </div>
                )}
              </div>

              {selectedUnit && (
                <>
                  {/* Tenant Info (Read-only) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Tenant(s)</label>
                      <div className="relative">
                        <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={tenantNames}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Monthly Rent</label>
                      <div className="relative">
                        <TbCurrencyPeso className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={`₱${rent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Utility Bills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Water Bill <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MdWaterDrop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500" />
                        <input
                          type="number"
                          value={water || ''}
                          onChange={(e) => setWater(Number(e.target.value))}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Electric Bill <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MdOutlineElectricBolt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                        <input
                          type="number"
                          value={electric || ''}
                          onChange={(e) => setElectric(Number(e.target.value))}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meter Reading Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <ImageUpload
                      label="Water Meter Reading *"
                      icon={<MdWaterDrop className="text-2xl text-cyan-500" />}
                      value={waterMeterImage}
                      onChange={handleWaterMeterChange}
                      preview={waterMeterPreview}
                    />
                    <ImageUpload
                      label="Electric Meter Reading *"
                      icon={<MdOutlineElectricBolt className="text-2xl text-blue-500" />}
                      value={electricMeterImage}
                      onChange={handleElectricMeterChange}
                      preview={electricMeterPreview}
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-5 rounded-xl mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-zinc-600">Billing Summary</span>
                      <span className="text-xs text-zinc-500">Unit {selectedUnit}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-600">Monthly Rent</span>
                        <span className="font-medium">₱{rent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600">Water Bill</span>
                        <span className="font-medium">₱{water.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600">Electric Bill</span>
                        <span className="font-medium">₱{electric.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-indigo-200">
                        <span className="font-semibold text-zinc-900">Total Amount</span>
                        <span className="font-bold text-xl text-indigo-600">
                          ₱{(rent + water + electric).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setSelectedUnit('');
                        setRent(0);
                        setWater(0);
                        setElectric(0);
                        setTenantNames('');
                        setSelectedTenantId(null);
                        setWaterMeterImage(null);
                        setElectricMeterImage(null);
                        setWaterMeterPreview(null);
                        setElectricMeterPreview(null);
                        setMessage(null);
                      }}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50 font-medium"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={createBilling}
                      disabled={loading || !selectedUnit}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating & Sending...
                        </>
                      ) : (
                        <>
                          <TbReceipt className="text-lg" /> Create & Send Billing
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Message */}
              {message && (
                <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <TbCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <TbAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Billings */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Recent Billings</h3>
                  <p className="text-sm text-zinc-500">{monthDisplay}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900' : 'bg-white text-zinc-500 hover:bg-zinc-50'}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-zinc-100 text-zinc-900' : 'bg-white text-zinc-500 hover:bg-zinc-50'}`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentBillings.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {recentBillings.map((billing) => (
                      <BillingCard
                        key={billing.billingID}
                        billing={billing}
                        onSendReminder={() => setMessage({ type: 'success', text: `Reminder sent to ${billing.tenant.name}` })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentBillings.map((billing) => (
                      <div key={billing.billingID} className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <MdHome className="text-white text-xl" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900">Unit {billing.unit}</div>
                            <div className="text-sm text-zinc-500">{billing.tenant.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-zinc-900">₱{billing.totalAmount.toLocaleString()}</div>
                          <div className="text-xs text-zinc-500">
                            {new Date(billing.dateIssued).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <button 
                          onClick={() => setMessage({ type: 'success', text: `Reminder sent to ${billing.tenant.name}` })}
                          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                        >
                          <TbSend /> Send
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <EmptyState
                  icon={<TbReceipt className="w-8 h-8 text-zinc-400" />}
                  title="No billings yet"
                  description="There are no billing records for this month. Create one by selecting a unit above."
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Payment & Info */}
        <div className="space-y-6">
          {/* Quick Payment */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Quick Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Select Billing</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  defaultValue=""
                >
                  <option value="" disabled>Choose a billing...</option>
                  {recentBillings.map((b) => (
                    <option key={b.billingID} value={b.billingID}>
                      Unit {b.unit} - ₱{b.totalAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Payment Amount</label>
                <div className="relative">
                  <TbCurrencyPeso className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Payment Method</label>
                <select className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                  <option>Cash</option>
                </select>
              </div>

              <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 font-medium shadow-sm">
                Confirm Payment <HiOutlineArrowNarrowRight />
              </button>
            </div>
          </div>

          {/* Pending Units */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <TbAlertCircle className="text-amber-600" /> Pending Units
            </h4>
            {unbilledUnits.length > 0 ? (
              <div className="space-y-3">
                {unbilledUnits.slice(0, 4).map((unit) => (
                  <div key={unit.unitNumber} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-zinc-900">Unit {unit.unitNumber}</div>
                        <div className="text-xs text-zinc-500 truncate max-w-[120px]">
                          {unit.tenants.map(t => t.name).join(', ') || 'No tenant'}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUnitSelect(unit.unitNumber)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Create Bill
                      </button>
                    </div>
                  </div>
                ))}
                {unbilledUnits.length > 4 && (
                  <p className="text-xs text-amber-700 text-center">
                    +{unbilledUnits.length - 4} more units
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <TbCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-emerald-700 font-medium">All tenants have been billed!</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-5 border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              💡 Billing Tips
            </h4>
            <ul className="text-sm text-indigo-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>Always attach clear meter reading photos for transparency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>Send billing statements 5-7 days before due date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>PDF receipts are automatically emailed to tenants</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>Keep digital copies of all billing records</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
