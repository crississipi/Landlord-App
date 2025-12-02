// components/BillingPage.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TbCurrencyPeso, TbCalculator } from 'react-icons/tb';
import { AiOutlineCaretDown } from 'react-icons/ai';
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { MdCalendarToday, MdOutlineElectricBolt, MdWaterDrop } from 'react-icons/md';
import { UnitBillingRow, BillingCreatePayload } from '@/types'; // adjust point if different

// Helper small components as internal subcomponents
function ReceiptRow({ utility, amount, paid }: { utility: string; amount: number; paid: number }) {
  const balance = amount - paid;
  return (
    <div className="col-span-full grid grid-cols-12 text-customViolet/90 py-1">
      <div className="col-span-3">{utility}</div>
      <div className="col-span-3 text-right">
        <TbCurrencyPeso className="inline mr-1" />
        {amount.toLocaleString()}
      </div>
      <div className="col-span-3 text-right">
        <TbCurrencyPeso className="inline mr-1" />
        {paid.toLocaleString()}
      </div>
      <div className="col-span-3 text-right">
        <TbCurrencyPeso className="inline mr-1" />
        {balance < 0 ? '0' : balance.toLocaleString()}
      </div>
    </div>
  );
}

function BillingSlip({
  unit,
  datePaid,
  electric,
  water,
  rent,
  paidElectric,
  paidWater,
  paidRent,
}: {
  unit: string;
  datePaid?: string;
  electric: number;
  water: number;
  rent: number;
  paidElectric?: number;
  paidWater?: number;
  paidRent?: number;
}) {
  const total = electric + water + rent;
  const totalPaid = (paidElectric || 0) + (paidWater || 0) + (paidRent || 0);
  const balance = total - totalPaid;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="w-full">
      <button
        className="w-full grid grid-cols-10 items-center py-3 px-2 rounded-sm hover:bg-zinc-50 text-sm text-customViolet"
        onClick={() => setExpanded((s) => !s)}
      >
        <div className="col-span-1 text-left pl-2 font-medium"> {unit} </div>
        <div className="col-span-3 text-right text-emerald-700">{total.toLocaleString()}</div>
        <div className="col-span-3 text-right text-emerald-700">{balance <= 0 ? '0' : balance.toLocaleString()}</div>
        <div className="col-span-3 text-right pr-3">{datePaid ?? '—'}</div>
      </button>

      {expanded && (
        <div className="bg-zinc-50 px-3 py-2 border-t border-zinc-200">
          <div className="grid grid-cols-12 font-medium mb-1">
            <div className="col-span-3">Utility</div>
            <div className="col-span-3 text-right">Amount</div>
            <div className="col-span-3 text-right">Paid</div>
            <div className="col-span-3 text-right">Balance</div>
          </div>
          <ReceiptRow utility="Electrical" amount={electric} paid={paidElectric || 0} />
          <ReceiptRow utility="Water" amount={water} paid={paidWater || 0} />
          <ReceiptRow utility="Rent" amount={rent} paid={paidRent || 0} />
          <ReceiptRow utility="Total" amount={total} paid={totalPaid} />
        </div>
      )}
    </div>
  );
}

