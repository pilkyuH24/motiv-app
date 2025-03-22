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
} from "date-fns";

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
    const upcomingMissions = userMissions.flatMap((mission) => {
      const missionStart = parseISO(mission.startDate);
      const missionEnd = mission.endDate ? parseISO(mission.endDate) : null;

      return isFuture(missionStart)
        ? Array.from(
            {
              length: Math.ceil(
                (missionEnd
                  ? missionEnd.getTime() - missionStart.getTime()
                  : 7 * 86400000) / 86400000
              ),
            },
            (_, i) => ({
              date: format(
                new Date(missionStart.getTime() + i * 86400000),
                "yyyy-MM-dd"
              ),
              isDone: false,
              missionTitle: mission.missionTitle,
            })
          )
        : [];
    });

    setFutureMissions(upcomingMissions);
  }, [userMissions]);

  //  Filter logs when a date is clicked
  const handleDateClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayLogs = logs.filter(
      (log) => format(parseISO(log.date), "yyyy-MM-dd") === dateStr
    );

    if (isFuture(day)) {
      const futureLogsForDay = futureMissions.filter(
        (log) => log.date === dateStr
      );
      setModalLogs(futureLogsForDay);
    } else {
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
          <li key={day} className="font-medium text-gray-800 text-sm sm:text-base lg:text-lg">
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
              <time className="text-xl lg:text-3xl font-semibold">{format(day, "d")}</time>
            </li>
          );
        })}
      </ul>

      {/*  Modal (displayed when a date is clicked) */}
      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center rounded-lg bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-72 lg:w-96 ">
            <h2 className="text-base lg:text-xl font-bold mb-4">
              {format(selectedDate, "yyyy-MM-dd")} Mission Status
            </h2>

            {modalLogs.length > 0 ? (
              <ul className="space-y-2">
                {modalLogs.map((log, index) => (
                  <li key={index} className="flex justify-between text-sm lg:text-lg">
                    <span>{log.missionTitle}</span>
                    <span>{log.isDone ? "✅ Completed" : "❌ Incomplete"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {/*  Display only if future date && repeating mission on this weekday exists */}
                {isFuture(selectedDate)
                  ? userMissions
                      .filter((mission) => {
                        const start = parseISO(mission.startDate);
                        const end = mission.endDate
                          ? parseISO(mission.endDate)
                          : null;
                        const dayIndex = selectedDate.getUTCDay(); //  Get weekday index
                        const daysDifference = Math.floor(
                          (selectedDate.getTime() - start.getTime()) /
                            (1000 * 60 * 60 * 24)
                        ); //  Calculate days difference from start date

                        return (
                          isBefore(start, selectedDate!) &&
                          (!end ||
                            isBefore(selectedDate!, end) ||
                            isEqual(selectedDate!, end)) &&
                          //  CUSTOM (check weekday)
                          ((mission.repeatType === "CUSTOM" &&
                            mission.repeatDays?.[dayIndex]) ||
                            //  WEEKLY (check 7-day interval)
                            (mission.repeatType === "WEEKLY" &&
                              daysDifference % 7 === 0) ||
                            //  MONTHLY (check same day of month)
                            (mission.repeatType === "MONTHLY" &&
                              selectedDate.getDate() === start.getDate()))
                        );
                      })
                      .map((mission, index) => (
                        <li
                          key={index}
                          className="flex justify-between text-lg"
                        >
                          <span>{mission.missionTitle}</span>
                          <span>➖</span>
                        </li>
                      ))
                  : "No missions recorded."}
              </ul>
            )}

            <button
              className="mt-4 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition w-full"
              onClick={() => setSelectedDate(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
