@echo off
chcp 65001 >nul
title Kutay Aydemir - yerel test sunucusu
cd /d "%~dp0"
set "PYTHONIOENCODING=utf-8"

rem --- once "python" komutunu dene ---
where python >nul 2>nul
if %errorlevel%==0 (
    python "%~dp0sunucu.py"
    goto son
)

rem --- olmadi, Windows Python launcher'i dene ---
where py >nul 2>nul
if %errorlevel%==0 (
    py -3 "%~dp0sunucu.py"
    goto son
)

echo.
echo   Python bulunamadi.
echo.
echo   https://www.python.org/downloads/ adresinden kurabilirsin.
echo   Kurulum ekraninda "Add python.exe to PATH" kutusunu MUTLAKA isaretle,
echo   sonra bu dosyaya tekrar cift tikla.
echo.

:son
echo.
pause
