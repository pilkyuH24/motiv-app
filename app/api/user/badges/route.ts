// /api/user/badges/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth-utils";

export async function GET() {
  const authResult = await authenticateUser();
  if (authResult.error) return authResult.error;

  const userId = authResult.user.id;

  try {
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });

    return NextResponse.json(
      badges.map((b) => ({
        title: b.badge.title,
        description: b.badge.description,
      }))
    );
  } catch (error) {
    console.error("[user-badges] Error fetching badges:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { message: "Failed to fetch badges", error: errorMessage },
      { status: 500 }
    );
  }
}