import { UserMissionLog } from "@prisma/client";

export function aggregateSuccessByDate(logs: UserMissionLog[]): Map<string, boolean> {
  const map = new Map<string, boolean>();

  for (const log of logs) {
    const dateStr = log.date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
    if (!map.has(dateStr)) {
      map.set(dateStr, log.isDone);
    } else {
      map.set(dateStr, map.get(dateStr)! || log.isDone); // 하나라도 true면 true
    }
  }

  return map;
}
