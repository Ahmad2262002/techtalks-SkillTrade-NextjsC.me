<<<<<<< HEAD:src/actions/auth.ts

"use server";

import { createClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  // Ensure this user exists in our Prisma Database
  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {},
    create: {
      id: user.id, // Keep IDs synced
      email: user.email,
      name: user.user_metadata.full_name || "New User",
      avatarUrl: user.user_metadata.avatar_url || null,
    },
  });

  return dbUser.id;
}
=======
"use server";

import { createClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cache } from "react";

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  // Ensure this user exists in our Prisma Database
  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {},
    create: {
      id: user.id, // Keep IDs synced
      email: user.email,
      name: user.user_metadata.full_name || "New User",
      avatarUrl: user.user_metadata.avatar_url || null,
    },
  });

  return dbUser.id;
});
>>>>>>> 51fea53e9c3c640ee6fd7ebf5d71800b1e27a859:skill-sync/src/actions/auth.ts
