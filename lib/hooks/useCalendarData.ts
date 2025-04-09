import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isFuture,
} from "date-fns";
import { Log, CalendarMission } from "@/types/mission";
import { 
  calculateLogStatuses, 
  generateFutureMissionLogs, 
  isSameDay,
} from "@/lib/services/calendarService";

export function useCalendarData(logs: Log[], userMissions: CalendarMission[]) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalLogs, setModalLogs] = useState<Log[]>([]);
  const [futureMissions, setFutureMissions] = useState<Log[]>([]);

  // Calculate base calendar data
  const calendarData = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    
    return {
      firstDayOfMonth,
      lastDayOfMonth,
      days: eachDayOfInterval({
        start: firstDayOfMonth,
        end: lastDayOfMonth,
      }),
      dayLabels: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      paddingStart: getDay(firstDayOfMonth),
      monthTitle: format(currentDate, "yyyy MMMM"),
    };
  }, [currentDate]);

  // Generate future mission data
  useEffect(() => {
    const upcomingMissions = generateFutureMissionLogs(userMissions);
    setFutureMissions(upcomingMissions);
  }, [userMissions]);

  // Handler for clicking a date
  const handleDateClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");

    if (isFuture(day)) {
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

    setSelectedDate(day);
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
