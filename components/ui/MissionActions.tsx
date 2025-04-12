"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";

// Interface defining the props required for the MissionActions component
interface MissionActionsProps {
  missionId: number;
  logs: { date: string; isDone: boolean }[];
  status: "ONGOING" | "COMPLETED" | "FAILED";
  onMissionUpdate: () => void; // Callback function to refresh mission data
}

// Component handling mission actions such as marking completion and deletion
export default function MissionActions({
  missionId,
  logs,
  status,
  onMissionUpdate,
}: MissionActionsProps) {
  const [loading, setLoading] = useState(false); 

  const today = format(new Date(), "yyyy-MM-dd");

  // Find today's log entry and check if the mission is completed
  const todayLog = logs.find(
    (log) =>
      format(parseISO(log.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
  );
  const isCompletedToday = todayLog ? todayLog.isDone : false;

  // Handler to mark today's mission as completed
  const handleCompleteToday = async () => {
    if (isCompletedToday) return; 

    setLoading(true);
    try {
      // Send a request to update today's mission status
      const response = await fetch(
        `/api/user-missions/${missionId}/complete-today`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark mission as completed for today.");
      }

      alert("Mission marked as completed for today.");
      onMissionUpdate(); // Refresh mission data
    } catch (error) {
      console.error(error);
      alert("Failed to complete mission.");
    } finally {
      setLoading(false);
    }
  };

  // Handler to delete the mission
  const handleDeleteMission = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this mission? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // Send a DELETE request to remove the mission
      const response = await fetch(`/api/user-missions/${missionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete mission.");
      }

      alert("Mission deleted successfully.");
      onMissionUpdate(); 
    } catch (error) {
      console.error(error);
      alert("Failed to delete mission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 flex space-x-2">
      {/* Button to mark today's mission as completed */}
      <button
        className={`px-4 py-2 rounded-lg transition ${
          isCompletedToday || status === "COMPLETED"
            ? "bg-green-500 text-white cursor-not-allowed shadow-[2px_2px_5px_rgba(0,0,0,0.3),_-2px_-2px_5px_rgba(255,255,255,0.5)]"
            : "bg-gray-300 text-gray-600 transition-all duration-200 ease-in-out hover:bg-green-500 hover:text-white shadow-inner hover:shadow-[2px_2px_5px_rgba(0,0,0,0.3),_-2px_-2px_5px_rgba(255,255,255,0.5)]"
        }`}
        onClick={handleCompleteToday}
        disabled={isCompletedToday || status === "COMPLETED" || loading}
      >
        {isCompletedToday || status === "COMPLETED"
          ? "Completed"
          : loading
          ? "Completing..."
          : "Complete Today"}
      </button>

      {/* Button to delete the mission */}
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-[2px_2px_5px_rgba(0,0,0,0.3),_-2px_-2px_5px_rgba(255,255,255,0.5)]"
        onClick={handleDeleteMission}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete Mission"}
      </button>
    </div>
  );
}
