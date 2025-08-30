#!/usr/bin/env node

/**
 * Script de maintenance : Nettoyage des utilisateurs inactifs
 * Exécution : node scripts/maintenance/cleanup-users.js
 * Prérequis : Connexion MCP admin
 */

const MCPClient = require("../../src/mcp/client");

class UserCleanupMaintenance {
  constructor() {
    this.mcpClient = null;
    this.config = {
      inactiveDays: 30, // Jours d'inactivité avant suppression
      dryRun: true, // Mode test (ne supprime rien)
      batchSize: 50, // Taille des lots de traitement
      logLevel: "info", // debug, info, warn, error
    };
  }

  async initialize() {
    try {
      console.log("🔐 Initialisation de la maintenance MCP...");

      // Connexion au serveur MCP (nécessite un token admin)
      const token = process.env.MCP_ADMIN_TOKEN;
      if (!token) {
        throw new Error("Token MCP admin requis. Définissez MCP_ADMIN_TOKEN");
      }

      this.mcpClient = new MCPClient("ws://localhost:3002", token);
      await this.mcpClient.connect();

      console.log("✅ Connecté au serveur MCP");
      return true;
    } catch (error) {
      console.error("❌ Erreur d'initialisation:", error.message);
      return false;
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (
      this.config.logLevel === "debug" ||
      ["error", "warn"].includes(level) ||
      level === this.config.logLevel
    ) {
      console.log(logMessage);
      if (data) console.log("📊 Données:", data);
    }
  }

  async getInactiveUsers() {
    try {
      this.log("info", "🔍 Recherche des utilisateurs inactifs...");

      // Récupérer tous les utilisateurs
      const users = await this.mcpClient.callTool("list_users", {
        page: 1,
        limit: 1000,
      });

      if (!users.users || users.users.length === 0) {
        this.log("info", "ℹ️ Aucun utilisateur trouvé");
        return [];
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.inactiveDays);

      const inactiveUsers = users.users.filter((user) => {
        const lastActivity = user.lastLogin || user.updatedAt;
        return new Date(lastActivity) < cutoffDate && user.role === "user";
      });

      this.log(
        "info",
        `📊 ${inactiveUsers.length} utilisateurs inactifs trouvés sur ${users.users.length} total`
      );

      return inactiveUsers;
    } catch (error) {
      this.log(
        "error",
        "Erreur lors de la recherche des utilisateurs inactifs:",
        error
      );
      return [];
    }
  }

  async analyzeUserData(users) {
    try {
      this.log("info", "📈 Analyse des données utilisateurs...");

      const analysis = {
        total: users.length,
        byLastActivity: {
          "30-60 jours": 0,
          "60-90 jours": 0,
          "90+ jours": 0,
        },
        byRole: {},
        withSteam: 0,
        withLinkedAccounts: 0,
      };

      users.forEach((user) => {
        const lastActivity = user.lastLogin || user.updatedAt;
        const daysInactive = Math.floor(
          (Date.now() - new Date(lastActivity)) / (1000 * 60 * 60 * 24)
        );

        if (daysInactive <= 60) analysis.byLastActivity["30-60 jours"]++;
        else if (daysInactive <= 90) analysis.byLastActivity["60-90 jours"]++;
        else analysis.byLastActivity["90+ jours"]++;

        analysis.byRole[user.role] = (analysis.byRole[user.role] || 0) + 1;
        if (user.steamId) analysis.withSteam++;
        if (user.linkedAccounts && user.linkedAccounts.length > 0)
          analysis.withLinkedAccounts++;
      });

      this.log("info", "📊 Analyse terminée:", analysis);
      return analysis;
    } catch (error) {
      this.log("error", "Erreur lors de l'analyse:", error);
      return null;
    }
  }

  async cleanupUsers(users) {
    try {
      if (this.config.dryRun) {
        this.log("info", "🧪 Mode test activé - Aucune suppression réelle");
      }

      this.log(
        "info",
        `🧹 Début du nettoyage de ${users.length} utilisateurs...`
      );

      let processed = 0;
      let deleted = 0;
      let errors = 0;

      // Traitement par lots
      for (let i = 0; i < users.length; i += this.config.batchSize) {
        const batch = users.slice(i, i + this.config.batchSize);

        this.log(
          "info",
          `📦 Traitement du lot ${
            Math.floor(i / this.config.batchSize) + 1
          }/${Math.ceil(users.length / this.config.batchSize)}`
        );

        for (const user of batch) {
          try {
            if (this.config.dryRun) {
              this.log(
                "debug",
                `🧪 [TEST] Suppression de l'utilisateur: ${user.name} (${user.email})`
              );
            } else {
              await this.mcpClient.callTool("delete_user", {
                userId: user._id,
              });
              this.log(
                "info",
                `🗑️ Utilisateur supprimé: ${user.name} (${user.email})`
              );
              deleted++;
            }
            processed++;
          } catch (error) {
            this.log(
              "error",
              `❌ Erreur lors de la suppression de ${user.name}:`,
              error
            );
            errors++;
          }
        }

        // Pause entre les lots pour éviter la surcharge
        if (i + this.config.batchSize < users.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      const summary = {
        total: users.length,
        processed,
        deleted: this.config.dryRun ? 0 : deleted,
        errors,
        dryRun: this.config.dryRun,
      };

      this.log("info", "✅ Nettoyage terminé:", summary);
      return summary;
    } catch (error) {
      this.log("error", "Erreur lors du nettoyage:", error);
      return null;
    }
  }

  async generateReport(analysis, summary) {
    try {
      this.log("info", "📋 Génération du rapport...");

      const report = {
        timestamp: new Date().toISOString(),
        config: this.config,
        analysis,
        summary,
        recommendations: [],
      };

      // Recommandations basées sur l'analyse
      if (analysis.byLastActivity["90+ jours"] > 0) {
        report.recommendations.push({
          type: "warning",
          message: `${analysis.byLastActivity["90+ jours"]} utilisateurs inactifs depuis plus de 90 jours`,
          action: "Considérer une suppression immédiate",
        });
      }

      if (summary.errors > 0) {
        report.recommendations.push({
          type: "error",
          message: `${summary.errors} erreurs lors du nettoyage`,
          action: "Vérifier les logs et corriger les erreurs",
        });
      }

      if (analysis.withSteam > 0) {
        report.recommendations.push({
          type: "info",
          message: `${analysis.withSteam} utilisateurs ont des comptes Steam liés`,
          action: "Considérer la préservation des données Steam",
        });
      }

      // Sauvegarder le rapport
      const fs = require("fs");
      const reportPath = `logs/maintenance-cleanup-${Date.now()}.json`;

      if (!fs.existsSync("logs")) {
        fs.mkdirSync("logs", { recursive: true });
      }

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      this.log("info", `📄 Rapport sauvegardé: ${reportPath}`);

      return report;
    } catch (error) {
      this.log("error", "Erreur lors de la génération du rapport:", error);
      return null;
    }
  }

  async run() {
    try {
      console.log(
        "🚀 Démarrage de la maintenance de nettoyage des utilisateurs"
      );
      console.log("==========================================================");

      if (!(await this.initialize())) {
        process.exit(1);
      }

      // Récupérer les utilisateurs inactifs
      const inactiveUsers = await this.getInactiveUsers();

      if (inactiveUsers.length === 0) {
        this.log("info", "✅ Aucun utilisateur inactif à nettoyer");
        return;
      }

      // Analyser les données
      const analysis = await this.analyzeUserData(inactiveUsers);

      // Nettoyer les utilisateurs
      const summary = await this.cleanupUsers(inactiveUsers);

      // Générer le rapport
      const report = await this.generateReport(analysis, summary);

      console.log("\n🎉 Maintenance terminée avec succès!");
      console.log("📊 Résumé:", summary);
    } catch (error) {
      console.error("💥 Erreur critique lors de la maintenance:", error);
      process.exit(1);
    } finally {
      if (this.mcpClient) {
        this.mcpClient.disconnect();
      }
    }
  }
}

// Exécution du script
if (require.main === module) {
  const maintenance = new UserCleanupMaintenance();
  maintenance.run();
}

module.exports = UserCleanupMaintenance;
