@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\electron\dist\electron.exe" (
  echo The Electron runtime is missing. Run Setup Sonoglow.cmd first.
  pause
  exit /b 1
)
set ELECTRON_RUN_AS_NODE=
start "Sonoglow" /b "node_modules\electron\dist\electron.exe" "%~dp0."
exit /b 0
