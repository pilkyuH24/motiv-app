//lib/services/calendarService.ts
import {
  format,
  parseISO,
  isFuture,
  isEqual,
  isAfter,
  isBefore,
  eachDayOfInterval,
} from "date-fns";
import { Log, CalendarMission } from "@/types/mission";

export type CalendarLogStatus = "empty" | "future" | "completed" | "partial" | "failed";

const toUTCDate = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const toUTCString = (date: Date) => format(toUTCDate(date), "yyyy-MM-dd");

// Calculate mission log status
export function calculateLogStatuses(logs: Log[], days: Date[]) {
  const logMap = new Map<string, Log[]>();

  logs.forEach((log: Log) => {
    const logDateStr = toUTCString(parseISO(log.date)); 
    if (!logMap.has(logDateStr)) logMap.set(logDateStr, []);
    logMap.get(logDateStr)!.push(log);
  });

  const statusMap = new Map<string, { status: CalendarLogStatus; logs: Log[] }>();

  days.forEach((day) => {
    const dateStr = toUTCString(day); 
    const dayLogs = logMap.get(dateStr) || [];

    const completedCount = dayLogs.filter((log) => log.isDone).length;
    const failedCount = dayLogs.filter((log) => !log.isDone).length;
    const totalCount = dayLogs.length;

    const isFutureDay = isFuture(toUTCDate(day)); 

    let status: CalendarLogStatus = "empty";

    if (isFutureDay && totalCount > 0) {
      status = "future";
    } else if (totalCount === completedCount && completedCount > 0) {
      status = "completed";
    } else if (completedCount > 0 && failedCount > 0) {
      status = "partial";
    } else if (failedCount === totalCount && totalCount > 0) {
      status = "failed";
    }

    statusMap.set(dateStr, { status, logs: dayLogs });
  });

  return statusMap;
}

// Generate future mission log data
export function generateFutureMissionLogs(missions: CalendarMission[]): Log[] {
  const today = toUTCDate(new Date());

  return missions.flatMap((mission) => {
    const start = toUTCDate(parseISO(mission.startDate));
    const end = mission.endDate
      ? toUTCDate(parseISO(mission.endDate))
      : new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 14)); // fallback: 14일 후 UTC

    const days = eachDayOfInterval({ start: today, end });

    return days
      .filter((day) => {
        const dayIndex = day.getUTCDay(); 
        const daysDifference = Math.floor(
          (day.getTime() - start.getTime()) / 86400000
        );

        return (
          (isEqual(start, day) || isAfter(day, start)) &&
          (!end || isBefore(day, end) || isEqual(day, end)) &&
          (
            (mission.repeatType === "CUSTOM" && mission.repeatDays[dayIndex]) ||
            (mission.repeatType === "WEEKLY" && daysDifference % 7 === 0) ||
            (mission.repeatType === "MONTHLY" && day.getUTCDate() === start.getUTCDate()) || // ✅
            mission.repeatType === "DAILY"
          )
        );
      })
      .map((day) => ({
        date: toUTCString(day), 
        isDone: false,
        missionTitle: mission.missionTitle,
      }));
  });
}

export function isSameDay(date1: string, date2: string): boolean {
  const d1 = toUTCDate(new Date(date1));
  const d2 = toUTCDate(new Date(date2));

  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}
