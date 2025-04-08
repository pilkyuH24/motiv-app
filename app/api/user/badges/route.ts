// /api/user/badges/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

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
}
