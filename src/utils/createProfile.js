import { supabase } from './supabaseClient';

export async function createProfile(user) {
  if (!user) return;

  const { id, email, user_metadata } = user;

  const newProfile = {
    id,
    email: email || '',
    name: user_metadata?.name || 'Unnamed',
    avatar_url: user_metadata?.avatar_url || '',
    bio: '',
  };

  console.log("📄 Creating or upserting profile with data:", newProfile);

  // 👇 This is the key line replacing the .insert()
  const { error } = await supabase
    .from('profiles')
    .upsert(newProfile, { onConflict: 'id' });

  if (error) {
    console.error("❌ Error creating or updating profile:", error);
  } else {
    console.log("✅ Profile created or updated successfully!");
  }
}
