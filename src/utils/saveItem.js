import { supabase } from "./supabaseClient";

export const saveItem = async ({ user_id, item }) => {
  const { data, error } = await supabase.from("saved_items").insert([
    {
      user_id,
      item_id: item.id,
      item_type: item.type,
      title: item.title,
      url: item.url,
      image_url: item.image_url,
      source: item.source,
    },
  ]);

  if (error) {
    console.error("Save error:", error.message);
  } else {
    console.log("Saved item:", data);
  }
};