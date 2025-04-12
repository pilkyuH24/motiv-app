//components/dashboard/MissionAction.tsx
"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import BadgeModal from "./BadgeModal"; 
import { Badge } from "@/types/badge";


interface MissionActionsProps {
  missionId: number;
  logs: { date: string; isDone: boolean }[];
  status: "ONGOING" | "COMPLETED" | "FAILED";
  onMissionUpdate: () => void;        // Callback function to refresh mission data
  onOptimisticUpdate?: (type: "complete" | "delete", missionId: number) => void;
}

// Component handling mission actions such as marking completion and deletion
export default function MissionActions({
  missionId,
  logs,
  status,
  onMissionUpdate,
  onOptimisticUpdate,
}: MissionActionsProps) {
  const [completeLoading, setCompleteLoading] = useState(false); 
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

  const today = new Date().toISOString().slice(0, 10); // UTC

  // Find today's log entry and check if the mission is completed
  const todayLog = logs.find(
    (log) => log.date.slice(0, 10) === today
  );
  const isCompletedToday = todayLog ? todayLog.isDone : false;

  // Handler to mark today's mission as completed
  const handleCompleteToday = async () => {
    if (isCompletedToday) return; 
 
    // Optimistically update
    onOptimisticUpdate?.("complete", missionId);

    setCompleteLoading(true);
    try {
      const response = await toast.promise(
        fetch(`/api/user-missions/${missionId}/complete-today`, {
          method: "POST",
        }),
        {
          loading: "Completing mission...",
          success: "Mission marked as completed for today!",
          error: "Failed to complete mission.",
        }
      );

      const result = await response.json();

      // If badge earned, show modal
      if (result.isCompleted && Array.isArray(result.newBadges) && result.newBadges.length > 0) {
        setEarnedBadges(result.newBadges);
        setShowBadgeModal(true);
      }

      // onMissionUpdate(); // Optimistic change
    } catch (error) {
      console.error(error);
      onMissionUpdate();
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

    // Optimistic removal
    onOptimisticUpdate?.("delete", missionId);

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

      // onMissionUpdate(); // Optimistic change
    } catch (error) {
      console.error(error);
      onMissionUpdate();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBadgeModalClose = async () => {
    setShowBadgeModal(false);
    setTimeout(() => {
      onMissionUpdate();
    }, 300);
  };

  return (
    <>
      <div className="mt-2 flex space-x-2">
      {/* Button to mark today's mission as completed */}
        <button
          className={`px-4 py-2 rounded-lg transition ${
            isCompletedToday || status === "COMPLETED"
              ? "bg-green-500 text-white cursor-not-allowed shadow"
              : "bg-gray-300 text-gray-600 hover:bg-green-500 hover:text-white"
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
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={handleDeleteMission}
          disabled={deleteLoading}
        >
          {deleteLoading ? "Deleting..." : "Delete Mission"}
        </button>
      </div>

      {showBadgeModal && (
        <BadgeModal badges={earnedBadges} onClose={handleBadgeModalClose} />
      )}
    </>
  );
}