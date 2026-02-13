@echo off
REM Script para iniciar Orchard Timesheet Pro en Windows
REM Este script abre la aplicación en el navegador por defecto

echo ========================================
echo   Orchard Timesheet Pro - Inicio Rápido
echo ========================================
echo.

REM Obtener la ruta del script
set "CURRENT_DIR=%~dp0"

REM Cambiar directorio al proyecto
cd /d "%CURRENT_DIR%"

echo Iniciando aplicación...
echo.

REM Opción 1: Abrir con http server de Python si está instalado
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Iniciando servidor HTTP con Python en puerto 8000...
    echo La aplicación se abrirá automáticamente en tu navegador.
    echo.
    echo Para detener el servidor presiona Ctrl+C
    echo.
    
    REM Abrir navegador con página de verificación
    start http://localhost:8000/VERIFICACION.html
    
    REM Iniciar servidor
    python -m http.server 8000
) else (
    REM Opción 2: Abrir directamente con explorer (si Python no está disponible)
    echo Python no está instalado. Abriendo página de bienvenida...
    echo.
    
    REM Abrir directamente con el navegador por defecto
    start "" "%CURRENT_DIR%START.html"
)

pause

