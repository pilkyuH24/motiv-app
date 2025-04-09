// 인증된 사용자 정보 확인, 미션 ID 추출, 그리고 미션 소유권 검증 로직을 캡슐화로 API 핸들러에서 재사용
// auth-utils.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Authenticate the current session and fetch user information
 * @returns The user object or an error response
 */
export async function authenticateUser() {
  // Check session
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { 
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    };
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return {
      error: NextResponse.json({ message: "User not found" }, { status: 404 })
    };
  }

  return { user };
}

/**
 * Extract mission ID from URL
 * @param url Request URL
 * @param position Where to extract the ID from ('last' or 'secondLast')
 * @returns Mission ID or an error response
 */
export function extractMissionId(url: URL, position: 'last' | 'secondLast' = 'last') {
  let missionId: number;
  
  if (position === 'last') {
    missionId = parseInt(url.pathname.split("/").pop() || "");
  } else {
    // Used for routes like /missions/{id}/logs
    missionId = parseInt(url.pathname.split("/").slice(-2, -1)[0]);
  }

  if (isNaN(missionId)) {
    return {
      error: NextResponse.json({ message: "Invalid mission ID" }, { status: 400 })
    };
  }

  return { missionId };
}

/**
 * Check if the mission belongs to the given user
 * @param missionId Mission ID
 * @param userId User ID
 * @param includeOptions Prisma include options (optional)
 * @returns The userMission or an error response
 */
export async function verifyMissionOwnership(missionId: number, userId: number, includeOptions = {}) {
  // Find the mission
  const userMission = await prisma.userMission.findUnique({
    where: { id: missionId },
    include: includeOptions,
  });

  if (!userMission) {
    return {
      error: NextResponse.json({ message: "Mission not found" }, { status: 404 })
    };
  }

  // Check ownership
  if (userMission.userId !== userId) {
    return {
      error: NextResponse.json(
        { message: "You don't have permission to access this mission" }, 
        { status: 403 }
      )
    };
  }

  return { userMission };
}
