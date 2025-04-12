//lib/utils/missionEvents.ts
// 미션 데이터를 업데이트하거나 캐시를 무효화할 때,컴포넌트 간 동기화를 도와주는 유틸 함수들
"use client";

export function notifyMissionUpdated() {
  /**
   * Triggers a global event to notify other components
   * that a mission has been added, updated, or deleted.
   */

  // Create and dispatch a custom event
  const event = new CustomEvent("mission-updated");
  window.dispatchEvent(event);

  // Optionally update a timestamp in localStorage
  const currentTime = Date.now();
  localStorage.setItem("user-missions-timestamp", currentTime.toString());
}

export function invalidateMissionsCache() {
  /**
   * Clears cached mission data in localStorage.
   * Useful when forcing a refresh after an update.
   */
  localStorage.removeItem("user-missions-data");
  localStorage.removeItem("user-missions-timestamp");

  notifyMissionUpdated(); // Need?
}
