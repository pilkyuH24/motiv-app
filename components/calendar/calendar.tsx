//components/calendar/calendar.tsx
"use client";

import React from "react";
import { format } from "date-fns";
import { Log, CalendarMission } from "@/types/mission";
import { useCalendarData } from "@/lib/hooks/useCalendarData";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDay } from "./CalendarDay";
import CalendarModal from "./CalendarModal";

interface CalendarProps {
  logs: Log[];
  userMissions: CalendarMission[];
}

export default function Calendar({ logs, userMissions }: CalendarProps) {
  const {
    calendarData,
    selectedDate,
    modalLogs,
    logStatusMap,
    handleDateClick,
    goToPreviousMonth,
    goToNextMonth,
    closeModal,
  } = useCalendarData(logs, userMissions);

  return (
    <div className="flex flex-col items-center">
      <CalendarHeader
        title={calendarData.monthTitle}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <ul className="grid grid-cols-7 gap-2 list-none text-center">
        {/* Day of week labels */}
        {calendarData.dayLabels.map((day) => (
          <li
            key={day}
            className="font-medium text-gray-800 text-sm sm:text-base lg:text-lg"
          >
            {day}
          </li>
        ))}
        
        {/* Empty slots before the first day of the month */}
        {Array.from({ length: calendarData.paddingStart }).map((_, i) => (
          <li key={`empty-${i}`} className=""></li>
        ))}

        {/* Calendar dates */}
        {calendarData.days.map((day) => {
          const dateStr = format(new Date(Date.UTC( day.getFullYear(), day.getMonth(), day.getDate() )), "yyyy-MM-dd");
          const dayData = logStatusMap.get(dateStr) || { status: "empty", logs: [] };
          
          return (
            <CalendarDay
              key={day.getTime()}
              day={day}
              status={dayData.status}
              onClick={handleDateClick}
            />
          );
        })}
      </ul>

      {/* Modal */}
      {selectedDate && (
        <CalendarModal
          selectedDate={selectedDate}
          modalLogs={modalLogs}
          userMissions={userMissions}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
