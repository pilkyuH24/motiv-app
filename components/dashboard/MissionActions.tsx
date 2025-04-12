//components/dashboard/MissionAction.tsx
"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";

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
  const [completeLoading, setCompleteLoading] = useState(false); 
  const [deleteLoading, setDeleteLoading] = useState(false);

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

    setCompleteLoading(true);
    try {
      await toast.promise(
        fetch(`/api/user-missions/${missionId}/complete-today`, {
          method: "POST",
        }),
        {
          loading: "Completing mission...",
          success: "Mission marked as completed for today!",
          error: "Failed to complete mission.",
        }
      );

      onMissionUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setCompleteLoading(false);
    }
  };

  // Handler to delete the mission
  const handleDeleteMission = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this mission? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await toast.promise(
        fetch(`/api/user-missions/${missionId}`, {
          method: "DELETE",
        }),
        {
          loading: "Deleting mission...",
          success: "Mission deleted successfully.",
          error: "Failed to delete mission.",
        }
      );

      onMissionUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
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
        disabled={isCompletedToday || status === "COMPLETED" || completeLoading}
      >
        {isCompletedToday || status === "COMPLETED"
          ? "Completed"
          : completeLoading
          ? "Completing..."
          : "Complete Today"}
      </button>

      {/* Button to delete the mission */}
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-[2px_2px_5px_rgba(0,0,0,0.3),_-2px_-2px_5px_rgba(255,255,255,0.5)]"
        onClick={handleDeleteMission}
        disabled={deleteLoading}
      >
        {deleteLoading ? "Deleting..." : "Delete Mission"}
      </button>
    </div>
  );
}