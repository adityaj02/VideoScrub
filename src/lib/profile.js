import { getProfile, updateProfile } from "./api";

/**
 * Get user profile from MongoDB (via Express API).
 * Replaces the old Supabase profiles table query.
 */
export async function getUserProfile() {
  try {
    const profile = await getProfile();
    return {
      userId: profile.id || profile._id,
      name: profile.name || "",
      phone: profile.phone || "",
      email: profile.email || "",
      location: profile.location || "",
      avatar: profile.avatar || "",
    };
  } catch {
    return null;
  }
}

/**
 * Save/update user profile in MongoDB.
 * Replaces the old Supabase profiles upsert.
 */
export async function saveUserProfile({ name, phone, location }) {
  await updateProfile({ name, phone, location });
}
