import { UserMission, UserMissionLog } from "@prisma/client";
import { parseISO, isSameDay, subDays } from "date-fns";

/**
 * Calculate the number of consecutive days the user has completed at least one mission.
 */
export function calculateDailyStreak(logs: UserMissionLog[]): number {
  const doneDates = new Set(
    logs
      .filter((log) => log.isDone)
      .map((log) => parseISO(log.date.toISOString()).toISOString().slice(0, 10)) // "yyyy-MM-dd"
  );

  let streak = 0;
  let current = new Date();
  current.setUTCHours(0, 0, 0, 0);

  while (doneDates.has(current.toISOString().slice(0, 10))) {
    streak += 1;
    current = subDays(current, 1);
  }

  return streak;
}

/**
 * Count how many missions the user failed in the last 7 days.
 */
export function calculateLast7DaysFail(logs: UserMissionLog[]): number {
  const sevenDaysAgo = subDays(new Date(), 7);
  return logs.filter(
    (log) =>
      !log.isDone &&
      parseISO(log.date.toISOString()) >= sevenDaysAgo
  ).length;
}

/**
 * Check whether all active missions scheduled for today were completed.
 */
export function checkAllTodayMissionsDone(
  missions: (UserMission & { mission: { title: string } })[],
  logs: UserMissionLog[],
  today: Date
): boolean {
  const todayStr = today.toISOString().slice(0, 10);

  const todayLogs = logs.filter((log) =>
    log.date.toISOString().slice(0, 10) === todayStr
  );

  const missionIdsScheduledToday = new Set(todayLogs.map((log) => log.userMissionId));
  const allDone = todayLogs.every((log) => log.isDone);

  // Check if user had any mission scheduled for today, and all of them were completed
  return missionIdsScheduledToday.size > 0 && allDone;
}
