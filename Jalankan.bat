@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1"
if errorlevel 1 (
  echo.
  echo Gagal menjalankan aplikasi. Tekan tombol apa saja untuk menutup.
  pause >nul
)
endlocal