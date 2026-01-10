"use server";

import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

import { getCurrentUserId as getUserId } from "@/lib/auth";

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
}

export async function getCurrentUserId() {
    return getUserId();
}

