"use client";

import { ChangePageProps, MaintenanceRequest, ScheduledByDate } from "@/types";
import { format, addDays, startOfWeek } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HiMiniCheck, HiOutlineArrowSmallLeft, HiOutlineArrowSmallRight, HiPlus } from "react-icons/hi2";

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

  // Schedule a maintenance
  const handleScheduleMaintenance = async (maintenanceId: number) => {
    if (!selectedDay) return;
    
    setScheduling(true);
    try {
      const scheduleDate = format(selectedDay, 'yyyy-MM-dd');
      const response = await fetch('/api/maintenance/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceId,
          scheduleDate,
          startTime: `${startAt.hour}:${startAt.mins}`,
          endTime: `${endsAt.hour}:${endsAt.mins}`
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh data
        await Promise.all([fetchPendingMaintenances(), fetchScheduledMaintenances(), fetchDaySchedules()]);
        setSchedHours(null);
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
    <div className="w-full flex flex-col gap-3">
      {/* Calendar */}
      <div className="w-full h-auto flex flex-col bg-neutral-100 rounded-lg overflow-hidden">
        {/* Month header */}
        <div className="w-full flex items-center justify-between text-lg p-2">
          <button
            type="button"
            className="p-1 rounded-sm text-2xl hover:bg-neutral-200 focus:bg-customViolet focus:text-white ease-out duration-200"
            onClick={handlePrevMonth}
          >
            <HiOutlineArrowSmallLeft />
          </button>
          <button
            type="button"
            className="p-1 px-3 rounded-sm hover:bg-neutral-200 focus:bg-customViolet focus:text-white ease-out duration-200"
          >
            {currMonth} {date.getFullYear()}
          </button>
          <button
            type="button"
            className="p-1 rounded-sm text-2xl hover:bg-neutral-200 focus:bg-customViolet focus:text-white ease-out duration-200"
            onClick={handleNextMonth}
          >
            <HiOutlineArrowSmallRight />
          </button>
        </div>

        {/* Week headers */}
        <div className="w-full grid grid-cols-7">
          {days.map((day, i) => (
            <span key={i} className="col-span-1 text-sm font-medium w-full text-center mt-3">
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
                className={`col-span-1 aspect-square w-full flex flex-col justify-end gap-1 py-2 hover:bg-neutral-200 ease-out duration-200 ${
                  isSelected ? 'bg-customViolet text-white' : ''
                }`}
                onClick={() => handleDateSelect(dayNum)}
              >
                {dayNum}
                {/* Urgency indicators */}
                {indicators.length > 0 && (
                  <div className="w-full grid grid-cols-4 gap-0.5 items-center px-1">
                    {indicators.map((color, idx) => (
                      <span 
                        key={idx} 
                        className={`h-0.5 col-span-1 rounded-full ${
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
      <div className="w-full flex flex-col gap-3 mt-3">
        <h2 className="font-medium text-lg">Schedules</h2>
        <h3>
          {selectedDay
            ? isToday
              ? `Today, ${Months[selectedDay.getMonth()]} ${selectedDay.getDate()}`
              : format(selectedDay, "EEEE, MMMM d")
            : "No date selected"}
        </h3>

        {loading ? (
          <div className="w-full p-4 text-center text-neutral-500">Loading...</div>
        ) : error ? (
          <div className="w-full p-4 text-center text-red-500">{error}</div>
        ) : !hasSchedules && !hasPending ? (
          <div className="m-3 items-stretch aspect-video rounded-md bg-neutral-300 flex flex-col justify-center px-12 gap-3">
            <p className="text-center">You do not have any schedules this day. Set a new one.</p>
            <button type="button" className="p-3 rounded-md border w-max mx-auto">See all maintenance</button>
          </div>
        ) : (
          <>
            {/* Scheduled Maintenances for Selected Day */}
            {hasSchedules && (
              <div className="w-full h-full flex flex-col gap-3">
                {daySchedules.map((maintenance) => (
                  <div 
                    key={maintenance.maintenanceId} 
                    className="w-full border border-neutral-400 rounded-lg overflow-hidden flex items-center"
                  >
                    <button type="button" className="w-full flex h-full p-1">
                      <span className={`h-full px-1 rounded-full ${
                        maintenance.isFixed 
                          ? urgencyColors[maintenance.urgencyColor]?.bgDark 
                          : urgencyColors[maintenance.urgencyColor]?.bg
                      }`}></span>
                      <div className="w-full p-1 pl-3 text-left font-medium text-black leading-5">
                        <h4>{maintenance.processedRequest || maintenance.rawRequest}</h4>
                        <h5 className="font-semibold text-neutral-600">
                          {maintenance.property?.name || `Unit ${maintenance.propertyId}`}
                        </h5>
                      </div>
                      <div className="h-full flex flex-col items-end justify-center font-semibold text-sm px-3 py-2 leading-4">
                        {maintenance.schedule && (
                          <>
                            <span>{format(new Date(maintenance.schedule), 'HH:mm')}</span>
                            <span className="text-neutral-500">{maintenance.tenantName}</span>
                          </>
                        )}
                      </div>
                    </button>
                    {!maintenance.isFixed && (
                      <div className="h-full flex items-center justify-between">
                        <button 
                          type="button" 
                          className="h-full w-max px-3 text-3xl border-l border-customViolet/50 hover:border-customViolet focus:bg-customViolet focus:text-white ease-out duration-200"
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
                <h2 className="font-medium text-lg">Pending ({pendingMaintenances.length})</h2>
                {pendingMaintenances.map((maintenance) => (
                  <div 
                    key={maintenance.maintenanceId} 
                    className="w-full flex flex-col items-center rounded-2xl border border-customViolet/50 overflow-hidden relative"
                  >
                    <div className="w-full flex items-center">
                      <button type="button" className="h-14 p-1 w-full text-left flex items-center gap-3">
                        <span className={`h-full w-auto p-2 rounded-xl ${urgencyColors[maintenance.urgencyColor]?.bg} flex items-center`}>
                          <p className="text-white text-sm">
                            {maintenance.property?.name || maintenance.propertyId}
                          </p>
                        </span>
                        <span>{maintenance.processedRequest || maintenance.rawRequest}</span>
                      </button>
                      <button 
                        type="button" 
                        className="px-3 text-2xl h-full bg-neutral-50" 
                        onClick={() => setSchedHours(schedHours === maintenance.maintenanceId ? null : maintenance.maintenanceId)}
                      >
                        <HiPlus className={schedHours === maintenance.maintenanceId ? 'rotate-45' : ''} />
                      </button>
                    </div>
                    <div className="h-auto w-full flex p-2 pt-1">
                      <div className="w-full h-auto bg-neutral-100 rounded-lg p-3 text-sm">
                        {maintenance.rawRequest}
                        <div className="mt-2 text-xs text-neutral-500">
                          Requested by: {maintenance.tenantName} • {format(new Date(maintenance.dateIssued), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Time Picker for Scheduling */}
                    {schedHours === maintenance.maintenanceId && (
                      <div className="w-full grid grid-cols-2 gap-2 bg-neutral-50 p-2">
                        <div className="col-span-1 w-full flex flex-col gap-2">
                          <label className="font-medium text-sm">From</label>
                          <div className="flex items-center gap-1">
                            <select 
                              className="p-2 px-3 rounded-md border bg-white"
                              value={startAt.hour}
                              onChange={(e) => setStartsAt(prev => ({ ...prev, hour: e.target.value }))}
                            >
                              {Array.from({ length: 24 }).map((_, i) => (
                                <option key={i} value={i < 10 ? `0${i}` : `${i}`}>
                                  {i < 10 ? `0${i}` : i}
                                </option>
                              ))}
                            </select>
                            <span className="font-bold">:</span>
                            <select 
                              className="p-2 px-3 rounded-md border bg-white"
                              value={startAt.mins}
                              onChange={(e) => setStartsAt(prev => ({ ...prev, mins: e.target.value }))}
                            >
                              {['00', '15', '30', '45'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-span-1 w-full flex flex-col gap-2">
                          <label className="font-medium text-sm">To</label>
                          <div className="flex items-center gap-1">
                            <select 
                              className="p-2 px-3 rounded-md border bg-white"
                              value={endsAt.hour}
                              onChange={(e) => setEndsOn(prev => ({ ...prev, hour: e.target.value }))}
                            >
                              {Array.from({ length: 24 }).map((_, i) => (
                                <option key={i} value={i < 10 ? `0${i}` : `${i}`}>
                                  {i < 10 ? `0${i}` : i}
                                </option>
                              ))}
                            </select>
                            <span className="font-bold">:</span>
                            <select 
                              className="p-2 px-3 rounded-md border bg-white"
                              value={endsAt.mins}
                              onChange={(e) => setEndsOn(prev => ({ ...prev, mins: e.target.value }))}
                            >
                              {['00', '15', '30', '45'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex col-span-full justify-end gap-2 mt-2">
                          <button 
                            type="button" 
                            className="px-3 py-2 rounded-md border border-neutral-300 hover:border-neutral-400 ease-out duration-200"
                            onClick={() => setSchedHours(null)}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            className="px-3 py-2 rounded-md border border-customViolet/30 hover:border-customViolet focus:bg-customViolet focus:text-white ease-out duration-200 disabled:opacity-50"
                            onClick={() => handleScheduleMaintenance(maintenance.maintenanceId)}
                            disabled={scheduling || !selectedDay}
                          >
                            {scheduling ? 'Scheduling...' : `Schedule for ${selectedDay ? format(selectedDay, 'MMM d') : 'Select a date'}`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Calendaryo;
