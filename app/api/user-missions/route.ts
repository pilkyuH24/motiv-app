//app/api/user-missions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, addWeeks, addMonths, isBefore } from "date-fns";
import { missionCompleteHandler } from "@/lib/utils/missionCompleteHandler";
import { invalidateUserMissionsCache, getCache, setCache } from "@/lib/cache/serverCache";
import { authenticateUser } from "@/lib/auth-utils";

// Handles GET requests to retrieve all user missions
export async function GET(request: Request) {
  const authResult = await authenticateUser();
  if (authResult.error) return authResult.error;

  const user = authResult.user;

  try {
    // Extract query parameters from URL
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    const cacheKey = `missions-${user.id}`;

    // Check for cached data unless forced to refresh
    if (!forceRefresh) {
      const cachedResult = getCache(cacheKey);

      // Return cached data if valid
      if (cachedResult) {
        const { data, timestamp } = cachedResult;
        console.log("[user-missions] Returning cached data");

        // HTTP 응답에 포함되는 캐시 관련 헤더 설명:
        // 'Cache-Control': 'max-age=60' → 브라우저는 이 응답을 60초 동안 캐시하고, 그 이후에 다시 요청함
        // 'X-Cache': 'HIT' → 현재 응답이 캐시된 데이터에서 왔음을 표시
        // 'ETag': timestamp → 데이터의 버전 정보를 담은 헤더로, 이후 조건부 요청(If-None-Match)에 사용됨
        return NextResponse.json(data, {
          status: 200,
          headers: {
            'Cache-Control': 'max-age=60',
            'X-Cache': 'HIT',
            'ETag': `"${timestamp}"`,
          },
        });
      }
    }

    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    // Fetch all missions for the user, including mission data and logs
    const userMissions = await prisma.userMission.findMany({
      where: { userId: user.id },
      include: {
        mission: {
          select: { title: true, description: true, type: true },
        },
        logs: {
          select: {
            date: true,
            isDone: true,
          },
        },
      },
    });

    // Filter out expired missions that are still marked as ongoing
    const expiredMissions = userMissions.filter(
      mission =>
        mission.status === "ONGOING" &&
        mission.endDate &&
        isBefore(new Date(mission.endDate.setUTCHours?.(0, 0, 0, 0) ?? mission.endDate), todayUTC)
    );

    // Handle only if there are expired missions
    if (expiredMissions.length > 0) {
      console.log(`[user-missions] Found ${expiredMissions.length} expired missions to complete`);

      const missionIds = expiredMissions.map(mission => mission.id);

      // Trigger auto-completion in the background
      const completeMissionsPromise = Promise.all(
        missionIds.map(id => missionCompleteHandler(id))
      );

      // Do not await to keep response fast
      completeMissionsPromise.catch(error => {
        console.error("[user-missions] Error batch completing missions:", error);
        // Invalidate cache on failure
        invalidateUserMissionsCache(user.id);
      });

      // 미션 상태를 DB 업데이트 완료 여부와 상관없이 클라이언트에 즉시 반영하기 위해,
      // 응답 직전에 메모리 상의 mission 객체의 status를 바꾸는 처리입니다.
      // 이는 사용자 경험을 빠르게 하기 위함이며, 실제 DB 반영은 백그라운드에서 처리됩니다.
      for (const mission of userMissions) {
        if (missionIds.includes(mission.id)) {
          mission.status = "COMPLETED";
        }
      }
    }

    const formattedMissions = userMissions.map((mission) => ({
      ...mission,
      repeatDays: mission.repeatDays ?? [false, false, false, false, false, false, false],
    }));

    console.log("[user-missions] Missions fetched:", formattedMissions.length);

    const timestamp = setCache(cacheKey, formattedMissions);

    // Send response with cache headers
    return NextResponse.json(formattedMissions, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Cache': 'MISS',
        'ETag': `"${timestamp}"`,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[user-missions] Error fetching user missions:", errorMessage);

    return NextResponse.json(
      { message: "Failed to fetch user missions", error: errorMessage },
      { status: 500 }
    );
  }
}

// Handles POST requests to add a new mission
export async function POST(req: Request) {
  console.log("POST request received");

  const authResult = await authenticateUser();
  if (authResult.error) return authResult.error;

  const user = authResult.user;

  try {
    const { missionId, startDate, endDate, repeatType, repeatDays } = await req.json();

    // Validates required fields
    if (!missionId || !startDate || !endDate || !repeatType) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours?.(0, 0, 0, 0);

    // Check for duplicate mission (regardless of period)
    const existing = await prisma.userMission.findFirst({
      where: {
        userId: user.id,
        missionId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You already have this mission." },
        {
          status: 409, // Conflict
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    // Create user mission
    const newMission = await prisma.userMission.create({
      data: {
        userId: user.id,
        missionId,
        status: "ONGOING",
        startDate: start,
        endDate: end,
        repeatType,
        repeatDays: repeatType === "CUSTOM" ? repeatDays : [false, false, false, false, false, false, false],
      },
    });

    // Generate mission logs based on repeat type
    const logs = [];
    let currentDate = new Date(start);

    while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
      const dayIndex = currentDate.getUTCDay();
      const logDate = new Date(currentDate);
      logDate.setUTCHours(0, 0, 0, 0);

      if (repeatType === "DAILY") {
        logs.push({ userMissionId: newMission.id, date: logDate, isDone: false });
        currentDate = addDays(currentDate, 1);
      } else if (repeatType === "WEEKLY") {
        logs.push({ userMissionId: newMission.id, date: logDate, isDone: false });
        currentDate = addWeeks(currentDate, 1);
      } else if (repeatType === "MONTHLY") {
        logs.push({ userMissionId: newMission.id, date: logDate, isDone: false });
        currentDate = addMonths(currentDate, 1);
      } else if (repeatType === "CUSTOM" && repeatDays[dayIndex]) {
        logs.push({ userMissionId: newMission.id, date: logDate, isDone: false });
        currentDate = addDays(currentDate, 1);
      } else {
        currentDate = addDays(currentDate, 1);
      }
    }

    if (logs.length > 0) {
      await prisma.userMissionLog.createMany({
        data: logs,
      });
    }

    // Invalidate cache
    invalidateUserMissionsCache(user.id);

    return NextResponse.json(
      {
        message: "Mission started successfully",
        userMission: newMission
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error("Error occurred while starting mission:", error);
    return NextResponse.json({ message: "Failed to start mission" }, { status: 500 });
  }
}
