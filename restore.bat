@echo off
echo ========================================
echo    RESTAURATION GAMEHUB RETRO PRE-MCP
echo ========================================
echo.

echo Cette action va restaurer la version du projet avant l'integration MCP.
echo ATTENTION: Toutes les modifications MCP seront perdues !
echo.

set /p confirm="Etes-vous sur de vouloir continuer ? (oui/non): "

if /i "%confirm%"=="oui" (
    echo.
    echo Restauration en cours...
    
    REM Supprimer le projet actuel
    echo Suppression du projet actuel...
    rmdir /s /q "..\gamehub-retro-v2"
    
    REM Restaurer la sauvegarde
    echo Restauration de la sauvegarde...
    xcopy "gamehub-retro-v2-backup-pre-mcp" "..\gamehub-retro-v2" /E /I /H /Y
    
    echo.
    echo ========================================
    echo    RESTAURATION TERMINEE !
    echo ========================================
    echo.
    echo Le projet a ete restaure avec succes.
    echo Pour continuer:
    echo 1. Aller dans le dossier: cd ..\gamehub-retro-v2
    echo 2. Installer les dependances: npm install
    echo 3. Lancer le serveur: npm run dev
    echo.
    pause
) else (
    echo.
    echo Restauration annulee.
    pause
)
