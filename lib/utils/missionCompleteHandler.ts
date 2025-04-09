import { prisma } from "@/lib/prisma";

/**
 * //Completes a user mission, awards points, and handles related rewards.
 * @param userMissionId ID of the user mission to complete
 */
export async function missionCompleteHandler(userMissionId: number) {
  //  Retrieve user mission details (including user and mission info)
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

  // Update the mission status to COMPLETED
  await prisma.userMission.update({
    where: { id: userMissionId },
    data: {
      status: "COMPLETED",
    },
  });
}