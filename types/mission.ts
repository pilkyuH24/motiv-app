// types/mission.ts

export type Status = "ONGOING" | "COMPLETED" | "FAILED";
export type RepeatType = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
export type MissionType =
  | "HEALTH"
  | "SELF_DEVELOPMENT"
  | "PRODUCTIVITY"
  | "MINDFULNESS"
  | "RELATIONSHIP";

// 기본 미션 타입 (DB 기반)
export interface Mission { 
  id: number;
  title: string;
  description?: string;
  type: MissionType;
}

// 미션 등록/수정 시 사용하는 폼 타입
export interface MissionFormData {
  startDate: string;
  endDate: string;
  durationMonths: number;
  repeatType: RepeatType;
  repeatDays: boolean[];
}

// 로그 단위 정보 (달력이나 통계 용도)
export interface Log {
  date: string;             
  isDone: boolean;
  missionId: number;       
  missionTitle: string;    
}

// 사용자의 미션 정보 (백엔드 응답 기반)
export interface UserMission {
  id: number;
  mission: {
    title: string;
    description?: string;
  };
  status: Status;
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  repeatDays?: boolean[]; // CUSTOM일 경우만 존재
  logs: {
    date: string;
    isDone: boolean;
  }[];
}

// 달력 렌더링을 위한 간소화된 미션 타입
export interface CalendarMission {
  id: number;
  missionId: number;
  missionTitle: string;
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  repeatDays: boolean[];
}

export interface MissionResponse {
    id: number;
    title: string;
    description?: string;
    rewardPoints?: number;
    type: string; 
  }