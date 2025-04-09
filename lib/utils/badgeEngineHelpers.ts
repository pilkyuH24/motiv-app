//lib/badgeEngineHelpers.ts
import { UserMissionLog } from "@prisma/client";

export function aggregateSuccessByDate(logs: UserMissionLog[]): Map<string, boolean> {
  const dateMap = new Map<string, boolean>();

  for (const log of logs) {
    const dateStr = log.date.toISOString().slice(0, 10);
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, log.isDone);
    } else {
      dateMap.set(dateStr, dateMap.get(dateStr)! || log.isDone);
    }
  }

  return dateMap;
}

// all complex conditions removed