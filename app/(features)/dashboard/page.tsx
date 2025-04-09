// Dashboard Page
"use client";

import { useState } from "react";
import Calendar from "@/components/calendar/calendar";
import Loader from "@/components/ui/Loader";
import Navbar from "@/components/layout/navbar";
import MissionList from "@/components/dashboard/MissionList";
import { useUserMissions } from "@/lib/hooks/useUserMissions";
import { prepareMissionForCalendar, prepareLogsForCalendar } from "@/lib/utils/missionUtils";

export default function Dashboard() {
  const { userMissions, loading, error, refreshMissions } = useUserMissions();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  const activeMissions = userMissions.filter((m) => m.status !== "COMPLETED");
  const completedMissions = userMissions.filter((m) => m.status === "COMPLETED");

  const selectedMissionData = userMissions.find(
    (m) => m.mission.title === selectedMission
  );

  const calendarSource = selectedMissionData ? [selectedMissionData] : activeMissions;
  const calendarLogs = prepareLogsForCalendar(calendarSource);
  const calendarMissions = calendarSource.map(prepareMissionForCalendar);

  return (
    <>
      <Navbar />
      <div className="flex flex-col xl:flex-row mt-4 px-4 gap-4 max-h-[calc(100vh-0.5rem)]">
        <div className="w-full xl:flex-2 h-fit pb-8 mb-4 sm:pb-0 sm:h-[calc(100vh-5rem)] bg-white/20 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg p-6">
          <Calendar logs={calendarLogs} userMissions={calendarMissions} />
        </div>

        <div className="w-full xl:flex-1 pb-8 mb-4 bg-white/20 xl:max-h-[calc(100vh-5rem)] backdrop-blur-lg border border-white/40 rounded-lg shadow-lg p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">📋 My Mission Dashboard</h1>

          <button
            className={`w-full py-2 mb-4 rounded-lg ${
              selectedMission === null
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            }`}
            onClick={() => setSelectedMission(null)}
          >
            View All Active Missions
          </button>

          <MissionList
            missions={activeMissions}
            selectedMission={selectedMission}
            onSelectMission={setSelectedMission}
            onMissionUpdate={refreshMissions}
            type="active"
          />

          <button
            className="mt-8 w-full py-2 mb-4 rounded-lg bg-gray-100 hover:bg-gray-300 text-gray-800"
            onClick={() => setShowCompleted((prev) => !prev)}
          >
            {showCompleted
              ? "Hide Completed Missions"
              : "✅ View Completed Missions"}
          </button>

          {showCompleted && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">✅ Completed Missions</h2>
              <MissionList
                missions={completedMissions}
                selectedMission={selectedMission}
                onSelectMission={setSelectedMission}
                onMissionUpdate={refreshMissions}
                type="completed"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}