// MAIN PAGE component
export default function BillingPage({
  propertyId,
  units,
  initialTenantUserId,
}: {
  propertyId: number;
  units?: string[]; // unit list -> ["101", "102", ...]
  initialTenantUserId?: number;
}) {
  // local UI state
  const [selectedUnit, setSelectedUnit] = useState<string>(units?.[0] ?? '');
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [rent, setRent] = useState<number>(0);
  const [water, setWater] = useState<number>(0);
  const [electric, setElectric] = useState<number>(0);
  const [tenants, setTenants] = useState<{ userID: number; name: string }[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(initialTenantUserId ?? null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // dummy dataset for the list (in real app, fetch this from API)
  const billingRows = useMemo<UnitBillingRow[]>(
    () => [
      { unit: '101', prev: 1200, curr: 300 },
      { unit: '102', prev: 1700, curr: 0 },
      { unit: '201', prev: 600, curr: 200 },
      ...(units ?? []).map((u) => ({ unit: u, prev: 0, curr: 0 })),
    ],
    [units]
  );

  useEffect(() => {
    // fetch tenant list for property
    async function loadTenants() {
      try {
        const res = await fetch(`/api/tenants/${propertyId}`);
        if (res.ok) {
          const json = await res.json();
          const mapped = (json.tenants || []).map((t: any) => ({
            userID: t.userID,
            name: t.firstName ? `${t.firstName} ${t.lastName || ''}`.trim() : t.username,
          }));
          setTenants(mapped);
          if (!selectedTenant && mapped.length) setSelectedTenant(mapped[0].userID);
        } else {
          console.warn('failed to fetch tenants', res.status);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (propertyId) loadTenants();
  }, [propertyId, selectedTenant]);

  const createBilling = async () => {
    if (!selectedTenant) {
      setMessage('Please select a tenant.');
      return;
    }
    setLoading(true);
    setMessage(null);
    const payload: BillingCreatePayload = {
      userID: selectedTenant,
      propertyId,
      unit: selectedUnit,
      month,
      totalRent: rent,
      totalWater: water,
      totalElectric: electric,
    };

    try {
      const res = await fetch('/api/billings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessage('Billing created successfully');
        setRent(0);
        setWater(0);
        setElectric(0);
      } else {
        setMessage(json.message || 'Failed to create billing');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  const sendBilling = async (billingID: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/billings/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingID }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessage('Billing sent');
      } else setMessage(json.message || 'Failed to send');
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 text-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-customViolet">Billing</h2>
        <p className="text-xs text-zinc-500">Create, view and send billing slips for tenants</p>
      </div>

      {/* Create Billing Form */}
      <section className="mb-6 p-4 bg-white border rounded-md shadow-sm">
        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs text-zinc-600 mb-1">Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-sm border"
            >
              {(units ?? []).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs text-zinc-600 mb-1">Tenant</label>
            <select
              value={selectedTenant ?? undefined}
              onChange={(e) => setSelectedTenant(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-sm border"
            >
              {tenants.map((t) => (
                <option key={t.userID} value={t.userID}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-2">
            <label className="block text-xs text-zinc-600 mb-1">Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2 rounded-sm border" />
          </div>

          <div className="col-span-12 md:col-span-2">
            <label className="block text-xs text-zinc-600 mb-1">Rent</label>
            <input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value))} className="w-full px-3 py-2 rounded-sm border" />
          </div>

          <div className="col-span-12 md:col-span-2">
            <label className="block text-xs text-zinc-600 mb-1">Water</label>
            <input type="number" value={water} onChange={(e) => setWater(Number(e.target.value))} className="w-full px-3 py-2 rounded-sm border" />
          </div>

          <div className="col-span-12 md:col-span-2">
            <label className="block text-xs text-zinc-600 mb-1">Electric</label>
            <input type="number" value={electric} onChange={(e) => setElectric(Number(e.target.value))} className="w-full px-3 py-2 rounded-sm border" />
          </div>

          <div className="col-span-12 flex justify-end gap-2 mt-3">
            <button
              className="px-4 py-2 rounded-sm border text-zinc-600 hover:bg-zinc-50"
              onClick={() => {
                setRent(0);
                setWater(0);
                setElectric(0);
              }}
              disabled={loading}
            >
              Reset
            </button>
            <button className="px-4 py-2 rounded-sm text-white bg-customViolet hover:opacity-95" onClick={createBilling} disabled={loading}>
              {loading ? 'Working…' : 'Create Billing'}
            </button>
          </div>
        </div>
        {message && <div className="mt-3 text-sm text-zinc-700">{message}</div>}
      </section>

      {/* Billing list */}
      <section className="mb-6 bg-white p-4 border rounded-md shadow-sm">
        <div className="grid grid-cols-10 gap-2 items-center border-b border-zinc-200 pb-2">
          <div className="col-span-1 pl-3 font-semibold uppercase">Unit</div>
          <div className="col-span-3 text-right font-semibold">Amount</div>
          <div className="col-span-3 text-right font-semibold">Balance</div>
          <div className="col-span-3 text-right pr-3 font-semibold">Date Paid</div>
        </div>

        <div className="mt-2 space-y-1">
          {billingRows.map((r) => (
            <div key={r.unit} className="border rounded-sm overflow-hidden">
              <div className="grid grid-cols-12 items-center p-2">
                <div className="col-span-8">
                  <div className="font-medium text-customViolet">{r.unit}</div>
                </div>
                <div className="col-span-2 text-right text-emerald-700">{r.curr.toLocaleString()}</div>
                <div className="col-span-2 text-right">
                  <button
                    className="px-3 py-1 rounded-sm text-white bg-customViolet hover:opacity-95"
                    onClick={() => {
                      // For demo: create a billing for this unit using current form values
                      setSelectedUnit(r.unit);
                    }}
                  >
                    Select
                  </button>
                </div>
              </div>

              {/* Inline miniature of billing slip — you can replace with real data */}
              <div className="px-2 pb-2">
                <BillingSlip unit={r.unit} electric={100} water={50} rent={r.curr} paidElectric={0} paidWater={0} paidRent={0} />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    className="px-3 py-1 rounded-sm border text-zinc-600 hover:bg-zinc-50"
                    onClick={() => {
                      // For demo we don't have billingID; in real app you'd pass billingID
                      setMessage('Open receipt / preview (not implemented)');
                    }}
                  >
                    Preview
                  </button>
                  <button className="px-3 py-1 rounded-sm bg-customViolet text-white" onClick={() => setMessage('Billing queued to send (demo)')}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick settle payment panel */}
      <section className="bg-white p-4 border rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-customViolet mb-2">Settle Payment</h3>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs text-zinc-600 mb-1">Unit</label>
            <select className="w-full px-3 py-2 rounded-sm border" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
              {(units ?? []).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs text-zinc-600 mb-1">Paid Amount</label>
            <div className="flex items-center gap-2">
              <TbCurrencyPeso />
              <input className="px-3 py-2 rounded-sm border w-full" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs text-zinc-600 mb-1">Paid By</label>
            <select className="w-full px-3 py-2 rounded-sm border">
              {tenants.map((t) => (
                <option key={t.userID} value={t.userID}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-3 flex items-end justify-end gap-2">
            <button className="px-4 py-2 border rounded-sm text-zinc-600 flex items-center gap-2">
              <HiOutlineArrowNarrowLeft /> Cancel
            </button>
            <button className="px-4 py-2 bg-customViolet text-white rounded-sm flex items-center gap-2">
              Confirm <HiOutlineArrowNarrowRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
