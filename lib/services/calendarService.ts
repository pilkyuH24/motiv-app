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

// Calculate mission log status
export function calculateLogStatuses(logs: Log[], days: Date[]) {
  const logMap = new Map<string, Log[]>();

  // Optimize lookup with log map creation
  logs.forEach((log: Log) => {
    const logDateStr = format(parseISO(log.date), "yyyy-MM-dd");
    if (!logMap.has(logDateStr)) logMap.set(logDateStr, []);
    logMap.get(logDateStr)!.push(log);
  });

  // Calculate status for each date
  const statusMap = new Map<string, { status: CalendarLogStatus, logs: Log[] }>();

  days.forEach(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayLogs = logMap.get(dateStr) || [];

    const completedCount = dayLogs.filter(log => log.isDone).length;
    const failedCount = dayLogs.filter(log => !log.isDone).length;
    const totalCount = dayLogs.length;
    const isFutureDay = isFuture(day);

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
  const localMidnight = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const today = localMidnight(new Date());

  // Iterate through mission data to create future logs
  return missions.flatMap((mission) => {
    const start = localMidnight(parseISO(mission.startDate));
    const end = mission.endDate
      ? localMidnight(parseISO(mission.endDate))
      : new Date(today.getTime() + 14 * 86400000); // fallback

    const days = eachDayOfInterval({ start: today, end });

    return days
      .filter((day) => {
        const dayIndex = day.getDay(); // based on local time TEMP
        const daysDifference = Math.floor(
          (day.getTime() - start.getTime()) / 86400000
        );

        return (
          (isEqual(start, day) || isAfter(day, start)) &&
          (!end || isBefore(day, end) || isEqual(day, end)) &&
          (
            (mission.repeatType === "CUSTOM" && mission.repeatDays[dayIndex]) ||
            (mission.repeatType === "WEEKLY" && daysDifference % 7 === 0) ||
            (mission.repeatType === "MONTHLY" && day.getDate() === start.getDate()) ||
            mission.repeatType === "DAILY"
          )
        );
      })
      .map((day) => ({
        date: format(localMidnight(day), "yyyy-MM-dd"),
        isDone: false,
        missionTitle: mission.missionTitle,
      }));
  });
}

// Compare date strings
export function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
