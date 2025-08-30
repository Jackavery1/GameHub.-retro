#!/usr/bin/env node

/**
 * Planificateur de tâches de maintenance automatique
 * Exécution : node scripts/maintenance/scheduler.js
 * Prérequis : Connexion MCP admin
 */

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const MCPClient = require("../../src/mcp/client");

class MaintenanceScheduler {
  constructor() {
    this.mcpClient = null;
    this.tasks = new Map();
    this.config = {
      logLevel: "info",
      logFile: "logs/maintenance-scheduler.log",
      maxConcurrentTasks: 3,
      taskTimeout: 30 * 60 * 1000, // 30 minutes
      notifications: {
        email: false,
        webhook: false,
        webhookUrl: null,
      },
    };

    this.runningTasks = 0;
    this.taskHistory = [];
  }

  async initialize() {
    try {
      console.log("🔐 Initialisation du planificateur de maintenance MCP...");

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

      console.log("✅ Planificateur initialisé et connecté au serveur MCP");
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
  }

  // Définir les tâches de maintenance récurrentes
  setupMaintenanceTasks() {
    try {
      // 1. Nettoyage quotidien des utilisateurs inactifs (à 2h du matin)
      this.scheduleTask(
        "cleanup-users",
        "0 2 * * *",
        async () => {
          return await this.runUserCleanup();
        },
        {
          description: "Nettoyage des utilisateurs inactifs",
          priority: "high",
          retryOnFailure: true,
          maxRetries: 3,
        }
      );

      // 2. Sauvegarde hebdomadaire de la base (dimanche à 3h du matin)
      this.scheduleTask(
        "backup-database",
        "0 3 * * 0",
        async () => {
          return await this.runDatabaseBackup();
        },
        {
          description: "Sauvegarde hebdomadaire de la base de données",
          priority: "critical",
          retryOnFailure: true,
          maxRetries: 5,
        }
      );

      // 3. Optimisation de la base (tous les 15 jours à 4h du matin)
      this.scheduleTask(
        "optimize-database",
        "0 4 */15 * *",
        async () => {
          return await this.runDatabaseOptimization();
        },
        {
          description: "Optimisation de la base de données",
          priority: "medium",
          retryOnFailure: true,
          maxRetries: 2,
        }
      );

      // 4. Vérification de santé quotidienne (toutes les 6 heures)
      this.scheduleTask(
        "health-check",
        "0 */6 * * *",
        async () => {
          return await this.runHealthCheck();
        },
        {
          description: "Vérification de santé du système",
          priority: "high",
          retryOnFailure: true,
          maxRetries: 3,
        }
      );

      // 5. Nettoyage des logs (tous les 7 jours à 5h du matin)
      this.scheduleTask(
        "cleanup-logs",
        "0 5 */7 * *",
        async () => {
          return await this.runLogCleanup();
        },
        {
          description: "Nettoyage des anciens logs",
          priority: "low",
          retryOnFailure: false,
          maxRetries: 1,
        }
      );

      // 6. Analyse des performances (tous les 30 jours à 6h du matin)
      this.scheduleTask(
        "performance-analysis",
        "0 6 */30 * *",
        async () => {
          return await this.runPerformanceAnalysis();
        },
        {
          description: "Analyse des performances du système",
          priority: "medium",
          retryOnFailure: true,
          maxRetries: 2,
        }
      );

      console.log(`✅ ${this.tasks.size} tâches de maintenance planifiées`);
    } catch (error) {
      this.log("error", "Erreur lors de la configuration des tâches:", error);
    }
  }

  scheduleTask(name, cronExpression, taskFunction, options = {}) {
    try {
      if (this.tasks.has(name)) {
        this.log("warn", `Tâche ${name} déjà planifiée, remplacement...`);
        this.tasks.get(name).stop();
      }

      const task = {
        name,
        cronExpression,
        taskFunction,
        options: {
          description: "Tâche de maintenance",
          priority: "medium",
          retryOnFailure: false,
          maxRetries: 1,
          ...options,
        },
        status: "scheduled",
        lastRun: null,
        nextRun: null,
        runCount: 0,
        successCount: 0,
        failureCount: 0,
        lastError: null,
        stop: null,
      };

      // Planifier la tâche avec cron
      const cronJob = cron.schedule(
        cronExpression,
        async () => {
          await this.executeTask(task);
        },
        {
          scheduled: true,
          timezone: "Europe/Paris",
        }
      );

      task.stop = () => cronJob.stop();
      task.nextRun = cronJob.nextDate().toDate();

      this.tasks.set(name, task);
      this.log(
        "info",
        `Tâche planifiée: ${name} (${cronExpression}) - ${options.description}`
      );
    } catch (error) {
      this.log(
        "error",
        `Erreur lors de la planification de la tâche ${name}:`,
        error
      );
    }
  }

  async executeTask(task) {
    if (this.runningTasks >= this.config.maxConcurrentTasks) {
      this.log(
        "warn",
        `Tâche ${task.name} mise en attente - limite de tâches concurrentes atteinte`
      );
      return;
    }

    this.runningTasks++;
    task.status = "running";
    task.lastRun = new Date();
    task.runCount++;

    this.log("info", `🚀 Exécution de la tâche: ${task.name}`);

    try {
      const startTime = Date.now();
      const result = await Promise.race([
        task.taskFunction(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout")),
            this.config.taskTimeout
          )
        ),
      ]);

      const duration = Date.now() - startTime;
      task.status = "completed";
      task.successCount++;
      task.lastError = null;

      this.log(
        "info",
        `✅ Tâche ${task.name} terminée avec succès en ${duration}ms`
      );

      // Enregistrer l'historique
      this.taskHistory.push({
        taskName: task.name,
        status: "success",
        duration,
        timestamp: new Date(),
        result,
      });

      // Notifier le succès
      await this.notifyTaskCompletion(task, "success", result, duration);
    } catch (error) {
      task.status = "failed";
      task.failureCount++;
      task.lastError = error.message;

      this.log("error", `❌ Tâche ${task.name} échouée:`, error);

      // Enregistrer l'historique
      this.taskHistory.push({
        taskName: task.name,
        status: "failed",
        error: error.message,
        timestamp: new Date(),
      });

      // Gérer les retry en cas d'échec
      if (
        task.options.retryOnFailure &&
        task.failureCount < task.options.maxRetries
      ) {
        this.log("info", `🔄 Retry de la tâche ${task.name} dans 5 minutes...`);
        setTimeout(() => {
          this.executeTask(task);
        }, 5 * 60 * 1000);
      } else {
        // Notifier l'échec final
        await this.notifyTaskCompletion(task, "failed", null, 0, error);
      }
    } finally {
      this.runningTasks--;
      // Calculer la prochaine exécution
      const cronJob = cron.schedule(task.cronExpression, () => {}, {
        scheduled: false,
      });
      task.nextRun = cronJob.nextDate().toDate();
    }
  }

