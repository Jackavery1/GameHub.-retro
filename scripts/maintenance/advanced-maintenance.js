#!/usr/bin/env node

/**
 * Script de maintenance avancée - Phase 1 complète
 * Exécution : node scripts/maintenance/advanced-maintenance.js
 * Prérequis : Connexion MCP admin
 *
 * Ce script implémente toutes les fonctionnalités de la Phase 1 :
 * - Nettoyage automatique des données obsolètes
 * - Sauvegardes automatiques
 * - Monitoring des performances
 * - Gestion des logs
 * - Vérifications de santé
 */

const fs = require("fs");
const path = require("path");
const MCPClient = require("../../src/mcp/client");

class AdvancedMaintenance {
  constructor() {
    this.mcpClient = null;
    this.config = {
      logLevel: "info",
      logFile: "logs/advanced-maintenance.log",
      maintenanceConfig: {
        cleanup: {
          enabled: true,
          dryRun: true, // Commencer en mode simulation
          maxAge: 365, // 1 an
          collections: [
            "users",
            "games",
            "tournaments",
            "matches",
            "registrations",
          ],
        },
        backup: {
          enabled: true,
          frequency: "daily", // daily, weekly, monthly
          retention: 30, // jours
        },
        monitoring: {
          enabled: true,
          healthCheckInterval: 6, // heures
          performanceCheckInterval: 12, // heures
          logRotationInterval: 24, // heures
        },
        alerts: {
          enabled: true,
          email: false,
          webhook: false,
          webhookUrl: null,
        },
      },
      results: {
        startTime: null,
        endTime: null,
        operations: [],
        errors: [],
        warnings: [],
        summary: {},
      },
    };
  }

