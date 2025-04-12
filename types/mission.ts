// types/mission.ts

// ==========================
// 공통 유니언 타입 정의
// ==========================

// 미션의 상태: 진행 중, 완료, 실패
export type Status = "ONGOING" | "COMPLETED" | "FAILED";

// 반복 주기 타입: 매일, 매주, 매달 또는 사용자 정의
export type RepeatType = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

// 미션의 카테고리 유형
export type MissionType =
  | "HEALTH"
  | "SELF_DEVELOPMENT"
  | "PRODUCTIVITY"
  | "MINDFULNESS"
  | "RELATIONSHIP";


// ==========================
// 기본 미션 모델
// ==========================

// DB 기반 미션 엔티티 타입
export interface Mission { 
  id: number;
  title: string;
  description?: string;
  type: MissionType;
}


// ==========================
// 미션 생성/수정 폼에 사용되는 타입
// ==========================

// 사용자가 미션을 등록하거나 수정할 때 사용하는 Form 데이터 구조
export interface MissionFormData {
  startDate: string;
  endDate: string;
  durationMonths: number;       // 미션 기간 (월 기준)
  repeatType: RepeatType;
  repeatDays: boolean[];        // CUSTOM 반복일 경우: 요일별 반복 여부
}


// ==========================
// 개별 로그 단위 (달력 및 통계 용도)
// ==========================

// 특정 날짜에 대한 미션 수행 로그 - 주로 Calendar나 Dashboard 통계에서 사용
export interface Log {
  date: string;                 // 로그 날짜 (UTC)
  isDone: boolean;              // 해당 날짜에 미션 완료 여부
  missionId: number;            // 어떤 미션인지
  missionTitle: string;         // 미션 제목 (UI 렌더링용)
}


// ==========================
// 유저 미션 (API 응답 기반)
// ==========================

// 유저가 등록한 미션 및 진행 상황 - 서버에서 가져온 응답 기반 (Nested 형태 포함)
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
  repeatDays?: boolean[];         // CUSTOM 반복일 경우만 존재
  logs: {
    date: string;
    isDone: boolean;
  }[];                            // 일자별 수행 로그
}


// ==========================
// 캘린더 전용 미션 단순화 타입
// ==========================

// Calendar에서 렌더링할 미션 정보 (간략화된 구조)
export interface CalendarMission {
  id: number;                     // 내부 식별용
  missionId: number;             // 연결된 미션 ID
  missionTitle: string;
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  repeatDays: boolean[];
}


// ==========================
// 미션 API 응답 (단일 미션)
// ==========================

// /api/missions 등에서 단일 미션 응답용 타입
export interface MissionResponse {
  id: number;
  title: string;
  description?: string;
  rewardPoints?: number;         // 향후 확장 예정
  type: string;                  // MissionType (서버 응답이 문자열일 경우)
}
