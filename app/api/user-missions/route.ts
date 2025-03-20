import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { addDays, addWeeks, addMonths, isBefore } from "date-fns";

// Handles GET requests to retrieve all user missions
export async function GET() {
  console.log("[user-missions] API called...");

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error("[user-missions] User not found:", session.user.email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // console.log("[user-missions] Found user:", user.id);

    const userMissions = await prisma.userMission.findMany({
      where: { userId: user.id },
      include: {
        mission: {
          select: { title: true, description: true },
        },
        logs: {
          select: {
            date: true,
            isDone: true,
          },
        },
      },
    });

    // Ensures `repeatDays` is always an array of booleans
    const formattedMissions = userMissions.map((mission) => ({
      ...mission,
      repeatDays: mission.repeatDays ?? [false, false, false, false, false, false, false],
    }));

    console.log("[user-missions] Missions fetched:", formattedMissions.length);

    return NextResponse.json(formattedMissions, { status: 200 });
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

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { missionId, startDate, endDate, repeatType, repeatDays } = await req.json();
  // console.log("Received data:", { missionId, startDate, endDate, repeatType, repeatDays });

  // Ensures all required fields are present
  if (!missionId || !startDate || !endDate || !repeatType) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }


    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999); // Ensures `endDate` is set to the end of the day

    // Creates a new `userMission` entry
    const newMission = await prisma.userMission.create({
      data: {
        userId: user.id,
        missionId,
        status: "ONGOING",
        startDate: start,
        endDate: end,
        repeatType,
        repeatDays: repeatType === "CUSTOM" ? repeatDays : [false, false, false, false, false, false, false], // Defaults to `false` for all days
      },
    });

    // Automatically generates `userMissionLog` entries based on repeat type
    const logs = [];
    let currentDate = new Date(start);

    while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
      const dayIndex = new Date(currentDate).getUTCDay(); // Gets the index of the day (0 = Sunday, 6 = Saturday)

      if (repeatType === "DAILY") {
        logs.push({ userMissionId: newMission.id, date: new Date(currentDate), isDone: false });
        currentDate = addDays(currentDate, 1);
      } else if (repeatType === "WEEKLY") {
        logs.push({ userMissionId: newMission.id, date: new Date(currentDate), isDone: false });
        currentDate = addWeeks(currentDate, 1);
      } else if (repeatType === "MONTHLY") {
        logs.push({ userMissionId: newMission.id, date: new Date(currentDate), isDone: false });
        currentDate = addMonths(currentDate, 1);
      } else if (repeatType === "CUSTOM" && repeatDays[dayIndex]) {
        logs.push({ userMissionId: newMission.id, date: new Date(currentDate), isDone: false });
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

    return NextResponse.json(
      { message: "Mission started successfully", userMission: newMission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred while starting mission:", error);
    return NextResponse.json({ message: "Failed to start mission" }, { status: 500 });
  }
}
