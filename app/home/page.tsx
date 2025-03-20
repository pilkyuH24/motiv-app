// 'use client'

import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from "../../lib/prisma";
import { User } from "../user";
import { LoginButton, LogoutButton } from "../components/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findFirst({
    where: {
      email: "test@test.com"
    }
  });
  return (
    <>
      <LoginButton />
      <LogoutButton />
      <div>Hello, {user?.name}</div>

      <h2>Server Session</h2>
      <pre>{JSON.stringify(session)}</pre>

      <h2>Client Call</h2>
      <User />
    </>
  );
}