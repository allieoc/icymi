import { supabase } from "./supabaseClient";

export const logView = async ({ userId, content }) => {
  if (!userId || !content?.id) {
    console.warn("⛔ logView aborted — missing userId or content.id", { userId, content });
    return;
  }

  const rowId = `${userId}_${content.id}`; // 👈 create a unique ID per user-content combo

  console.log("📤 Deleting any previous view of:", rowId);

  const { error: deleteError } = await supabase
    .from("recently_viewed")
    .delete()
    .eq("id", rowId); // ✅ delete by the real primary key

  if (deleteError) {
    console.error("⚠️ Delete failed:", deleteError.message, deleteError.details);
  }

  console.log("📥 Inserting view of:", rowId);

  const { error } = await supabase.from("recently_viewed").insert([
    {
      id: rowId, // ✅ manually set the primary key
      user_id: userId,
      content_id: content.id,
      content_type: content.content_type,
      title: content.title,
      url: content.link,
      image_url: content.image_url || "",
      source: content.source || "",
    },
  ]);

  if (error) {
    console.error("❌ Supabase insert failed:", error.message, error.details);
  } else {
    console.log("✅ View logged successfully");
  }
};
