// components/missionBoard/MissionList.tsx
import { format, parseISO } from "date-fns";
import { UserMission } from "@/types/mission";
import MissionActions from "@/components/dashboard/MissionActions";
import { useState } from "react";

interface MissionListProps {
  missions: UserMission[];
  selectedMission: string | null;
  onSelectMission: (title: string | null) => void;
  onMissionUpdate: () => Promise<void>;
  type: "active" | "completed";
}

export default function MissionList({
  missions,
  selectedMission,
  onSelectMission,
  onMissionUpdate,
  type,
}: MissionListProps) {
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const formatRepeatDays = (repeatDays?: boolean[]) => {
    if (!repeatDays) return "None";
    return repeatDays
      .map((active, index) => (active ? daysOfWeek[index] : null))
      .filter(Boolean)
      .join(", ");
  };

  if (missions.length === 0) {
    return (
      <p>
        {type === "active" ? "No active missions." : "No completed missions."}
      </p>
    );
  }

  const [localMissions, setLocalMissions] = useState<UserMission[]>(missions);

  // Optimistic handler
  const handleOptimisticUpdate = (
    type: "complete" | "delete",
    missionId: number
  ) => {
    if (type === "delete") {
      setLocalMissions((prev) => prev.filter((m) => m.id !== missionId));
    } else if (type === "complete") {
      setLocalMissions((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? {
                ...m,
                logs: [
                  ...m.logs,
                  {
                    date: new Date().toISOString(), // will get formatted later
                    isDone: true,
                  },
                ],
              }
            : m
        )
      );
    }
  };

  return (
    <ul className="space-y-4">
      {localMissions.map((mission) => (
        <li
          key={mission.id}
          className={`border p-4 rounded-lg shadow 
            ${
              type === "active"
                ? "bg-white/20 backdrop-blur-md"
                : "bg-white/10 backdrop-blur-md opacity-80"
            } 
            cursor-pointer 
            ${
              selectedMission === mission.mission.title
                ? "border-blue-500 bg-blue-100"
                : ""
            }`}
          onClick={() =>
            onSelectMission(
              selectedMission === mission.mission.title
                ? null
                : mission.mission.title
            )
          }
        >
          <h2
            className={`${
              type === "active" ? "text-xl" : "text-lg"
            } font-semibold`}
          >
            {mission.mission.title}
          </h2>

          {type === "active" && (
            <p className="text-base ml-2 mr-8 mb-2 text-gray-600">
              {mission.mission.description || "No description"}
            </p>
          )}

          <p
            className={`text-sm ${
              type === "completed" ? "text-gray-600 mb-1" : ""
            }`}
          >
            📅 {format(parseISO(mission.startDate), "yyyy-MM-dd")} -{" "}
            {format(parseISO(mission.endDate), "yyyy-MM-dd")}
            {type === "active" && <>&nbsp;&nbsp;🔁 {mission.repeatType}</>}
          </p>

          {type === "active" && mission.repeatType === "CUSTOM" && (
            <p className="text-sm">
              📅 Repeat Days: {formatRepeatDays(mission.repeatDays)}
            </p>
          )}

          <p
            className={`text-sm ${
              type === "active" ? "mb-2" : "text-gray-600"
            }`}
          >
            📌 Status: {mission.status}
          </p>

          <MissionActions
            missionId={mission.id}
            logs={mission.logs}
            status={mission.status}
            onMissionUpdate={onMissionUpdate}
            onOptimisticUpdate={handleOptimisticUpdate}
          />
        </li>
      ))}
    </ul>
  );
}
