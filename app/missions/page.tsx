"use client";

import { useEffect, useState } from "react";
import "./FlipCard.css";
import Loader from "../components/Loader";
import Navbar from "../components/navbar";

interface Mission {
  id: number;
  title: string;
  description?: string;
  rewardPoints: number;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // ✅ Required at all times
  const [repeatType, setRepeatType] = useState<
    "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM"
  >("WEEKLY");

  const [repeatDays, setRepeatDays] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]); // ✅ Default: All days set to `false`

  const [loading, setLoading] = useState(true); // Loading state for missions
  const [loadingText, setLoadingText] = useState(false); // Loading state for mission start button text

  useEffect(() => {
    // Set loading state to true before fetching data
    setLoading(true);

    fetch("/api/missions")
      .then((res) => res.json())
      .then((data) => setMissions(data))
      .catch((error) => console.error("Error fetching missions:", error))
      .finally(() => setLoading(false)); // Set loading state to false after fetching data
  }, []);

  const openMissionForm = (mission: Mission) => {
    setSelectedMission(mission);
    setStartDate(new Date().toISOString().split("T")[0]);

    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 28);
    setEndDate(oneWeekLater.toISOString().split("T")[0]);

    setRepeatType("WEEKLY");
    setRepeatDays([false, false, false, false, false, false, false]); // ✅ Reset values
  };

  const closeMissionForm = () => {
    setSelectedMission(null);
  };

  const toggleRepeatDay = (dayIndex: number) => {
    setRepeatDays((prev) => {
      const newRepeatDays = [...prev];
      newRepeatDays[dayIndex] = !newRepeatDays[dayIndex]; // ✅ Toggle `true` / `false` for the selected day
      return newRepeatDays;
    });
  };

  const handleStartMission = async () => {
    if (!selectedMission || !startDate || !endDate) {
      alert("Please fill in all the required fields!");
      return;
    }

    setLoadingText(true);
    try {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);

      const response = await fetch("/api/user-missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: selectedMission.id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          repeatType,
          repeatDays:
            repeatType === "CUSTOM"
              ? repeatDays
              : [false, false, false, false, false, false, false], // ✅ boolean[]
        }),
      });

      if (!response.ok) {
        throw new Error("Mission is already in progress or failed.");
      }

      alert("Mission started successfully!");
      closeMissionForm();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingText(false); // DB POST complete
    }
  };

  return (
    <div className="min-h-screen">
      {/* Show loading spinner */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <Navbar />
          <div className="grid sm:grid-cols-1 p-8 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {missions.map((mission) => (
              <div className="flip-card" key={mission.id}>
                <div className="flip-card-inner">
                  {/* Front side */}
                  <div className="flip-card-front">
                    <h2 className="text-4xl mb-5">{mission.title}</h2>
                    <p className="text-base">
                      {mission.description || "No description available"}
                    </p>
                  </div>

                  {/* Back side */}
                  <div className="flip-card-back">
                    <h2 className="title">{mission.title}</h2>
                    <button
                      className="challenge-button"
                      onClick={() => openMissionForm(mission)}
                    >
                      Start Mission
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mission Start Form Modal */}
      {selectedMission && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div
            className="p-6 rounded-lg shadow-lg w-96"
            style={{
              background: `linear-gradient(120deg, rgb(255, 231, 222) 60%, rgb(255, 185, 160) 100%)`,
              color: "#333",
            }}
          >
            <h2 className="text-xl font-bold mb-2">{selectedMission.title}</h2>

            {/* Start Date */}
            <label className="block mt-4 text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />

            {/* End Date */}
            <label className="block mt-4 text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />

            {/* Repeat Type Selection */}
            <label className="block mt-4 text-sm font-medium">Repeat Type</label>
            <div className="flex flex-wrap gap-2">
              {["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"].map((type) => (
                <button
                  key={type}
                  className={`m-1 px-3 py-1 rounded-md ${
                    repeatType === type ? "bg-blue-500 text-white" : "bg-white"
                  }`}
                  onClick={() => setRepeatType(type as any)}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Repeat Days Selection (only shown when repeat type is CUSTOM) */}
            {repeatType === "CUSTOM" && (
              <div>
                <label className="block mt-4 text-sm font-medium">
                  Select Repeat Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                    (day, index) => (
                      <button
                        key={day}
                        className={`m-1 px-3 py-1 rounded-md ${
                          repeatDays[index]
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                        onClick={() => toggleRepeatDay(index)}
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-white text-gray-800 rounded-lg"
                onClick={closeMissionForm}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleStartMission}
                disabled={loading}
              >
                {loadingText ? "⏳ Starting..." : "Start Mission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
