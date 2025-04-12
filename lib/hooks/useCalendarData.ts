//lib/hooks/useCalendarData.ts
import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isFuture,
} from "date-fns";
import { Log, CalendarMission } from "@/types/mission";
import { 
  calculateLogStatuses, 
  generateFutureMissionLogs, 
  isSameDay,
} from "@/lib/services/calendarService";

const getUTCDate = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

export function useCalendarData(logs: Log[], userMissions: CalendarMission[]) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalLogs, setModalLogs] = useState<Log[]>([]);
  const [futureMissions, setFutureMissions] = useState<Log[]>([]);

  const calendarData = useMemo(() => {
    const first = getUTCDate(startOfMonth(currentDate));
    const last = getUTCDate(endOfMonth(currentDate));
    
    return {
      firstDayOfMonth: first,
      lastDayOfMonth: last,
      days: eachDayOfInterval({ start: first, end: last }),
      dayLabels: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      paddingStart: first.getUTCDay(),
      monthTitle: format(first, "yyyy MMMM"),
    };
  }, [currentDate]);

  // Generate future mission data
  useEffect(() => {
    const upcomingMissions = generateFutureMissionLogs(userMissions);
    setFutureMissions(upcomingMissions);
  }, [userMissions]);

  // Handler for clicking a date
  const handleDateClick = (day: Date) => {
    const utcDay = getUTCDate(day); // 
    const dateStr = format(utcDay, "yyyy-MM-dd");

    if (isFuture(utcDay)) {
      const futureLogsForDay = futureMissions.filter(log => 
        isSameDay(log.date, dateStr)
      );
      setModalLogs(futureLogsForDay);
    } else {
      const dayLogs = logs.filter(log => 
        isSameDay(log.date, dateStr)
      );
      setModalLogs(dayLogs);
    }

    setSelectedDate(utcDay);
  };

  // Handlers to navigate to previous/next month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Calculate log status by day
  const logStatusMap = useMemo(() => {
    return calculateLogStatuses(logs, calendarData.days);
  }, [logs, calendarData.days]);

  return {
    calendarData,
    currentDate,
    selectedDate,
    modalLogs,
    logStatusMap,
    handleDateClick,
    goToPreviousMonth,
    goToNextMonth,
    closeModal: () => setSelectedDate(null),
  };
}
