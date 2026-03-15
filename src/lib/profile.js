import { supabase } from "./supabase";

const PRIMARY_TABLE = "profiles";
const LEGACY_TABLE = "User Data";

function isMissingTableError(error) {
  return error?.code === "PGRST205" || /Could not find the table/i.test(error?.message || "");
}

function normalizeProfile(row, source) {
  if (!row) return null;

  if (source === PRIMARY_TABLE) {
    return {
      userId: row.user_id,
      name: row.name,
      phone: row.phone ? String(row.phone) : "",
      email: row.email,
    };
  }

  return {
    userId: null,
    name: row.Name,
    phone: row.contact_number ? String(row.contact_number) : "",
    email: row.Email_id,
  };
}

async function readFromPrimary(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from(PRIMARY_TABLE)
    .select("user_id,name,phone,email")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return normalizeProfile(data, PRIMARY_TABLE);
}

async function readFromLegacy(email) {
  if (!email) return null;

  const { data, error } = await supabase
    .from(LEGACY_TABLE)
    .select("Name,contact_number,Email_id")
    .eq("Email_id", email)
    .maybeSingle();

  if (error) throw error;
  return normalizeProfile(data, LEGACY_TABLE);
}

export async function getUserProfile({ userId, email }) {
  if (!userId && !email) return null;

  try {
    if (userId) {
      return await readFromPrimary(userId);
    }
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
  }

  try {
    return await readFromLegacy(email);
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
  }

  return null;
}

async function saveToPrimary({ userId, email, name, phone }) {
  const payload = {
    user_id: userId,
    email,
    name,
    phone,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from(PRIMARY_TABLE).upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}

async function saveToLegacy({ email, name, phone }) {
  if (!email) {
    throw new Error("Missing email for profile save.");
  }

  const payload = {
    Name: name,
    Email_id: email,
    contact_number: phone ? Number(phone) : null,
  };

  const { data: updatedRows, error: updateError } = await supabase
    .from(LEGACY_TABLE)
    .update(payload)
    .eq("Email_id", email)
    .select("Email_id")
    .limit(1);

  if (updateError) throw updateError;
  if (updatedRows?.length) return;

  const { error: insertError } = await supabase.from(LEGACY_TABLE).insert(payload);
  if (insertError) throw insertError;
}

export async function saveUserProfile(profileInput) {
  try {
    await saveToPrimary(profileInput);
    return;
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
  }

  await saveToLegacy(profileInput);
}
