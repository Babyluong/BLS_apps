// Debug Override - Load this first to disable all debug output
// This file should be imported at the very top of your main App.js

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};

// Override console methods to disable debug output
console.log = () => {};
console.warn = () => {};
console.debug = () => {};
console.error = () => {};

// Override Alert globally
const originalAlert = global.Alert;
if (originalAlert) {
  global.Alert = {
    alert: () => {} // Disable all alerts
  };
}

// Override window.alert globally
const originalWindowAlert = window.alert;
window.alert = () => {}; // Disable all window alerts

// Export original methods in case you need them
export { originalConsole, originalAlert };
