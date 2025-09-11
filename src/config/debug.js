// Debug Configuration
// Set to false to disable all debug output

export const DEBUG_CONFIG = {
  ENABLE_CONSOLE_LOGS: false,
  ENABLE_ALERTS: false,
  ENABLE_DEBUG_POPUPS: false,
  ENABLE_ERROR_LOGS: false,
  ENABLE_WARNINGS: false
};

// Override console methods when debug is disabled
if (!DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
  console.log = () => {};
  console.warn = () => {};
  console.debug = () => {};
}

if (!DEBUG_CONFIG.ENABLE_ERROR_LOGS) {
  console.error = () => {};
}

// Override Alert when debug is disabled
if (!DEBUG_CONFIG.ENABLE_ALERTS) {
  // This will be handled in individual components
}

export default DEBUG_CONFIG;
