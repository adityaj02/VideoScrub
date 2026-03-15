import { supabase } from "./supabase";

const PROFILES_TABLE = "profiles";

function normalizeProfile(row) {
  if (!row) return null;

  return {
    userId: row.user_id,
    name: row.name || "",
    phone: row.phone ? String(row.phone) : "",
    email: row.email || "",
    location: row.location || "",
  };
}

export async function getUserProfile({ userId }) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select("user_id,name,phone,email,location")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return normalizeProfile(data);
}

export async function saveUserProfile({ userId, email, name, phone, location }) {
  if (!userId) {
    throw new Error("Missing userId for profile save.");
  }

  const payload = {
    user_id: userId,
    email: email || null,
    name: name || null,
    phone: phone || null,
    location: location || null,
  };

  const { error } = await supabase.from(PROFILES_TABLE).upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}
