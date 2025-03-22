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

  /**
   * Fetches the user's missions from the API and updates the state.
   * This function is also used to refresh the missions when an update occurs.
   */
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

  /**
   * Runs once when the component mounts to load the missions.
   */
  useEffect(() => {
    refreshMissions();
  }, []);

  /**
   * Displays a loading component while data is being fetched.
   */
  if (loading) {
    return <Loader />;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  /**
   * Converts the mission logs from UTC format to KST (or local time).
   * This ensures consistency when displaying the logs in the calendar.
   */
  const allLogs: Log[] = userMissions.flatMap((mission) =>
    mission.logs.map((log) => ({
      date: format(parseISO(log.date), "yyyy-MM-dd"),
      isDone: log.isDone,
      missionTitle: mission.mission.title,
    }))
  );

  /**
   * Transforms user missions to match the expected format for the Calendar component.
   * - Ensures each mission has a missionTitle property.
   * - Provides default values for repeatDays to prevent undefined issues.
   */
  const transformedMissions = userMissions.map((mission) => ({
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
    ], // Default to all false if undefined
  }));

  /**
   * Filters the logs to display only those related to the selected mission.
   * If no mission is selected, all logs are displayed.
   */
  const filteredLogs = selectedMission
    ? allLogs.filter((log) => log.missionTitle === selectedMission)
    : allLogs;

  /**
   * Converts the repeatDays boolean array into a human-readable format.
   * Example: [false, true, true, false, false, true, false] → "MON, TUE, FRI"
   */
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const formatRepeatDays = (repeatDays?: boolean[]) => {
    if (!repeatDays) return "None"; // If repeatDays is undefined, return "None"
    return repeatDays
      .map((active, index) => (active ? daysOfWeek[index] : null)) // Map active days to their corresponding labels
      .filter(Boolean) // Remove null values
      .join(", "); // Join into a comma-separated string
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col xl:flex-row p-6 gap-6 min-h-fit lg:min-h-screen">
        {/* Calendar Section */}
        <div className="w-full xl:flex-2 bg-white/30 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg p-6">
          <Calendar logs={filteredLogs} userMissions={transformedMissions} />
        </div>

        {/* Mission Dashboard Section */}
        <div className="w-full xl:flex-1 bg-white/30 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">📋 My Mission Dashboard</h1>

          {/* Button to reset the mission selection and view all missions */}
          <button
            className={`w-full py-2 mb-4 rounded-lg ${
              selectedMission === null
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            }`}
            onClick={() => setSelectedMission(null)}
          >
            🔄 View All Missions
          </button>

          {/* Display a message if there are no active missions */}
          {userMissions.length === 0 ? (
            <p>No active missions.</p>
          ) : (
            <ul className="space-y-4">
              {userMissions.map((mission) => (
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

                  {/* Display mission start and end dates along with repeat type */}
                  <p className="text-sm">
                    📅 {format(parseISO(mission.startDate), "yyyy-MM-dd")} - {" "}
                    {format(parseISO(mission.endDate), "yyyy-MM-dd")}
                    &nbsp;&nbsp;🔁 {mission.repeatType}
                  </p>

                  {/* Display repeat days if the mission has a custom schedule */}
                  {mission.repeatType === "CUSTOM" && (
                    <p className="text-sm">
                      📅 Repeat Days: {formatRepeatDays(mission.repeatDays)}
                    </p>
                  )}

                  {/* Display mission status */}
                  <p className="text-sm mb-2">📌 Status: {mission.status}</p>

                  {/* Action buttons to complete or delete missions */}
                  <MissionActions
                    missionId={mission.id}
                    logs={mission.logs} // Pass today's logs for mission tracking
                    onMissionUpdate={refreshMissions}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
