# Script de restauration PowerShell pour GameHub Retro Pre-MCP
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESTAURATION GAMEHUB RETRO PRE-MCP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cette action va restaurer la version du projet avant l'integration MCP." -ForegroundColor Yellow
Write-Host "ATTENTION: Toutes les modifications MCP seront perdues !" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Etes-vous sur de vouloir continuer ? (oui/non)"

if ($confirm -eq "oui") {
    Write-Host ""
    Write-Host "Restauration en cours..." -ForegroundColor Green
    
    # Supprimer le projet actuel
    Write-Host "Suppression du projet actuel..." -ForegroundColor Yellow
    if (Test-Path "..\gamehub-retro-v2") {
        Remove-Item -Recurse -Force "..\gamehub-retro-v2"
    }
    
    # Restaurer la sauvegarde
    Write-Host "Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item -Path "gamehub-retro-v2-backup-pre-mcp" -Destination "..\gamehub-retro-v2" -Recurse -Force
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    RESTAURATION TERMINEE !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le projet a ete restaure avec succes." -ForegroundColor Green
    Write-Host "Pour continuer:" -ForegroundColor White
    Write-Host "1. Aller dans le dossier: cd ..\gamehub-retro-v2" -ForegroundColor White
    Write-Host "2. Installer les dependances: npm install" -ForegroundColor White
    Write-Host "3. Lancer le serveur: npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Appuyez sur Entree pour continuer"
} else {
    Write-Host ""
    Write-Host "Restauration annulee." -ForegroundColor Yellow
    Read-Host "Appuyez sur Entree pour continuer"
}
