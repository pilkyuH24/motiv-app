"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  parseISO,
  isFuture,
  isBefore,
  isEqual,
  isAfter,
} from "date-fns";
import CalendarModal from "./CalendarModal";

interface Log {
  date: string;
  isDone: boolean;
  missionTitle: string;
}

interface UserMission {
  id: number;
  missionTitle: string;
  startDate: string;
  endDate: string;
  repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  repeatDays?: boolean[];
}

interface CalendarProps {
  logs: Log[];
  userMissions: UserMission[];
}

export default function Calendar({ logs, userMissions }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalLogs, setModalLogs] = useState<Log[]>([]);
  const [futureMissions, setFutureMissions] = useState<Log[]>([]);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const paddingStart = getDay(firstDayOfMonth);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  //  Get missions for future dates
  useEffect(() => {
    const localMidnight = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
    const today = localMidnight(new Date());
  
    const upcomingMissions = userMissions.flatMap((mission) => {
      const start = localMidnight(parseISO(mission.startDate));
      const end = mission.endDate
        ? localMidnight(parseISO(mission.endDate))
        : new Date(today.getTime() + 14 * 86400000); // fallback
  
      const days = eachDayOfInterval({ start: today, end });
  
      return days
        .filter((day) => {
          const dayIndex = day.getDay(); // local 기준
          const daysDifference = Math.floor(
            (day.getTime() - start.getTime()) / 86400000
          );
  
          return (
            (isEqual(start, day) || isAfter(day, start)) && // ✅ 핵심 수정
            (!end || isBefore(day, end) || isEqual(day, end)) &&
            (
              (mission.repeatType === "CUSTOM" && mission.repeatDays?.[dayIndex]) ||
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
  
    console.log("🌿 futureMissions 완성 (fixed!):", upcomingMissions);
    setFutureMissions(upcomingMissions);
  }, [userMissions]);
  

  //  Filter logs when a date is clicked
  const handleDateClick = (day: Date) => {
  const dateStr = format(day, "yyyy-MM-dd");
  console.log("🖱️ Date clicked:", dateStr);

  if (isFuture(day)) {
    const futureLogsForDay = futureMissions.filter((log) => {
      const logDate = new Date(log.date); // ← parseISO보다 new Date로 로컬 시간 인식
      const logDateStr = format(logDate, "yyyy-MM-dd");
      return logDateStr === dateStr;
    });
    console.log("🔮 future logs found:", futureLogsForDay);
    setModalLogs(futureLogsForDay);
  } else {
    const dayLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      const logDateStr = format(logDate, "yyyy-MM-dd");
      return logDateStr === dateStr;
    });
    console.log("📜 past logs found:", dayLogs);
    setModalLogs(dayLogs);
  }

  setSelectedDate(day);
};

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
        {format(currentDate, "yyyy MMMM")}
      </h1>

      {/*  Month change buttons */}
      <div className="flex justify-center gap-65 sm:gap-100 lg:justify-between w-full max-w-2xl mb-4 ">
        <button
          className="w-4 h-4 sm:w-8 sm:h-8 bg-black hover:bg-gray-600 transition"
          style={{
            clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
          }}
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.setMonth(currentDate.getMonth() - 1))
            )
          }
        />
        <button
          className="w-4 h-4 sm:w-8 sm:h-8 bg-black hover:bg-gray-600 transition"
          style={{
            clipPath: "polygon(100% 50%, 0 100%, 0 0)",
          }}
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.setMonth(currentDate.getMonth() + 1))
            )
          }
        />
      </div>

      <ul className="grid grid-cols-7 gap-2 list-none text-center">
        {dayLabels.map((day) => (
          <li
            key={day}
            className="font-medium text-gray-800 text-sm sm:text-base lg:text-lg"
          >
            {day}
          </li>
        ))}
        {Array.from({ length: paddingStart }).map((_, i) => (
          <li key={`empty-${i}`} className=""></li>
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");

          //  Optimize search speed by converting logs to Map
          const logMap = new Map<string, Log[]>();
          logs.forEach((log: Log) => {
            const logDateStr = format(parseISO(log.date), "yyyy-MM-dd");
            if (!logMap.has(logDateStr)) logMap.set(logDateStr, []);
            logMap.get(logDateStr)!.push(log);
          });

          //  Get logs for the specific date
          const dayLogs = logMap.get(dateStr) || [];

          //  Check completion status
          const completedCount = dayLogs.filter((log) => log.isDone).length;
          const failedCount = dayLogs.filter((log) => !log.isDone).length;
          const totalCount = dayLogs.length;
          const isFutureDay = isFuture(day);

          //  Default background color setting
          let bgColor = "bg-white/90"; // Default (no records)

          if (isFutureDay && totalCount > 0) {
            bgColor = "bg-gray-300/90"; //  Gray only if future date with logs
          } else if (totalCount === completedCount && completedCount > 0) {
            bgColor = "bg-blue-500/90"; //  All completed (blue)
          } else if (completedCount > 0 && failedCount > 0) {
            bgColor = "bg-orange-500/90"; // ⚠ Partial completion (orange)
          } else if (failedCount === totalCount && totalCount > 0) {
            bgColor = "bg-red-500/90"; //  All incomplete (red)
          }

          return (
            <li
              key={day.getTime()}
              className={`flex flex-col items-center justify-center w-8 h-8 sm:w-16 sm:h-16 lg:w-24 lg:h-24 sm:text-base p-4 rounded-lg shadow-md border border-white/20 transition text-lg font-light 
        ${bgColor} ${isToday(day) ? "border-2 border-white" : ""} 
        hover:bg-opacity-80 cursor-pointer`}
              onClick={() => handleDateClick(day)}
            >
              <time className="text-xl lg:text-3xl font-semibold">
                {format(day, "d")}
              </time>
            </li>
          );
        })}
      </ul>

      {/*  Modal (displayed when a date is clicked) */}
      {selectedDate && (
        <CalendarModal
          selectedDate={selectedDate}
          modalLogs={modalLogs}
          userMissions={userMissions}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}