//types/mission.ts
export interface Mission {
    id: number;
    title: string;
    description?: string;
    rewardPoints: number;
    type: string;
}

export interface MissionFormData {
    missionId: number;
    startDate: string;
    endDate: string;
    repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
    repeatDays: boolean[];
}

export interface Log {
    date: string;
    isDone: boolean;
    missionTitle: string;
}

export interface UserMission {
    id: number;
    mission: {
        title: string;
        description?: string;
    };
    status: "ONGOING" | "COMPLETED" | "FAILED";
    startDate: string;
    endDate: string;
    repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
    repeatDays?: boolean[];
    logs: { date: string; isDone: boolean }[];
}

export interface CalendarMission {
    id: number;
    missionTitle: string;
    startDate: string;
    endDate: string;
    repeatType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
    repeatDays: boolean[];
}

