import { prisma } from "@/lib/prisma";

/**
 * Completes a user mission, awards points, and handles related rewards.
 * @param userMissionId ID of the user mission to complete
 */
export async function missionCompleteHandler(userMissionId: number) {
  // 1. Retrieve user mission details (including user and mission info)
  const userMission = await prisma.userMission.findUnique({
    where: { id: userMissionId },
    include: {
      user: true,
      mission: true,
    },
  });

  if (!userMission) {
    throw new Error(`UserMission ${userMissionId} not found`);
  }

  // Prevent duplicate completion
  if (userMission.status === "COMPLETED") {
    console.log(`[missionCompleteHandler] Mission ${userMissionId} already completed.`);
    return;
  }

  // 2. Update the mission status to COMPLETED
  await prisma.userMission.update({
    where: { id: userMissionId },
    data: {
      status: "COMPLETED",
    },
  });

  // 3. Award reward points to the user
  const rewardPoints = userMission.mission.rewardPoints ?? 0;

  await prisma.user.update({
    where: { id: userMission.userId },
    data: {
      points: {
        increment: rewardPoints,
      },
    },
  });

  // 4. Create a point transaction log
  await prisma.pointTransaction.create({
    data: {
      userId: userMission.userId,
      change: rewardPoints,
      reason: "MISSION_COMPLETE",
    },
  });

  console.log(`[missionCompleteHandler] Mission ${userMissionId} marked as COMPLETED with +${rewardPoints} points.`);

  // 5. TODO: Badge reward logic (implement if badge conditions are defined)
}
