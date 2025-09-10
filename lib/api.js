// lib/api.js
import supabase from "../services/supabase";

export async function logEvent({ actor = "ADMIN", action, detail }) {
  try {
    await supabase.from("activity_logs").insert([{ actor, action, detail }]);
  } catch (e) {
    console.warn("[logEvent] insert failed:", e?.message);
  }
}

export async function fetchLogs({ limit = 300 } = {}) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("ts", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchResults({ limit = 5000 } = {}) {
  const { data, error } = await supabase
    .from("bls_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
