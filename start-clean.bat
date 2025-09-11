@echo off
echo Starting BLS App in Clean Mode...
echo No debug logs, no popups, clean interface
echo.

REM Set environment variables for cleaner output
set EXPO_NO_DEBUG=1
set EXPO_NO_LOGS=1
set NODE_ENV=production

REM Start Expo in clean mode
npx expo start --web --no-dev --minify --clear

pause