  async initialize() {
    try {
      console.log("🚀 Initialisation de la maintenance avancée Phase 1...");

      // Connexion au serveur MCP
      const token = process.env.MCP_ADMIN_TOKEN;
      if (!token) {
        throw new Error("Token MCP admin requis. Définissez MCP_ADMIN_TOKEN");
      }

      this.mcpClient = new MCPClient("ws://localhost:3002", token);
      await this.mcpClient.connect();

      // Créer le dossier de logs
      if (!fs.existsSync("logs")) {
        fs.mkdirSync("logs", { recursive: true });
      }

      this.config.results.startTime = new Date();
      console.log(
        "✅ Maintenance avancée initialisée et connectée au serveur MCP"
      );
      return true;
    } catch (error) {
      console.error("❌ Erreur d'initialisation:", error.message);
      return false;
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Log console
    if (
      this.config.logLevel === "debug" ||
      ["error", "warn"].includes(level) ||
      level === this.config.logLevel
    ) {
      console.log(logMessage);
      if (data) console.log("📊 Données:", data);
    }

    // Log fichier
    try {
      const logEntry = `${logMessage}${
        data ? "\n" + JSON.stringify(data, null, 2) : ""
      }\n`;
      fs.appendFileSync(this.config.logFile, logEntry);
    } catch (error) {
      console.error("❌ Erreur lors de l'écriture du log:", error);
    }

    // Stocker dans les résultats
    this.config.results.operations.push({
      timestamp: new Date(),
      level,
      message,
      data,
    });
  }

  async runHealthCheck() {
    try {
      this.log(
        "info",
        "🏥 Démarrage de la vérification de santé du système..."
      );

      const healthReport = await this.mcpClient.callTool("health_check", {
        includeDetailedChecks: true,
        includePerformanceTest: true,
      });

      if (healthReport.error) {
        throw new Error(healthReport.error);
      }

      this.log(
        "info",
        `📊 Rapport de santé: ${healthReport.overallStatus} (Score: ${healthReport.score}/100)`
      );

      // Analyser les recommandations
      if (
        healthReport.recommendations &&
        healthReport.recommendations.length > 0
      ) {
        this.log(
          "warn",
          `⚠️  Recommandations: ${healthReport.recommendations.join(", ")}`
        );
        this.config.results.warnings.push(...healthReport.recommendations);
      }

      // Vérifier le statut global
      if (healthReport.overallStatus === "unhealthy") {
        this.log("error", "🚨 Système en mauvais état - intervention requise");
        this.config.results.errors.push("Système en mauvais état");
      } else if (healthReport.overallStatus === "warning") {
        this.log(
          "warn",
          "⚠️  Système en état dégradé - surveillance renforcée"
        );
        this.config.results.warnings.push("Système en état dégradé");
      }

      return healthReport;
    } catch (error) {
      this.log("error", `❌ Vérification de santé échouée: ${error.message}`);
      this.config.results.errors.push(
        `Vérification de santé: ${error.message}`
      );
      throw error;
    }
  }

  async runPerformanceMonitoring() {
    try {
      this.log("info", "📈 Démarrage du monitoring des performances...");

      const performanceMetrics = await this.mcpClient.callTool(
        "get_performance_metrics",
        {
          includeSlowQueries: true,
          includeIndexUsage: true,
          timeRange: 24,
        }
      );

      if (performanceMetrics.error) {
        throw new Error(performanceMetrics.error);
      }

      this.log("info", "📊 Métriques de performance récupérées");

      // Analyser les performances
      const queryTests =
        performanceMetrics.metrics.database.performance.queryTests;
      let slowQueries = 0;

      for (const [testName, test] of Object.entries(queryTests)) {
        if (test.status === "slow") {
          slowQueries++;
          this.log(
            "warn",
            `🐌 Requête lente détectée: ${testName} (${test.duration}ms)`
          );
        }
      }

      if (slowQueries > 0) {
        this.config.results.warnings.push(
          `${slowQueries} requêtes lentes détectées`
        );
      }

      // Vérifier la fragmentation
      const collections = performanceMetrics.metrics.database.collections;
      let highFragmentation = 0;

      for (const [collectionName, collection] of Object.entries(collections)) {
        if (collection.fragmentation > 0.3) {
          // Plus de 30% de fragmentation
          highFragmentation++;
          this.log(
            "warn",
            `📦 Fragmentation élevée détectée: ${collectionName} (${(
              collection.fragmentation * 100
            ).toFixed(1)}%)`
          );
        }
      }

      if (highFragmentation > 0) {
        this.config.results.warnings.push(
          `${highFragmentation} collections avec fragmentation élevée`
        );
      }

      return performanceMetrics;
    } catch (error) {
      this.log(
        "error",
        `❌ Monitoring des performances échoué: ${error.message}`
      );
      this.config.results.errors.push(
        `Monitoring des performances: ${error.message}`
      );
      throw error;
    }
  }

  async runDataCleanup() {
    try {
      if (!this.config.maintenanceConfig.cleanup.enabled) {
        this.log("info", "⏭️  Nettoyage des données désactivé");
        return null;
      }

      this.log("info", "🧹 Démarrage du nettoyage des données obsolètes...");

      const cleanupResult = await this.mcpClient.callTool(
        "cleanup_obsolete_data",
        {
          collections: this.config.maintenanceConfig.cleanup.collections,
          dryRun: this.config.maintenanceConfig.cleanup.dryRun,
          maxAge: this.config.maintenanceConfig.cleanup.maxAge,
        }
      );

      if (cleanupResult.error) {
        throw new Error(cleanupResult.error);
      }

      const mode = this.config.maintenanceConfig.cleanup.dryRun
        ? "simulation"
        : "réel";
      this.log("info", `✅ Nettoyage des données terminé (mode: ${mode})`);
      this.log(
        "info",
        `📊 Résumé: ${cleanupResult.summary.totalDeleted} documents seraient supprimés`
      );

      // Analyser les résultats
      if (cleanupResult.summary.totalDeleted > 1000) {
        this.log(
          "warn",
          `⚠️  Nombre élevé de documents à nettoyer: ${cleanupResult.summary.totalDeleted}`
        );
        this.config.results.warnings.push(
          `Nettoyage massif requis: ${cleanupResult.summary.totalDeleted} documents`
        );
      }

      return cleanupResult;
    } catch (error) {
      this.log("error", `❌ Nettoyage des données échoué: ${error.message}`);
      this.config.results.errors.push(
        `Nettoyage des données: ${error.message}`
      );
      throw error;
    }
  }

  async runBackup() {
    try {
      if (!this.config.maintenanceConfig.backup.enabled) {
        this.log("info", "⏭️  Sauvegarde désactivée");
        return null;
      }

      this.log(
        "info",
        "💾 Démarrage de la sauvegarde de la base de données..."
      );

      const backupResult = await this.mcpClient.callTool("backup_database", {
        includeCollections: this.config.maintenanceConfig.cleanup.collections,
        backupName: `backup-${new Date().toISOString().split("T")[0]}`,
      });

      if (backupResult.error) {
        throw new Error(backupResult.error);
      }

      this.log(
        "info",
        `✅ Sauvegarde terminée: ${backupResult.backupInfo.backupId}`
      );

      // Vérifier l'espace disque (simulation)
      const estimatedSize =
        this.config.maintenanceConfig.cleanup.collections.length * 100; // Estimation
      this.log(
        "info",
        `📊 Taille estimée de la sauvegarde: ${estimatedSize} MB`
      );

      return backupResult;
    } catch (error) {
      this.log("error", `❌ Sauvegarde échouée: ${error.message}`);
      this.config.results.errors.push(`Sauvegarde: ${error.message}`);
      throw error;
    }
  }

  async runLogManagement() {
    try {
      this.log("info", "📝 Démarrage de la gestion des logs...");

      // Rotation des logs
      const rotationResult = await this.mcpClient.callTool("manage_logs", {
        action: "rotate",
        logType: "system",
      });

      if (rotationResult.error) {
        throw new Error(rotationResult.error);
      }

      this.log(
        "info",
        `✅ Rotation des logs terminée: ${rotationResult.results.oldLogsArchived} logs archivés`
      );

      // Nettoyage des anciens logs
      const cleanupResult = await this.mcpClient.callTool("manage_logs", {
        action: "cleanup",
        logType: "system",
        maxAge: 30,
      });

      if (cleanupResult.error) {
        throw new Error(cleanupResult.error);
      }

      this.log(
        "info",
        `🧹 Nettoyage des logs terminé: ${cleanupResult.results.logsRemoved} logs supprimés`
      );

      // Analyse des logs
      const analysisResult = await this.mcpClient.callTool("manage_logs", {
        action: "analyze",
        logType: "system",
      });

      if (analysisResult.error) {
        throw new Error(analysisResult.error);
      }

      this.log(
        "info",
        `📊 Analyse des logs terminée: ${analysisResult.results.totalLogs} logs analysés`
      );

      // Vérifier les erreurs
      if (analysisResult.results.errorCount > 10) {
        this.log(
          "warn",
          `⚠️  Nombre élevé d'erreurs détectées: ${analysisResult.results.errorCount}`
        );
        this.config.results.warnings.push(
          `Erreurs dans les logs: ${analysisResult.results.errorCount}`
        );
      }

      return {
        rotation: rotationResult,
        cleanup: cleanupResult,
        analysis: analysisResult,
      };
    } catch (error) {
      this.log("error", `❌ Gestion des logs échouée: ${error.message}`);
      this.config.results.errors.push(`Gestion des logs: ${error.message}`);
      throw error;
    }
  }

  async runDatabaseOptimization() {
    try {
      this.log(
        "info",
        "⚡ Démarrage de l'optimisation de la base de données..."
      );

      const optimizationResult = await this.mcpClient.callTool(
        "optimize_database",
        {
          operations: ["reindex", "validate", "compact"],
        }
      );

      if (optimizationResult.error) {
        throw new Error(optimizationResult.error);
      }

      this.log(
        "info",
        `✅ Optimisation terminée: ${optimizationResult.optimizationResults.length} opérations effectuées`
      );

      // Analyser les résultats
      for (const operation of optimizationResult.optimizationResults) {
        this.log("info", `🔧 ${operation.operation}: ${operation.message}`);
      }

      return optimizationResult;
    } catch (error) {
      this.log(
        "error",
        `❌ Optimisation de la base de données échouée: ${error.message}`
      );
      this.config.results.errors.push(
        `Optimisation de la base: ${error.message}`
      );
      throw error;
    }
  }

  async runMaintenance() {
    try {
      this.log("info", "🚀 Démarrage de la maintenance avancée complète...");

      // 1. Vérification de santé
      await this.runHealthCheck();

      // 2. Monitoring des performances
      await this.runPerformanceMonitoring();

      // 3. Nettoyage des données
      await this.runDataCleanup();

      // 4. Sauvegarde
      await this.runBackup();

      // 5. Gestion des logs
      await this.runLogManagement();

      // 6. Optimisation de la base
      await this.runDatabaseOptimization();

      this.log("info", "🎉 Maintenance avancée terminée avec succès !");
    } catch (error) {
      this.log(
        "error",
        `💥 Erreur critique lors de la maintenance: ${error.message}`
      );
      this.config.results.errors.push(`Erreur critique: ${error.message}`);
    }
  }

  generateReport() {
    this.config.results.endTime = new Date();
    const duration =
      this.config.results.endTime - this.config.results.startTime;

    this.config.results.summary = {
      duration: `${Math.round(duration / 1000)}s`,
      totalOperations: this.config.results.operations.length,
      errors: this.config.results.errors.length,
      warnings: this.config.results.warnings.length,
      successRate:
        this.config.results.errors.length === 0
          ? "100%"
          : `${Math.round(
              (1 -
                this.config.results.errors.length /
                  this.config.results.operations.length) *
                100
            )}%`,
    };

    const report = {
      title: "Rapport de Maintenance Avancée - Phase 1",
      timestamp: new Date(),
      summary: this.config.results.summary,
      operations: this.config.results.operations,
      errors: this.config.results.errors,
      warnings: this.config.results.warnings,
      recommendations: this.generateRecommendations(),
    };

    // Sauvegarder le rapport
    const reportPath = `logs/maintenance-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log("info", `📄 Rapport sauvegardé: ${reportPath}`);

    // Afficher le résumé
    console.log("\n" + "=".repeat(60));
    console.log("📊 RAPPORT DE MAINTENANCE AVANCÉE - PHASE 1");
    console.log("=".repeat(60));
    console.log(`⏱️  Durée totale: ${report.summary.duration}`);
    console.log(`🔧 Opérations: ${report.summary.totalOperations}`);
    console.log(`✅ Taux de succès: ${report.summary.successRate}`);
    console.log(`❌ Erreurs: ${report.summary.errors}`);
    console.log(`⚠️  Avertissements: ${report.summary.warnings}`);

    if (report.errors > 0) {
      console.log("\n🚨 ERREURS DÉTECTÉES:");
      report.errors.forEach((error) => console.log(`   • ${error}`));
    }

    if (report.warnings > 0) {
      console.log("\n⚠️  AVERTISSEMENTS:");
      report.warnings.forEach((warning) => console.log(`   • ${warning}`));
    }

    if (report.recommendations.length > 0) {
      console.log("\n💡 RECOMMANDATIONS:");
      report.recommendations.forEach((rec) => console.log(`   • ${rec}`));
    }

    console.log("=".repeat(60));

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.config.results.errors.length > 0) {
      recommendations.push(
        "Intervention manuelle requise pour résoudre les erreurs critiques"
      );
    }

    if (this.config.results.warnings.length > 0) {
      recommendations.push(
        "Surveillance renforcée recommandée pour les avertissements"
      );
    }

    if (this.config.maintenanceConfig.cleanup.dryRun) {
      recommendations.push(
        "Passer en mode réel pour le nettoyage des données après validation"
      );
    }

    if (
      this.config.maintenanceConfig.alerts.enabled &&
      !this.config.maintenanceConfig.alerts.webhook
    ) {
      recommendations.push(
        "Configurer les webhooks pour les alertes automatiques"
      );
    }

    return recommendations;
  }

  async cleanup() {
    if (this.mcpClient) {
      this.mcpClient.disconnect();
    }
  }
}

// Exécution principale
async function main() {
  const maintenance = new AdvancedMaintenance();

  try {
    // Initialisation
    if (!(await maintenance.initialize())) {
      process.exit(1);
    }

    // Exécution de la maintenance
    await maintenance.runMaintenance();

    // Génération du rapport
    maintenance.generateReport();
  } catch (error) {
    console.error("💥 Erreur fatale:", error.message);
    process.exit(1);
  } finally {
    await maintenance.cleanup();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AdvancedMaintenance;
