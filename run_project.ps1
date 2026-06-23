# NOVAMARQUET-AI Proyecto Final - Lanzador de Servidores para Windows
Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      NOVAMARQUET-AI - COMPONENTE E-COMMERCE INDUSTRIAL   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Check virtual environment
if (-not (Test-Path ".\venv")) {
    Write-Host "[X] No se encontr el entorno virtual 'venv'. Ejecute 'python -m venv venv' e instale dependencias." -ForegroundColor Red
    Exit
}

# 1. Start Django Backend Server in a new window (listening on 0.0.0.0 to accept local network connections)
Write-Host "[1/2] Levantando Django REST API Server en segundo plano (Red Local)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Clear-Host; Write-Host '--- DJANGO REST API CONSOLE ---' -ForegroundColor Cyan; Write-Host 'Iniciando servidor local Django en todas las interfaces...' -ForegroundColor Yellow; .\venv\Scripts\python.exe backend/manage.py runserver 0.0.0.0:8000"

# 2. Start React Vite Dev Server in a new window (exposed to local network via --host)
Write-Host "[2/2] Levantando React + Vite + Tailwind UI Server expuesto..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Clear-Host; Write-Host '--- REACT FRONTEND CONSOLE ---' -ForegroundColor Cyan; Write-Host 'Iniciando servidor de desarrollo Vite expuesto...' -ForegroundColor Yellow; cd frontend; npm run dev -- --host"

Write-Host ""
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "✔ Django REST API corriendo en: http://localhost:8000/api/ o su IP Local" -ForegroundColor Yellow
Write-Host "✔ Frontend React UI corriendo en: http://localhost:5173/ y expuesto en Red" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "¡Revisa la consola de Vite para ver la IP local y abrirla en tu celular!" -ForegroundColor Magenta
Write-Host "Cierra las dos ventanas de consola abiertas para detener." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan
