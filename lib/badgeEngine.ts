import { prisma } from "@/lib/prisma";
import { Badge } from "@prisma/client";
import {
    calculateDailyStreak,
    calculateLast7DaysFail,
    checkAllTodayMissionsDone,
} from "./badgeEngineHelpers";


// Parse and evaluate a badge condition
async function evaluateBadgeCondition(userId: number, badge: Badge, stats: Record<string, any>): Promise<boolean> {
    const condition = JSON.parse(badge.condition);

    for (const [key, value] of Object.entries(condition)) {
        const actual = stats[key];

        if (typeof value === "boolean") {
            if (actual !== value) return false;
        } else if (typeof value === "string") {
            const match = value.match(/(>=|<=|==|>|<)\s*(\d+)/);
            if (!match) return false;

            const [, op, thresholdStr] = match;
            const threshold = parseInt(thresholdStr);

            switch (op) {
                case ">=": if (!(actual >= threshold)) return false; break;
                case "<=": if (!(actual <= threshold)) return false; break;
                case "==": if (!(actual === threshold)) return false; break;
                case ">": if (!(actual > threshold)) return false; break;
                case "<": if (!(actual < threshold)) return false; break;
            }
        } else {
            return false;
        }
    }

    return true;
}

// Load all relevant user stats needed for badge evaluation
async function getUserStats(userId: number) {
    const [missions, logs, user] = await Promise.all([
        prisma.userMission.findMany({ where: { userId }, include: { mission: true } }),
        prisma.userMissionLog.findMany({ where: { userMission: { userId } }, orderBy: { date: "desc" } }),
        prisma.user.findUnique({ where: { id: userId } }),
    ]);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const completedMissions = missions.filter((m) => m.status === "COMPLETED");

    const stats: Record<string, any> = {
        missions_completed: completedMissions.length,
        missions_registered: missions.length,
        total_points: user?.points ?? 0,
        daily_streak: calculateDailyStreak(logs),
        last_7_days_fail: calculateLast7DaysFail(logs),
        missions_today_all_done: checkAllTodayMissionsDone(missions, logs, today),
        custom_mission_completed: completedMissions.filter((m) => m.repeatType === "CUSTOM").length,
    };

    const types = ["HEALTH", "SELF_DEVELOPMENT", "PRODUCTIVITY", "MINDFULNESS", "RELATIONSHIP"];
    for (const type of types) {
        stats[`mission_type_${type}`] = completedMissions.filter(
            (m) => m.mission.type === type
        ).length;
    }


    return stats;
}

// Evaluate and award all eligible badges to a user
export async function evaluateAllBadgesForUser(userId: number) {
    const [badges, existing] = await Promise.all([
        prisma.badge.findMany(),
        prisma.userBadge.findMany({ where: { userId } }),
    ]);
    const owned = new Set(existing.map((b) => b.badgeId));
    const stats = await getUserStats(userId);
    const awarded: Badge[] = [];

    for (const badge of badges) {
        if (owned.has(badge.id)) continue;

        const eligible = await evaluateBadgeCondition(userId, badge, stats);
        if (eligible) {
            await prisma.userBadge.create({
                data: { userId, badgeId: badge.id },
            });
            awarded.push(badge);
        }
    }

    return awarded;
}
