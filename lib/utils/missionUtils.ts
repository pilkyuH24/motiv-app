//lib/utils/missionUtils.ts
import { format, parseISO } from "date-fns";
import { UserMission, Log, CalendarMission } from "@/types/mission";

export function prepareMissionForCalendar(mission: UserMission): CalendarMission {
  return {
    id: mission.id,
    missionTitle: mission.mission.title,
    startDate: mission.startDate,
    endDate: mission.endDate,
    repeatType: mission.repeatType,
    repeatDays: mission.repeatDays || [false, false, false, false, false, false, false],
  };
}

export function prepareLogsForCalendar(missions: UserMission[]): Log[] {
  return missions.flatMap((mission) =>
    mission.logs.map((log) => ({
      date: format(parseISO(log.date), "yyyy-MM-dd"),
      isDone: log.isDone,
      missionTitle: mission.mission.title,
    }))
  );
}