  // Implémentation des tâches de maintenance
  async runUserCleanup() {
    try {
      this.log("info", "🧹 Début du nettoyage des utilisateurs inactifs...");

      // Utiliser l'outil MCP pour récupérer les utilisateurs
      const users = await this.mcpClient.listUsers(1, 1000);

      if (!users.users || users.users.length === 0) {
        return { message: "Aucun utilisateur à nettoyer", processed: 0 };
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const inactiveUsers = users.users.filter((user) => {
        const lastActivity = user.lastLogin || user.updatedAt;
        return new Date(lastActivity) < cutoffDate && user.role === "user";
      });

      this.log("info", `${inactiveUsers.length} utilisateurs inactifs trouvés`);

      // Mode test pour la sécurité
      let processed = 0;
      for (const user of inactiveUsers) {
        try {
          // En mode test, on ne supprime pas vraiment
          this.log(
            "debug",
            `[TEST] Suppression de l'utilisateur: ${user.name}`
          );
          processed++;
        } catch (error) {
          this.log(
            "error",
            `Erreur lors de la suppression de ${user.name}:`,
            error
          );
        }
      }

      return {
        message: "Nettoyage des utilisateurs terminé",
        total: users.users.length,
        inactive: inactiveUsers.length,
        processed,
        mode: "test",
      };
    } catch (error) {
      throw new Error(`Nettoyage des utilisateurs échoué: ${error.message}`);
    }
  }

  async runDatabaseBackup() {
    try {
      this.log("info", "💾 Début de la sauvegarde de la base de données...");

      const backupName = `backup-${new Date().toISOString().split("T")[0]}`;
      const result = await this.mcpClient.backupDatabase(null, backupName);

      return {
        message: "Sauvegarde de la base terminée",
        backupName,
        result,
      };
    } catch (error) {
      throw new Error(`Sauvegarde de la base échouée: ${error.message}`);
    }
  }

  async runDatabaseOptimization() {
    try {
      this.log("info", "⚡ Début de l'optimisation de la base de données...");

      const result = await this.mcpClient.optimizeDatabase([
        "reindex",
        "validate",
      ]);

      return {
        message: "Optimisation de la base terminée",
        result,
      };
    } catch (error) {
      throw new Error(`Optimisation de la base échouée: ${error.message}`);
    }
  }

  async runHealthCheck() {
    try {
      this.log("info", "🏥 Début de la vérification de santé...");

      const health = await this.mcpClient.healthCheck();
      const systemInfo = await this.mcpClient.getSystemInfo();

      // Vérifier les seuils critiques
      const warnings = [];
      if (
        systemInfo.memoryUsage.heapUsed >
        systemInfo.memoryUsage.heapTotal * 0.8
      ) {
        warnings.push("Utilisation mémoire élevée");
      }

      return {
        message: "Vérification de santé terminée",
        health,
        systemInfo,
        warnings,
        status: warnings.length > 0 ? "warning" : "healthy",
      };
    } catch (error) {
      throw new Error(`Vérification de santé échouée: ${error.message}`);
    }
  }

  async runLogCleanup() {
    try {
      this.log("info", "🗑️ Début du nettoyage des logs...");

      const logsDir = "logs";
      if (!fs.existsSync(logsDir)) {
        return { message: "Dossier logs inexistant", deleted: 0 };
      }

      const files = fs.readdirSync(logsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Garder 30 jours

      let deleted = 0;
      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deleted++;
          this.log("debug", `Log supprimé: ${file}`);
        }
      }

      return {
        message: "Nettoyage des logs terminé",
        deleted,
        kept: files.length - deleted,
      };
    } catch (error) {
      throw new Error(`Nettoyage des logs échoué: ${error.message}`);
    }
  }

