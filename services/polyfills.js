// services/polyfills.js — Critical polyfills that must load first
// This file should be imported at the very top of your app entry point

// 1. URL Polyfill - MUST be first (most critical for Supabase)
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

console.log("✓ All critical polyfills loaded successfully");