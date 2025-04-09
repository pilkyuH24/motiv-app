"use client";

import { format, parseISO, isFuture, isBefore, isEqual } from "date-fns";

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

interface CalendarModalProps {
  selectedDate: Date;
  modalLogs: Log[];
  userMissions: UserMission[];
  onClose: () => void;
}

export default function CalendarModal({
  selectedDate,
  modalLogs,
  userMissions,
  onClose,
}: CalendarModalProps) {
  const selectedUTC = new Date(Date.UTC(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  ));

  const isFutureDate = isFuture(selectedUTC);

  const futurePredictedMissions =
    modalLogs.length > 0
      ? modalLogs
      : userMissions
          .filter((mission) => {
            const start = parseISO(mission.startDate);
            const end = mission.endDate ? parseISO(mission.endDate) : null;
            const dayIndex = selectedUTC.getUTCDay();
            const daysDifference = Math.floor(
              (selectedUTC.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              isBefore(start, selectedUTC) &&
              (!end ||
                isBefore(selectedUTC, end) ||
                isEqual(selectedUTC, end)) &&
              ((mission.repeatType === "CUSTOM" &&
                mission.repeatDays?.[dayIndex]) ||
                (mission.repeatType === "WEEKLY" && daysDifference % 7 === 0) ||
                (mission.repeatType === "MONTHLY" &&
                  selectedUTC.getUTCDate() === start.getUTCDate()) || 
                mission.repeatType === "DAILY")
            );
          })
          .map((mission) => ({
            missionTitle: mission.missionTitle,
            isDone: false,
            date: format(selectedUTC, "yyyy-MM-dd"),
          }));

  return (
    <div className="fixed inset-0 flex items-center justify-center rounded-lg bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-72 lg:w-96">
        <h2 className="text-base lg:text-xl font-bold mb-4">
          {format(selectedUTC, "yyyy-MM-dd")} Mission Status
        </h2>

        {futurePredictedMissions.length > 0 ? (
          <ul className="space-y-2">
            {futurePredictedMissions.map((log, index) => (
              <li
                key={index}
                className="flex justify-between text-sm lg:text-lg"
              >
                <span>{log.missionTitle}</span>
                <span>
                  {isFutureDate
                    ? "➖"
                    : log.isDone
                    ? "✅ Completed"
                    : "❌ Incomplete"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No missions recorded.</p>
        )}

        <button
          className="mt-4 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition w-full"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
