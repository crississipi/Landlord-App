"use client";

import { ChangePageProps, MaintenanceRequest, ScheduledByDate } from "@/types";
import { format, addDays, startOfWeek } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HiMiniCheck, HiOutlineArrowSmallLeft, HiOutlineArrowSmallRight, HiPlus, HiXMark } from "react-icons/hi2";

const Months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Urgency color mapping
const urgencyColors: Record<string, { bg: string; bgDark: string; border: string }> = {
  emerald: { bg: 'bg-emerald-400', bgDark: 'bg-emerald-600', border: 'border-emerald-400' },
  blue: { bg: 'bg-blue-400', bgDark: 'bg-blue-600', border: 'border-blue-400' },
  orange: { bg: 'bg-orange-400', bgDark: 'bg-orange-600', border: 'border-orange-400' },
  red: { bg: 'bg-red-400', bgDark: 'bg-red-600', border: 'border-red-400' },
};

interface CalendaryoProps extends ChangePageProps {
  onSelectMaintenance?: (maintenance: MaintenanceRequest) => void;
}

const Calendaryo = ({ setPage, onSelectMaintenance }: CalendaryoProps) => {
  const [date, setDate] = useState(new Date());
  const currMonth = Months[date.getMonth()];
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  
  // Data states
  const [pendingMaintenances, setPendingMaintenances] = useState<MaintenanceRequest[]>([]);
  const [scheduledByDate, setScheduledByDate] = useState<ScheduledByDate>({});
  const [daySchedules, setDaySchedules] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scheduling states
  const [schedHours, setSchedHours] = useState<number | null>(null);
  const [startAt, setStartsAt] = useState<{ hour: string; mins: string }>({ hour: '08', mins: '00' });
  const [endsAt, setEndsOn] = useState<{ hour: string; mins: string }>({ hour: '17', mins: '00' });
  const [scheduling, setScheduling] = useState(false);
  
  // Modal states
  const [schedulingMaintenance, setSchedulingMaintenance] = useState<MaintenanceRequest | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Calendar navigation
  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const handleDateSelect = (dayNum: number) => {
    setSelectedDay(new Date(date.getFullYear(), date.getMonth(), dayNum));
  };

  // Week headers
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = [...Array(7)].map((_, i) => addDays(weekStart, i));

  // Calendar grid calculations
  const day1 = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const dayNumbers = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // Fetch pending maintenances (not scheduled)
  const fetchPendingMaintenances = useCallback(async () => {
    try {
      const response = await fetch('/api/maintenance?status=pending');
      const data = await response.json();
      if (data.success) {
        setPendingMaintenances(data.maintenances);
      }
    } catch (err) {
      console.error('Error fetching pending maintenances:', err);
    }
  }, []);

  // Fetch scheduled maintenances for the current month
  const fetchScheduledMaintenances = useCallback(async () => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const response = await fetch(`/api/maintenance/schedule?month=${month}&year=${year}`);
      const data = await response.json();
      if (data.success) {
        setScheduledByDate(data.groupedByDate || {});
      }
    } catch (err) {
      console.error('Error fetching scheduled maintenances:', err);
    }
  }, [date]);

  // Fetch schedules for selected day
  const fetchDaySchedules = useCallback(async () => {
    if (!selectedDay) return;
    
    try {
      const dateStr = format(selectedDay, 'yyyy-MM-dd');
      const response = await fetch(`/api/maintenance?date=${dateStr}&status=scheduled`);
      const data = await response.json();
      if (data.success) {
        setDaySchedules(data.maintenances);
      }
    } catch (err) {
      console.error('Error fetching day schedules:', err);
    }
  }, [selectedDay]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPendingMaintenances(), fetchScheduledMaintenances()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchPendingMaintenances, fetchScheduledMaintenances]);

  // Fetch day schedules when selected day changes
  useEffect(() => {
    fetchDaySchedules();
  }, [fetchDaySchedules]);

  const openScheduleModal = (maintenance: MaintenanceRequest) => {
    setSchedulingMaintenance(maintenance);
    if (selectedDay) {
      setScheduleDate(format(selectedDay, 'yyyy-MM-dd'));
    } else {
      setScheduleDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  const closeScheduleModal = () => {
    setSchedulingMaintenance(null);
  };

  // Schedule a maintenance
  const handleSaveSchedule = async () => {
    if (!schedulingMaintenance) return;
    
    setScheduling(true);
    try {
      const response = await fetch('/api/maintenance/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceId: schedulingMaintenance.maintenanceId,
          scheduleDate: scheduleDate,
          startTime: `${startAt.hour}:${startAt.mins}`,
          endTime: `${endsAt.hour}:${endsAt.mins}`
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh data
        await Promise.all([fetchPendingMaintenances(), fetchScheduledMaintenances(), fetchDaySchedules()]);
        closeScheduleModal();
      } else {
        setError(data.error || 'Failed to schedule maintenance');
      }
    } catch (err) {
      setError('Failed to schedule maintenance');
    } finally {
      setScheduling(false);
    }
  };

  // Mark maintenance as fixed (redirect to documentation)
  const handleMarkAsFixed = (maintenance: MaintenanceRequest) => {
    if (onSelectMaintenance) {
      onSelectMaintenance(maintenance);
    }
    // Navigate to documentation page (page 12)
    setPage(12, maintenance.maintenanceId);
  };

  // Get urgency indicators for a specific date
  const getDateIndicators = (dayNum: number): string[] => {
    const dateKey = format(new Date(date.getFullYear(), date.getMonth(), dayNum), 'yyyy-MM-dd');
    const schedules = scheduledByDate[dateKey] || [];
    
    // Get unique urgency colors (max 4)
    const colors = [...new Set(schedules.map(s => s.urgencyColor))].slice(0, 4);
    return colors;
  };

  // Check if date has any fixed items
  const hasFixedItems = (dayNum: number): boolean => {
    const dateKey = format(new Date(date.getFullYear(), date.getMonth(), dayNum), 'yyyy-MM-dd');
    const schedules = scheduledByDate[dateKey] || [];
    return schedules.some(s => s.isFixed);
  };

  const isToday = selectedDay && selectedDay.toDateString() === new Date().toDateString();
  const hasPending = pendingMaintenances.length > 0;
  const hasSchedules = daySchedules.length > 0;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 md:gap-4 lg:gap-6 h-full">
      {/* Calendar */}
      <div className="w-full lg:w-7/12 xl:w-2/3 h-auto flex flex-col bg-zinc-50 rounded-[1.5rem] overflow-hidden shadow-sm border border-zinc-100">
        {/* Month header */}
        <div className="w-full flex items-center justify-between text-lg md:text-xl lg:text-xl p-4 md:p-5">
          <button
            type="button"
            className="p-2 rounded-xl text-2xl md:text-3xl lg:text-2xl hover:bg-zinc-200 focus:bg-customViolet focus:text-white ease-out duration-200"
            onClick={handlePrevMonth}
          >
            <HiOutlineArrowSmallLeft />
          </button>
          <button
            type="button"
            className="p-2 px-4 rounded-xl hover:bg-zinc-200 focus:bg-customViolet focus:text-white ease-out duration-200 font-medium"
          >
            {currMonth} {date.getFullYear()}
          </button>
          <button
            type="button"
            className="p-2 rounded-xl text-2xl md:text-3xl lg:text-2xl hover:bg-zinc-200 focus:bg-customViolet focus:text-white ease-out duration-200"
            onClick={handleNextMonth}
          >
            <HiOutlineArrowSmallRight />
          </button>
        </div>

        {/* Week headers */}
        <div className="w-full grid grid-cols-7 pb-4 px-2">
          {days.map((day, i) => (
            <span key={i} className="col-span-1 text-sm md:text-base lg:text-base font-medium w-full text-center mt-3 text-zinc-500">
              {format(day, "EEE")}
            </span>
          ))}

          {/* Empty slots before first day */}
          {Array.from({ length: day1 === 0 ? 6 : day1 - 1 }).map((_, i) => (
            <span key={`empty-${i}`} className="col-span-1 aspect-square w-full" />
          ))}

          {/* Day numbers */}
          {dayNumbers.map((dayNum) => {
            const indicators = getDateIndicators(dayNum);
            const isSelected = selectedDay && 
              selectedDay.getDate() === dayNum && 
              selectedDay.getMonth() === date.getMonth() &&
              selectedDay.getFullYear() === date.getFullYear();
            const hasFixed = hasFixedItems(dayNum);
            
            return (
              <button
                key={dayNum}
                type="button"
                className={`col-span-1 aspect-square w-full flex flex-col justify-end gap-1 py-2 rounded-xl hover:bg-zinc-200 ease-out duration-200 ${
                  isSelected ? 'bg-customViolet text-white shadow-md shadow-customViolet/20' : 'text-zinc-700'
                }`}
                onClick={() => handleDateSelect(dayNum)}
              >
                {dayNum}
                {/* Urgency indicators */}
                {indicators.length > 0 && (
                  <div className="w-full grid grid-cols-4 gap-0.5 items-center px-2">
                    {indicators.map((color, idx) => (
                      <span 
                        key={idx} 
                        className={`h-1 col-span-1 rounded-full ${
                          hasFixed ? urgencyColors[color]?.bgDark : urgencyColors[color]?.bg
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedules Section */}
      <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-3 mt-3 lg:mt-0">
        <h2 className="font-medium text-lg lg:text-base text-zinc-800">Schedules</h2>
        <h3 className="text-zinc-600 lg:text-sm">
          {selectedDay
            ? isToday
              ? `Today, ${Months[selectedDay.getMonth()]} ${selectedDay.getDate()}`
              : format(selectedDay, "EEEE, MMMM d")
            : "No date selected"}
        </h3>

        {loading ? (
          <div className="w-full p-4 text-center text-zinc-500">Loading...</div>
        ) : error ? (
          <div className="w-full p-4 text-center text-red-500">{error}</div>
        ) : !hasSchedules && !hasPending ? (
          <div className="m-3 items-stretch aspect-video rounded-[1.5rem] bg-zinc-100 flex flex-col justify-center px-12 gap-3 text-zinc-500">
            <p className="text-center">You do not have any schedules this day. Set a new one.</p>
            <button type="button" className="p-3 rounded-xl border border-zinc-300 w-max mx-auto hover:bg-white transition-colors">See all maintenance</button>
          </div>
        ) : (
          <>
            {/* Scheduled Maintenances for Selected Day */}
            {hasSchedules && (
              <div className="w-full h-full flex flex-col gap-3">
                {daySchedules.map((maintenance) => (
                  <div 
                    key={maintenance.maintenanceId} 
                    className="w-full border border-zinc-200 rounded-[1.5rem] overflow-hidden flex items-center bg-white shadow-sm hover:border-customViolet/30 transition-colors"
                  >
                    <button type="button" className="w-full flex h-full p-1">
                      <span className={`h-full w-2 rounded-full my-1 ml-1 ${
                        maintenance.isFixed 
                          ? urgencyColors[maintenance.urgencyColor]?.bgDark 
                          : urgencyColors[maintenance.urgencyColor]?.bg
                      }`}></span>
                      <div className="w-full p-3 text-left font-medium text-zinc-900 leading-5">
                        <h4 className="text-lg">{maintenance.processedRequest || maintenance.rawRequest}</h4>
                        <h5 className="font-semibold text-zinc-500 text-sm mt-1">
                          {maintenance.property?.name || `Unit ${maintenance.propertyId}`}
                        </h5>
                      </div>
                      <div className="h-full flex flex-col items-end justify-center font-semibold text-sm px-4 py-2 leading-4">
                        {maintenance.schedule && (
                          <>
                            <span className="text-customViolet">{format(new Date(maintenance.schedule), 'HH:mm')}</span>
                            <span className="text-zinc-400 text-xs mt-1">{maintenance.tenantName}</span>
                          </>
                        )}
                      </div>
                    </button>
                    {!maintenance.isFixed && (
                      <div className="h-full flex items-center justify-between pr-2">
                        <button 
                          type="button" 
                          className="h-10 w-10 rounded-full flex items-center justify-center text-xl border border-customViolet/30 text-customViolet hover:bg-customViolet hover:text-white transition-all"
                          onClick={() => handleMarkAsFixed(maintenance)}
                          title="Mark as Fixed"
                        >
                          <HiMiniCheck />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pending Maintenances (to be scheduled) */}
            {hasPending && (
              <div className='w-full flex flex-col gap-3 rounded-md mt-4'>
                <h2 className="font-medium text-lg text-zinc-800">Pending ({pendingMaintenances.length})</h2>
                {pendingMaintenances.map((maintenance) => (
                  <div 
                    key={maintenance.maintenanceId} 
                    className="w-full flex flex-col items-center rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm overflow-hidden relative hover:border-customViolet/30 transition-colors"
                  >
                    <div className="w-full flex items-center p-2">
                      <button type="button" className="flex-1 p-2 text-left flex items-center gap-3">
                        <span className={`h-10 px-3 rounded-xl ${urgencyColors[maintenance.urgencyColor]?.bg} flex items-center justify-center shadow-sm`}>
                          <p className="text-white text-xs font-bold">
                            {maintenance.property?.name || maintenance.propertyId}
                          </p>
                        </span>
                        <span className="font-medium text-zinc-900">{maintenance.processedRequest || maintenance.rawRequest}</span>
                      </button>
                      <button 
                        type="button" 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-zinc-100 text-zinc-600 hover:bg-customViolet hover:text-white transition-all"
                        onClick={() => openScheduleModal(maintenance)}
                      >
                        <HiPlus />
                      </button>
                    </div>
                    
                    <div className="w-full px-4 pb-3">
                      <div className="w-full bg-zinc-50 rounded-xl p-3 text-sm text-zinc-700 border border-zinc-100">
                        {maintenance.rawRequest}
                        <div className="mt-2 text-xs text-zinc-400 flex items-center gap-2">
                          <span>Requested by: {maintenance.tenantName}</span>
                          <span>•</span>
                          <span>{format(new Date(maintenance.dateIssued), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Schedule Modal */}
      {schedulingMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border-2 ${urgencyColors[schedulingMaintenance.urgencyColor]?.border || 'border-zinc-200'} animate-in zoom-in-95 duration-200`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-semibold text-lg text-zinc-800">Schedule Maintenance</h3>
              <button onClick={closeScheduleModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <HiXMark className="text-2xl" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
               {/* Info */}
               <div>
                 <h4 className="font-medium text-zinc-900 text-lg">{schedulingMaintenance.processedRequest || schedulingMaintenance.rawRequest}</h4>
                 <p className="text-zinc-500 text-sm mt-1">{schedulingMaintenance.rawRequest}</p>
                 <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                    <span>Requested by: {schedulingMaintenance.tenantName}</span>
                    <span>•</span>
                    <span>{format(new Date(schedulingMaintenance.dateIssued), 'MMM d, yyyy')}</span>
                 </div>
               </div>

               {/* Date & Time Inputs */}
               <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-zinc-700">Date</label>
                    <input 
                      type="date" 
                      value={scheduleDate} 
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-customViolet/20 bg-zinc-50 focus:bg-white transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-700">Start Time</label>
                        <div className="flex items-center gap-1">
                            <select 
                              className="flex-1 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-customViolet/20 outline-none transition-all"
                              value={startAt.hour}
                              onChange={(e) => setStartsAt(prev => ({ ...prev, hour: e.target.value }))}
                            >
                              {Array.from({ length: 24 }).map((_, i) => (
                                <option key={i} value={i < 10 ? `0${i}` : `${i}`}>
                                  {i < 10 ? `0${i}` : i}
                                </option>
                              ))}
                            </select>
                            <span className="font-bold text-zinc-300">:</span>
                            <select 
                              className="flex-1 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-customViolet/20 outline-none transition-all"
                              value={startAt.mins}
                              onChange={(e) => setStartsAt(prev => ({ ...prev, mins: e.target.value }))}
                            >
                              {['00', '15', '30', '45'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-700">End Time</label>
                        <div className="flex items-center gap-1">
                            <select 
                              className="flex-1 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-customViolet/20 outline-none transition-all"
                              value={endsAt.hour}
                              onChange={(e) => setEndsOn(prev => ({ ...prev, hour: e.target.value }))}
                            >
                              {Array.from({ length: 24 }).map((_, i) => (
                                <option key={i} value={i < 10 ? `0${i}` : `${i}`}>
                                  {i < 10 ? `0${i}` : i}
                                </option>
                              ))}
                            </select>
                            <span className="font-bold text-zinc-300">:</span>
                            <select 
                              className="flex-1 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-customViolet/20 outline-none transition-all"
                              value={endsAt.mins}
                              onChange={(e) => setEndsOn(prev => ({ ...prev, mins: e.target.value }))}
                            >
                              {['00', '15', '30', '45'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                        </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
               <button 
                 onClick={closeScheduleModal} 
                 className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-600 hover:bg-zinc-100 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSaveSchedule} 
                 disabled={scheduling}
                 className="px-4 py-2 rounded-xl bg-customViolet text-white hover:bg-customViolet/90 shadow-lg shadow-customViolet/20 transition-all disabled:opacity-50 disabled:shadow-none"
               >
                 {scheduling ? 'Saving...' : 'Save Schedule'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendaryo;
