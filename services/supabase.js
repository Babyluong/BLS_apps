// services/supabase.js — React Native/Expo Supabase client (polyfills fixed)

// ---- Polyfills (ORDER IS CRITICAL) ----
// These MUST be loaded before any other imports that use URL functionality

// 1. URL Polyfill - MUST be first (most critical)
if (typeof global !== 'undefined' && !global.URL) {
  try {
    require("react-native-url-polyfill/auto");
    console.log("✓ react-native-url-polyfill loaded via auto import");
  } catch (error) {
    console.warn("⚠ Auto URL polyfill failed, trying manual setup:", error.message);
    
    try {
      // Manual polyfill setup
      const { URL, URLSearchParams } = require("react-native-url-polyfill");
      
      // Set global URL and URLSearchParams
      global.URL = URL;
      global.URLSearchParams = URLSearchParams;
      
      // Set on window for web compatibility
      if (typeof window !== 'undefined') {
        window.URL = URL;
        window.URLSearchParams = URLSearchParams;
      }
      
      console.log("✓ react-native-url-polyfill loaded manually");
    } catch (manualError) {
      console.error("❌ URL polyfill setup failed:", manualError.message);
      throw new Error("Failed to load URL polyfill - this is required for Supabase");
    }
  }
}

// 2. Text Encoding Polyfill
try {
  require("text-encoding-polyfill");
  console.log("✓ text-encoding-polyfill loaded");
} catch (error) {
  console.warn("⚠ text-encoding-polyfill failed to load:", error.message);
}

// 3. Random Values Polyfill
try {
  require("react-native-get-random-values");
  console.log("✓ react-native-get-random-values loaded");
} catch (error) {
  console.warn("⚠ react-native-get-random-values failed to load:", error.message);
}

// Supabase
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Optional: AsyncStorage for persistent sessions (fallbacks to in-memory if not installed)
let AsyncStorage;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch { /* not installed — sessions will be in-memory */ }

// Prefer env vars (Expo: app.json -> expo.extra or .env)
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

// Build auth options (only set storage if we have AsyncStorage)
const auth = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: false, // RN/Expo recommended
};
if (AsyncStorage) auth.storage = AsyncStorage;

// Create the client
const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth,
  global: {
    headers: { "X-Client-Info": "bls-app/1.0" },
  },
});

// Warn if placeholders somehow slip in
if (
  (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) &&
  (SUPABASE_URL.includes("<YOUR_SUPABASE_URL>") || SUPABASE_ANON_KEY.includes("<YOUR_SUPABASE_ANON_KEY>"))
) {
  console.warn(
    "[Supabase] Not configured — set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY or edit services/supabase.js with your project keys."
  );
}

export default supabase;
export { supabase };
