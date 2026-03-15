import { supabase } from "./supabase";

export async function getUserProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,name,phone,email")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveUserProfile({ userId, email, name, phone }) {
  const payload = {
    user_id: userId,
    email,
    name,
    phone,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });

  if (error) {
    throw error;
  }
}
