"use client";

import { ChangePageProps } from "@/types";
import { format, addDays, startOfWeek } from "date-fns";
import React, { useMemo, useState } from "react";
import { HiMiniCheck, HiOutlineArrowSmallLeft, HiOutlineArrowSmallRight, HiPlus } from "react-icons/hi2";

const Months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Calendaryo = ({ setPage }: ChangePageProps) => {

  const [date, setDate] = useState(new Date());
  const currMonth = Months[date.getMonth()];
  const [day, selectedDay] = useState<Date | null>(date);
  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };
  const selectedDate = (sDate: number) => {
    selectedDay(new Date(date.getFullYear(), date.getMonth(), sDate));
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const day1 = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const dayNumbers = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const [startAt, setStartsAt] = useState<{
    hour: string;
    mins: string;
  } | null>({hour: '00', mins: '00'});
  
  const [endsAt, setEndsOn] = useState<{
    hour: string;
    mins: string;
  } | null>({hour: '00', mins: '00'});

  const [schedHours, setSchedHours] = useState(false);
  
  return (
    <div className="w-full flex flex-col gap-3">
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
          {dayNumbers.map((day) => (
            <button
              key={day}
              type="button"
              className="col-span-1 aspect-square w-full flex flex-col justify-end gap-1 py-2 hover:bg-neutral-200 focus:bg-customViolet focus:text-white ease-out duration-200"
              onClick={() => selectedDate(day)}
            >
              {day}
              {/** this span elements are indicators the level of priority/urgency of the request. Green is the lowest, red is highest */}
              <div className="w-full grid grid-cols-3 gap-1 items-center px-2">
                <span className="h-0.5 col-span-1 bg-emerald-400 rounded-full"></span>
                <span className="h-0.5 col-span-1 bg-blue-400 rounded-full"></span>
                <span className="h-0.5 col-span-1 bg-orange-400 rounded-full"></span>
                <span className="h-0.5 col-span-1 bg-red-400 rounded-full"></span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full flex flex-col gap-3 mt-3">
        <h2 className="font-medium text-lg">Schedules</h2>
        <h3>
          {day && (day.toDateString() === date.toDateString())
            ? `Today, ${Months[date.getMonth()]} ${date.getDate()}`
            : day
              ? format(day, "EEEE, MMMM d")
              : "No date selected"}
        </h3>
        {false ? (
          <>
            <div className="m-3 items-stretch aspect-video rounded-md bg-neutral-300 flex flex-col justify-center px-12 gap-3">
              <p className="text-center">You do not have any schedules this day. Set a new one.</p>
              <button type="button" className="p-3 rounded-md border w-max mx-auto">See all maintenance</button>
            </div>
            <div className='w-full flex flex-col gap-3 rounded-md'>
              <h2 className="font-medium text-lg">Pending</h2>
              {Array.from({length: 3}).map((_,i) => (
                <div key={i} className="w-full flex flex-col items-center rounded-2xl border border-customViolet/50 overflow-hidden relative">
                  <div className="w-full flex items-center">
                    <button type="button" className="h-14 p-1 w-full text-left flex items-center gap-3">
                      <span className="h-full w-auto p-2 rounded-xl bg-emerald-300 flex items-center">
                        <p className="text-white text-sm">101</p>
                      </span>
                      <span>Broken Faucet</span>
                    </button>
                    <button type="button" className="px-3 text-2xl h-full bg-neutral-50" onClick={() => setSchedHours(!schedHours)}><HiPlus /></button>
                  </div>
                  <div className="h-auto w-full flex p-2 pt-1">
                    <div className="w-full h-auto bg-neutral-100 rounded-lg p-3">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </div>
                  </div>
                  {schedHours && (
                    <div className="w-full grid grid-cols-2 gap-2 bg-neutral-50 p-2">
                      <div className="col-span-1 w-full flex flex-col gap-3">
                        <label htmlFor="startsAt" className="font-medium">From</label>
                        <div className="w-min flex items-start gap-1 h-44">
                          <div className="relative flex flex-col">
                            <button type="button" className="p-2 px-4 rounded-md border bg-white">{startAt?.hour ?? '00'}</button>
                            <span className="absolute h-32 top-full mt-1 bg-white rounded-md flex flex-col w-full border overflow-x-hidden">
                              {Array.from({length: 25}).map((_,i) => (
                                <button 
                                  type="button" 
                                  className="py-1 w-full hover:bg-customViolet/30 focus:bg-customViolet focus:text-white ease-out duration-200"
                                  onClick={() =>
                                    setStartsAt((prev) => ({
                                      ...(prev ?? { hour: "", mins: "" }), // fallback if null
                                      hour: i < 10 ? `0${i}` : `${i}`,
                                    }))
                                  }
                                >{i < 10 ? `0${i}` : i}</button>
                              ))}
                            </span>
                          </div>
                          <span className="mt-1.5 font-extrabold text-lg">:</span>
                          <div className="relative flex flex-col">
                            <button type="button" className="p-2 px-4 rounded-md border bg-white">{startAt?.mins ?? '00'}</button>
                            <span className="absolute h-32 top-full mt-1 bg-white rounded-md flex flex-col w-full border overflow-x-hidden">
                              {Array.from({length: 61}).map((_,i) => (
                                <button 
                                  type="button" 
                                  className="py-1 w-full hover:bg-customViolet/30 focus:bg-customViolet focus:text-white ease-out duration-200"
                                  onClick={() =>
                                    setStartsAt((prev) => ({
                                      ...(prev ?? { hour: "", mins: "" }), // fallback if null
                                      mins: i < 10 ? `0${i}` : `${i}`,
                                    }))
                                  }
                                >{i < 10 ? `0${i}` : i}</button>
                              ))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 w-full flex flex-col gap-3">
                        <label htmlFor="endsAt" className="font-medium">To</label>
                        <div className="w-min flex items-start gap-1 h-44">
                          <div className="relative flex flex-col">
                            <button type="button" className="p-2 px-4 rounded-md border bg-white">{endsAt?.hour ?? '00'}</button>
                            <span className="absolute h-32 top-full mt-1 bg-white rounded-md flex flex-col w-full border overflow-x-hidden">
                              {Array.from({length: 25}).map((_,i) => (
                                <button 
                                type="button" 
                                className="py-1 w-full hover:bg-customViolet/30 focus:bg-customViolet focus:text-white ease-out duration-200" 
                                onClick={() =>
                                  setEndsOn((prev) => ({
                                    ...(prev ?? { hour: "", mins: "" }), // fallback if null
                                    hour: i < 10 ? `0${i}` : `${i}`,
                                  }))
                                }
                                >{i < 10 ? `0${i}` : i}</button>
                              ))}
                            </span>
                          </div>
                          <span className="mt-1.5 font-extrabold text-lg">:</span>
                          <div className="relative flex flex-col">
                            <button type="button" className="p-2 px-4 rounded-md border bg-white">{endsAt?.mins ?? '00'}</button>
                            <span className="absolute h-32 top-full mt-1 bg-white rounded-md flex flex-col w-full border overflow-x-hidden">
                              {Array.from({length: 61}).map((_,i) => (
                                <button 
                                  type="button" 
                                  className="py-1 w-full hover:bg-customViolet/30 focus:bg-customViolet focus:text-white ease-out duration-200"
                                  onClick={() =>
                                    setEndsOn((prev) => ({
                                      ...(prev ?? { hour: "", mins: "" }), // fallback if null
                                      mins: i < 10 ? `0${i}` : `${i}`,
                                    }))
                                  }
                                >{i < 10 ? `0${i}` : i}</button>
                              ))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex col-span-full justify-end">
                        <button type="button" className="px-3 py-2 rounded-md border border-customViolet/30 hover:border-customViolet focus:bg-customViolet focus:text-white ease-out duration-200">Set Schedule</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_,i) => (
              <div key={i} className="w-full border border-neutral-400 rounded-lg overflow-hidden flex items-center">
                <button type="button" className="w-full flex h-full p-1">
                  <span className="h-full bg-emerald-400 px-1 rounded-full"></span>
                  <div className="w-full p-1 pl-3 text-left font-medium text-black leading-5">
                    <h4>Broken Faucet</h4>
                    <h5 className="font-semibold text-neutral-600">101</h5>
                  </div>
                  <div className="h-full flex flex-col items-end justify-center font-semibold text-sm px-3 py-2 leading-4">
                    <span>08:00</span>
                    <span className="text-neutral-500">14:00</span>
                  </div>
                </button>
                <div className="h-full flex items-center justify-between">
                  <button 
                  type="button" 
                  className="h-full w-max px-3 text-3xl border-l border-customViolet/50 hover:border-customViolet focus:bg-customViolet focus:text-white ease-out duration-200"
                  onClick={() => setPage(12)}
                  ><HiMiniCheck /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendaryo;
