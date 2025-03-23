"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import Calendar from "../components/calendar";
import MissionActions from "../components/MissionActions";
import Loader from "../components/Loader";
import Navbar from "../components/navbar";

interface Log {
  date: string;
  isDone: boolean;
  missionTitle: string;
}

interface UserMission {
  id: number;
  mission: {
    title: string;
    description?: string;
  };
  status: "ONGOING" | "COMPLETED" | "FAILED";
  startDate: string;
  endDate: string;
  repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  repeatDays?: boolean[];
  logs: { date: string; isDone: boolean }[];
}

export default function Dashboard() {
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const refreshMissions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user-missions");
      if (!response.ok) {
        throw new Error("Failed to fetch missions");
      }
      const data = await response.json();
      setUserMissions(data);
    } catch (error) {
      console.error("Error fetching user missions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMissions();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const formatRepeatDays = (repeatDays?: boolean[]) => {
    if (!repeatDays) return "None";
    return repeatDays
      .map((active, index) => (active ? daysOfWeek[index] : null))
      .filter(Boolean)
      .join(", ");
  };

  const activeMissions = userMissions.filter((m) => m.status !== "COMPLETED");
  const completedMissions = userMissions.filter(
    (m) => m.status === "COMPLETED"
  );

  const selectedMissionData = userMissions.find(
    (m) => m.mission.title === selectedMission
  );

  const calendarSource = selectedMissionData
    ? [selectedMissionData]
    : activeMissions;

  const calendarLogs: Log[] = calendarSource.flatMap((mission) =>
    mission.logs.map((log) => ({
      date: format(parseISO(log.date), "yyyy-MM-dd"),
      isDone: log.isDone,
      missionTitle: mission.mission.title,
    }))
  );

  const calendarMissions = calendarSource.map((mission) => ({
    id: mission.id,
    missionTitle: mission.mission.title,
    startDate: mission.startDate,
    endDate: mission.endDate,
    repeatType: mission.repeatType,
    repeatDays: mission.repeatDays || [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
  }));

  return (
    <>
      <Navbar />
      <div className="flex flex-col xl:flex-row p-6 gap-6 min-h-fit lg:min-h-screen">
        <div className="w-full xl:flex-2 bg-white/30 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg p-6">
          <Calendar logs={calendarLogs} userMissions={calendarMissions} />
        </div>

        <div className="w-full xl:flex-1 bg-white/30 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">📋 My Mission Dashboard</h1>

          <button
            className={`w-full py-2 mb-4 rounded-lg ${
              selectedMission === null
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            }`}
            onClick={() => setSelectedMission(null)}
          >
            🔄 View All Active Missions
          </button>

          {activeMissions.length === 0 ? (
            <p>No active missions.</p>
          ) : (
            <ul className="space-y-4">
              {activeMissions.map((mission) => (
                <li
                  key={mission.id}
                  className={`border p-4 rounded-lg shadow bg-white/20 backdrop-blur-md cursor-pointer ${
                    selectedMission === mission.mission.title
                      ? "border-blue-500 bg-blue-100"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedMission(
                      selectedMission === mission.mission.title
                        ? null
                        : mission.mission.title
                    )
                  }
                >
                  <h2 className="text-xl font-semibold">
                    {mission.mission.title}
                  </h2>
                  <p className="text-base ml-2 mr-8 mb-2 text-gray-600">
                    {mission.mission.description || "No description"}
                  </p>
                  <p className="text-sm">
                    📅 {format(parseISO(mission.startDate), "yyyy-MM-dd")} -{" "}
                    {format(parseISO(mission.endDate), "yyyy-MM-dd")}
                    &nbsp;&nbsp;🔁 {mission.repeatType}
                  </p>
                  {mission.repeatType === "CUSTOM" && (
                    <p className="text-sm">
                      📅 Repeat Days: {formatRepeatDays(mission.repeatDays)}
                    </p>
                  )}
                  <p className="text-sm mb-2">📌 Status: {mission.status}</p>
                  <MissionActions
                    missionId={mission.id}
                    logs={mission.logs}
                    status={mission.status}
                    onMissionUpdate={refreshMissions}
                  />
                </li>
              ))}
            </ul>
          )}

          <button
            className="mt-8 w-full py-2 mb-4 rounded-lg bg-gray-100 hover:bg-gray-300 text-gray-800"
            onClick={() => setShowCompleted((prev) => !prev)}
          >
            {showCompleted
              ? "🙈 Hide Completed Missions"
              : "✅ View Completed Missions"}
          </button>

          {showCompleted && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">✅ Completed Missions</h2>
              {completedMissions.length === 0 ? (
                <p>No completed missions.</p>
              ) : (
                <ul className="space-y-4">
                  {completedMissions.map((mission) => (
                    <li
                      key={mission.id}
                      className="border p-4 rounded-lg shadow bg-white/10 backdrop-blur-md opacity-80 cursor-pointer"
                      onClick={() =>
                        setSelectedMission(
                          selectedMission === mission.mission.title
                            ? null
                            : mission.mission.title
                        )
                      }
                    >
                      <h2 className="text-lg font-semibold">
                        {mission.mission.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-1">
                        📅 {format(parseISO(mission.startDate), "yyyy-MM-dd")} -{" "}
                        {format(parseISO(mission.endDate), "yyyy-MM-dd")}
                      </p>
                      <p className="text-sm text-gray-600">
                        📌 Status: {mission.status}
                      </p>
                      <MissionActions
                        missionId={mission.id}
                        logs={mission.logs}
                        status={mission.status}
                        onMissionUpdate={refreshMissions}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
