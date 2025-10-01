@echo off
echo ========================================
echo   Iniciando servidor do jogo...
echo ========================================
echo.
echo O jogo estara disponivel em:
echo   http://localhost:8080
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

python -m http.server 8080

pause
