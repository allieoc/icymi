import { supabase } from './supabaseClient';


export async function createProfile(user) {

  if (!user) return;

  const { id, email, user_metadata } = user;

  const newProfile = {
    id,
    email: email || '',
    name: user_metadata?.name || 'Unnamed',
  };

  // 👇 This is the key line replacing the .insert()
  const { error } = await supabase
    .from('profiles')
    .upsert(newProfile, { onConflict: 'id' }, {returning: 'minimal'});

  if (error) {
    console.error("❌ Error creating or updating profile:", error);
  } 
}