  async runPerformanceAnalysis() {
    try {
      this.log("info", "📊 Début de l'analyse des performances...");

      const systemInfo = await this.mcpClient.getSystemInfo();
      const health = await this.mcpClient.healthCheck();

      // Analyser les métriques
      const analysis = {
        memory: {
          usage:
            systemInfo.memoryUsage.heapUsed / systemInfo.memoryUsage.heapTotal,
          status:
            systemInfo.memoryUsage.heapUsed / systemInfo.memoryUsage.heapTotal >
            0.8
              ? "warning"
              : "good",
        },
        uptime: {
          days: Math.floor(systemInfo.uptime / (24 * 60 * 60)),
          status: systemInfo.uptime > 7 * 24 * 60 * 60 ? "good" : "info",
        },
        database: {
          status: health.status,
          collections: health.collections || 0,
        },
      };

      return {
        message: "Analyse des performances terminée",
        analysis,
        recommendations: this.generateRecommendations(analysis),
      };
    } catch (error) {
      throw new Error(`Analyse des performances échouée: ${error.message}`);
    }
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.memory.status === "warning") {
      recommendations.push({
        type: "warning",
        message: "Utilisation mémoire élevée",
        action: "Considérer un redémarrage du serveur ou une optimisation",
      });
    }

    if (analysis.uptime.days > 30) {
      recommendations.push({
        type: "info",
        message: "Serveur en ligne depuis longtemps",
        action: "Planifier un redémarrage de maintenance",
      });
    }

    return recommendations;
  }

  async notifyTaskCompletion(task, status, result, duration, error = null) {
    try {
      if (!this.config.notifications.webhook) return;

      const notification = {
        task: task.name,
        status,
        timestamp: new Date().toISOString(),
        duration: status === "success" ? duration : null,
        error: status === "failed" ? error?.message : null,
        result: status === "success" ? result : null,
      };

      // Envoyer la notification webhook
      if (this.config.notifications.webhookUrl) {
        const fetch = require("node-fetch");
        await fetch(this.config.notifications.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        });
      }

      this.log(
        "info",
        `📢 Notification envoyée pour la tâche ${task.name}: ${status}`
      );
    } catch (error) {
      this.log("error", `Erreur lors de l'envoi de la notification:`, error);
    }
  }

  // Méthodes de gestion du planificateur
  getTaskStatus() {
    const status = {};
    for (const [name, task] of this.tasks) {
      status[name] = {
        status: task.status,
        lastRun: task.lastRun,
        nextRun: task.nextRun,
        runCount: task.runCount,
        successCount: task.successCount,
        failureCount: task.failureCount,
        lastError: task.lastError,
      };
    }
    return status;
  }

  getTaskHistory(limit = 100) {
    return this.taskHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  stopTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task && task.stop) {
      task.stop();
      this.log("info", `Tâche ${taskName} arrêtée`);
      return true;
    }
    return false;
  }

  start() {
    console.log("🚀 Démarrage du planificateur de maintenance...");
    this.setupMaintenanceTasks();

    // Démarrer toutes les tâches
    for (const [name, task] of this.tasks) {
      this.log("info", `▶️ Tâche ${name} démarrée`);
    }

    console.log("✅ Planificateur de maintenance démarré");
    console.log("📅 Tâches planifiées:");

    for (const [name, task] of this.tasks) {
      console.log(
        `   • ${name}: ${task.cronExpression} - ${task.options.description}`
      );
    }
  }

  stop() {
    console.log("🛑 Arrêt du planificateur de maintenance...");

    // Arrêter toutes les tâches
    for (const [name, task] of this.tasks) {
      if (task.stop) {
        task.stop();
        this.log("info", `Tâche ${name} arrêtée`);
      }
    }

    // Déconnecter le client MCP
    if (this.mcpClient) {
      this.mcpClient.disconnect();
    }

    console.log("✅ Planificateur de maintenance arrêté");
  }
}

// Exécution du script
if (require.main === module) {
  const scheduler = new MaintenanceScheduler();

  scheduler
    .initialize()
    .then(() => {
      scheduler.start();

      // Gestion de l'arrêt propre
      process.on("SIGINT", () => {
        console.log("\n🛑 Arrêt du planificateur...");
        scheduler.stop();
        process.exit(0);
      });

      process.on("SIGTERM", () => {
        console.log("\n🛑 Arrêt du planificateur...");
        scheduler.stop();
        process.exit(0);
      });
    })
    .catch((error) => {
      console.error("💥 Erreur critique:", error);
      process.exit(1);
    });
}

module.exports = MaintenanceScheduler;
