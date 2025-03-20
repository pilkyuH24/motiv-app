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
} from "date-fns";

// Represents a mission log entry for a specific date
interface Log {
  date: string; // Date of the log (format: YYYY-MM-DD)
  isDone: boolean; // Indicates whether the mission was completed
  missionTitle: string; // Title of the mission
}

// Represents a mission assigned to a user
interface UserMission {
  id: number; // Unique mission identifier
  missionTitle: string; // Mission title
  startDate: string; // Start date in ISO format
  endDate: string; // End date in ISO format
  repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM"; // Type of repetition
  repeatDays?: boolean[]; // Array indicating active days (only for CUSTOM)
}

// Props passed to the Calendar component
interface CalendarProps {
  logs: Log[]; // Array of mission completion logs
  userMissions: UserMission[]; // Array of active user missions
}

export default function Calendar({ logs, userMissions }: CalendarProps) {
  // Stores the currently displayed month
  const [currentDate, setCurrentDate] = useState(new Date());

  // Stores the date selected by the user
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Stores logs for the selected date
  const [modalLogs, setModalLogs] = useState<Log[]>([]);

  // Stores future mission logs for upcoming days
  const [futureMissions, setFutureMissions] = useState<Log[]>([]);

  // Calculate the first and last days of the current month
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  // Generate an array of all days in the current month
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  // Labels for the days of the week (Sunday to Saturday)
  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Determine how many empty slots are needed before the first day of the month
  const paddingStart = getDay(firstDayOfMonth);

  // Today's date, reset to midnight (UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  /**
   * Fetches missions scheduled for future dates and pre-fills them in the calendar.
   * This effect runs when the `userMissions` array changes.
   */
  useEffect(() => {
    const upcomingMissions = userMissions.flatMap((mission) => {
      const missionStart = parseISO(mission.startDate);
      const missionEnd = mission.endDate ? parseISO(mission.endDate) : null;

      return isFuture(missionStart) // Process only future missions
        ? Array.from(
            {
              length: Math.ceil(
                (missionEnd
                  ? missionEnd.getTime() - missionStart.getTime()
                  : 7 * 86400000) / 86400000
              ), // Calculate the number of days between mission start and end
            },
            (_, i) => ({
              date: format(
                new Date(missionStart.getTime() + i * 86400000),
                "yyyy-MM-dd"
              ), // Convert each day to a formatted string
              isDone: false,
              missionTitle: mission.missionTitle,
            })
          )
        : [];
    });

    setFutureMissions(upcomingMissions);
  }, [userMissions]);

  /**
   * Handles user clicking on a specific date.
   * It filters logs and displays them in the modal.
   */
  const handleDateClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");

    // Find logs for the selected date
    const dayLogs = logs.filter(
      (log) => format(parseISO(log.date), "yyyy-MM-dd") === dateStr
    );

    if (isFuture(day)) {
      // If the selected date is in the future, check for scheduled missions
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
    <div className="flex flex-col items-center min-h-screen">
      {/* Display the current month and year */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
        {format(currentDate, "yyyy MMMM")}
      </h1>

      {/* Navigation buttons for changing months */}
      <div className="flex justify-between w-full max-w-2xl mb-4">
        <button
          className="w-8 h-8 bg-black hover:bg-gray-600 transition"
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
          className="w-8 h-8 bg-black hover:bg-gray-600 transition"
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
        {/* Render weekday labels */}
        {dayLabels.map((day) => (
          <li key={day} className="font-medium text-gray-800 text-lg">
            {day}
          </li>
        ))}
        {/* Render empty spaces for previous month's days */}
        {Array.from({ length: paddingStart }).map((_, i) => (
          <li key={`empty-${i}`} className=""></li>
        ))}

        {/* Render all days in the current month */}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isFutureDay = isFuture(day);

          // Determine background color based on mission completion
          let bgColor = "bg-white/25";

          // Find all logs for the current date
          const dayLogs = logs.filter(
            (log) => format(parseISO(log.date), "yyyy-MM-dd") === dateStr
          );

          const completedCount = dayLogs.filter((log) => log.isDone).length;
          const failedCount = dayLogs.filter((log) => !log.isDone).length;
          const totalCount = dayLogs.length;

          if (isFutureDay && totalCount > 0) {
            bgColor = "bg-gray-300";
          } else if (totalCount === completedCount && completedCount > 0) {
            bgColor = "bg-blue-500";
          } else if (completedCount > 0 && failedCount > 0) {
            bgColor = "bg-orange-500";
          } else if (failedCount === totalCount && totalCount > 0) {
            bgColor = "bg-red-500";
          }

          return (
            <li
              key={day.getTime()}
              className={`flex flex-col items-center justify-center w-24 h-24 p-4 rounded-lg shadow-md border border-white/20 transition text-lg font-light 
        ${bgColor} ${isToday(day) ? "border-2 border-white" : ""} 
        hover:bg-opacity-80 cursor-pointer`}
              onClick={() => handleDateClick(day)}
            >
              <time className="text-3xl font-semibold">{format(day, "d")}</time>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
