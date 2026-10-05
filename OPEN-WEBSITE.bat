@echo off
title Cindy's Cake House
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:4180/index.html
  python -m http.server 4180
) else (
  start "" "%~dp0index.html"
)
