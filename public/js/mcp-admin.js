/**
 * Script d'administration MCP pour GameHub Retro
 * Gère toutes les interactions avec le serveur MCP
 */

class MCPAdmin {
  constructor() {
    this.mcpServerUrl = "http://localhost:3002";
    this.adminToken = null;
    this.monitoringInterval = null;
    this.isMonitoring = false;

    // Initialiser le token admin depuis le localStorage
    this.loadAdminToken();

    // Configuration par défaut
    this.defaultConfig = {
      cleanupUsers: { enabled: true, schedule: "0 2 * * *" },
      backupDatabase: { enabled: true, schedule: "0 3 * * 0" },
      optimizeDatabase: { enabled: true, schedule: "0 4 */15 * *" },
      healthCheck: { enabled: true, schedule: "0 */6 * * *" },
      cleanupLogs: { enabled: true, schedule: "0 5 */7 * *" },
      performanceAnalysis: { enabled: true, schedule: "0 6 */30 * *" },
      dryRun: true,
      notifications: false,
    };
  }

  // ===== GESTION DES TOKENS ADMIN =====

  async loadAdminToken() {
    this.adminToken = localStorage.getItem("mcpAdminToken");
    if (!this.adminToken) {
      await this.generateAdminToken();
    }
  }

  async generateAdminToken() {
    try {
      // Utiliser l'authentification de session existante
      const response = await fetch(`${this.mcpServerUrl}/auth/generate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionBased: true,
          // Le serveur MCP vérifiera la session côté serveur
        }),
        credentials: "include", // Inclure les cookies de session
      });

      if (response.ok) {
        const data = await response.json();
        this.adminToken = data.token;
        localStorage.setItem("mcpAdminToken", this.adminToken);
        this.showToast("Token admin généré avec succès", "success");
      } else {
        if (response.status === 401) {
          throw new Error("Accès refusé - vérifiez vos droits administrateur");
        } else if (response.status === 400) {
          throw new Error("Paramètres invalides pour la génération de token");
        } else {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération du token:", error);
      this.showToast("Erreur lors de la génération du token admin", "error");
      throw error;
    }
  }

  // ===== REQUÊTES HTTP VERS LE SERVEUR MCP =====

  async makeRequest(endpoint, options = {}) {
    if (!this.adminToken) {
      await this.loadAdminToken();
    }

    const url = `${this.mcpServerUrl}${endpoint}`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.adminToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expiré, régénérer
        await this.generateAdminToken();
        return this.makeRequest(endpoint, options);
      }

      return response;
    } catch (error) {
      console.error(`Erreur lors de la requête vers ${endpoint}:`, error);
      throw error;
    }
  }

  // ===== STATUT DU SERVEUR MCP =====

  async checkServerStatus() {
    try {
      const response = await fetch(`${this.mcpServerUrl}/health`);
      const data = await response.json();

      const statusIndicator = document.getElementById("statusIndicator");
      const statusText = document.getElementById("statusText");

      if (response.ok) {
        statusIndicator.className = "retro-status status-online";
        statusText.textContent = "En ligne";

        // Mettre à jour les métriques
        await this.updateServerMetrics();
      } else {
        statusIndicator.className = "retro-status status-offline";
        statusText.textContent = "Hors ligne";
        this.clearServerMetrics();
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut:", error);
      const statusIndicator = document.getElementById("statusIndicator");
      const statusText = document.getElementById("statusText");

      statusIndicator.className = "retro-status status-offline";
      statusText.textContent = "Erreur de connexion";
      this.clearServerMetrics();
    }
  }

  async updateServerMetrics() {
    try {
      // Récupérer les statistiques du serveur
      const response = await this.makeRequest("/admin/stats");
      if (response.ok) {
        const stats = await response.json();

        // Mettre à jour les métriques disponibles
        const uptimeElement = document.getElementById("uptimeValue");
        const toolsElement = document.getElementById("toolsValue");

        if (uptimeElement) {
          uptimeElement.textContent = this.formatUptime(
            stats.serverUptime || 0
          );
        }

        if (toolsElement) {
          toolsElement.textContent = stats.activeTools || 0;
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des métriques:", error);
    }
  }

  clearServerMetrics() {
    const metrics = ["uptimeValue", "toolsValue"];
    metrics.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.textContent = "--";
    });
  }

  // ===== GESTION DES TÂCHES DE MAINTENANCE =====

  async refreshTasks() {
    try {
      const tasksList = document.getElementById("tasksList");
      tasksList.innerHTML =
        '<div class="retro-loading"><div class="spinner-border" role="status"></div><p class="mt-2">Chargement des tâches...</p></div>';

      // Simuler la récupération des tâches (à adapter selon votre API)
      const tasks = [
        {
          name: "cleanup-users",
          description: "Nettoyage des utilisateurs inactifs",
          schedule: "0 2 * * *",
          nextRun: "2024-01-15T02:00:00Z",
          status: "active",
          priority: "high",
          lastRun: "2024-01-14T02:00:00Z",
          lastStatus: "success",
        },
        {
          name: "backup-database",
          description: "Sauvegarde hebdomadaire de la base de données",
          schedule: "0 3 * * 0",
          nextRun: "2024-01-21T03:00:00Z",
          status: "active",
          priority: "critical",
          lastRun: "2024-01-14T03:00:00Z",
          lastStatus: "success",
        },
        {
          name: "optimize-database",
          description: "Optimisation de la base de données",
          schedule: "0 4 */15 * *",
          nextRun: "2024-01-29T04:00:00Z",
          status: "active",
          priority: "medium",
          lastRun: "2024-01-14T04:00:00Z",
          lastStatus: "success",
        },
        {
          name: "health-check",
          description: "Vérification de santé du système",
          schedule: "0 */6 * * *",
          nextRun: "2024-01-14T18:00:00Z",
          status: "active",
          priority: "high",
          lastRun: "2024-01-14T12:00:00Z",
          lastStatus: "success",
        },
      ];

      this.displayTasks(tasks);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
      this.showToast("Erreur lors du chargement des tâches", "error");
    }
  }

  displayTasks(tasks) {
    const tasksList = document.getElementById("tasksList");

    if (tasks.length === 0) {
      tasksList.innerHTML =
        '<div class="text-center py-4"><i class="fas fa-info-circle fa-2x mb-3" style="color: var(--retro-accent);"></i><p style="color: var(--retro-accent);">Aucune tâche de maintenance configurée</p></div>';
      return;
    }

    const tasksHtml = tasks
      .map(
        (task) => `
            <div class="retro-task">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1" style="color: var(--retro-primary);">${
                          task.description
                        }</h6>
                        <div class="d-flex align-items-center gap-3 mb-2">
                            <span class="retro-badge">${task.schedule}</span>
                            <span class="retro-badge" style="background: ${
                              task.priority === "critical"
                                ? "#ff4444"
                                : task.priority === "high"
                                ? "#ff6b35"
                                : task.priority === "medium"
                                ? "#4ecdc4"
                                : "#00ff41"
                            }">${task.priority}</span>
                            <span class="retro-badge" style="background: ${
                              task.status === "active" ? "#00ff41" : "#666666"
                            }">${task.status}</span>
                        </div>
                        <div style="color: var(--retro-accent); font-size: 0.85rem;">
                            <span class="me-3"><i class="fas fa-clock me-1"></i>Prochaine: ${this.formatDate(
                              task.nextRun
                            )}</span>
                            <span><i class="fas fa-history me-1"></i>Dernière: ${this.formatDate(
                              task.lastRun
                            )}</span>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="retro-btn" onclick="runTask('${
                          task.name
                        }')">
                            <i class="fas fa-play me-1"></i>Exécuter
                        </button>
                        <button class="retro-btn retro-btn-secondary" onclick="editTask('${
                          task.name
                        }')">
                            <i class="fas fa-edit me-1"></i>Modifier
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    tasksList.innerHTML = tasksHtml;
  }

  // ===== CONFIGURATION =====

  async loadConfiguration() {
    try {
      // Charger la configuration depuis le localStorage ou utiliser les valeurs par défaut
      const savedConfig = localStorage.getItem("mcpConfig");
      const config = savedConfig ? JSON.parse(savedConfig) : this.defaultConfig;

      // Appliquer la configuration aux formulaires
      this.applyConfigurationToForm(config);
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
      this.showToast("Erreur lors du chargement de la configuration", "error");
    }
  }

  applyConfigurationToForm(config) {
    // Nettoyage des utilisateurs
    document.getElementById("cleanupUsersEnabled").checked =
      config.cleanupUsers.enabled;
    document.getElementById("cleanupUsersSchedule").value =
      config.cleanupUsers.schedule;

    // Sauvegarde de la base
    document.getElementById("backupDatabaseEnabled").checked =
      config.backupDatabase.enabled;
    document.getElementById("backupDatabaseSchedule").value =
      config.backupDatabase.schedule;

    // Optimisation de la base
    document.getElementById("optimizeDatabaseEnabled").checked =
      config.optimizeDatabase.enabled;
    document.getElementById("optimizeDatabaseSchedule").value =
      config.optimizeDatabase.schedule;

    // Vérification de santé
    document.getElementById("healthCheckEnabled").checked =
      config.healthCheck.enabled;
    document.getElementById("healthCheckSchedule").value =
      config.healthCheck.schedule;

    // Nettoyage des logs
    document.getElementById("cleanupLogsEnabled").checked =
      config.cleanupLogs.enabled;
    document.getElementById("cleanupLogsSchedule").value =
      config.cleanupLogs.schedule;

    // Analyse des performances
    document.getElementById("performanceAnalysisEnabled").checked =
      config.performanceAnalysis.enabled;
    document.getElementById("performanceAnalysisSchedule").value =
      config.performanceAnalysis.schedule;

    // Mode test et notifications
    document.getElementById("dryRunEnabled").checked = config.dryRun;
    document.getElementById("notificationsEnabled").checked =
      config.notifications;
  }

  async saveConfiguration() {
    try {
      const config = {
        cleanupUsers: {
          enabled: document.getElementById("cleanupUsersEnabled").checked,
          schedule: document.getElementById("cleanupUsersSchedule").value,
        },
        backupDatabase: {
          enabled: document.getElementById("backupDatabaseEnabled").checked,
          schedule: document.getElementById("backupDatabaseSchedule").value,
        },
        optimizeDatabase: {
          enabled: document.getElementById("optimizeDatabaseEnabled").checked,
          schedule: document.getElementById("optimizeDatabaseSchedule").value,
        },
        healthCheck: {
          enabled: document.getElementById("healthCheckEnabled").checked,
          schedule: document.getElementById("healthCheckSchedule").value,
        },
        cleanupLogs: {
          enabled: document.getElementById("cleanupLogsEnabled").checked,
          schedule: document.getElementById("cleanupLogsSchedule").value,
        },
        performanceAnalysis: {
          enabled: document.getElementById("performanceAnalysisEnabled")
            .checked,
          schedule: document.getElementById("performanceAnalysisSchedule")
            .value,
        },
        dryRun: document.getElementById("dryRunEnabled").checked,
        notifications: document.getElementById("notificationsEnabled").checked,
      };

      // Sauvegarder dans le localStorage
      localStorage.setItem("mcpConfig", JSON.stringify(config));

      // Envoyer au serveur MCP (à implémenter selon votre API)
      await this.sendConfigurationToServer(config);

      this.showToast("Configuration sauvegardée avec succès", "success");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la configuration:", error);
      this.showToast(
        "Erreur lors de la sauvegarde de la configuration",
        "error"
      );
    }
  }

  async sendConfigurationToServer(config) {
    // À implémenter selon votre API MCP
    console.log("Configuration à envoyer au serveur:", config);
  }

  // ===== MONITORING =====

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.showToast("Monitoring démarré", "info");

    // Mettre à jour les métriques immédiatement
    this.updateMonitoringMetrics();

    // Puis toutes les 5 secondes
    this.monitoringInterval = setInterval(() => {
      this.updateMonitoringMetrics();
    }, 5000);
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    clearInterval(this.monitoringInterval);
    this.monitoringInterval = null;

    // Réinitialiser les métriques
    document.getElementById("cpuUsage").textContent = "--";
    document.getElementById("memoryUsage").textContent = "--";
    document.getElementById("diskUsage").textContent = "--";
    document.getElementById("responseTime").textContent = "--";

    this.showToast("Monitoring arrêté", "info");
  }

  async updateMonitoringMetrics() {
    try {
      // Simuler des métriques (à remplacer par de vraies données)
      const cpuUsage = Math.floor(Math.random() * 100);
      const memoryUsage = Math.floor(Math.random() * 100);
      const diskUsage = Math.floor(Math.random() * 100);
      const responseTime = Math.floor(Math.random() * 200) + 50;

      document.getElementById("cpuUsage").textContent = `${cpuUsage}%`;
      document.getElementById("memoryUsage").textContent = `${memoryUsage}%`;
      document.getElementById("diskUsage").textContent = `${diskUsage}%`;
      document.getElementById("responseTime").textContent = `${responseTime}ms`;

      // Changer la couleur selon les seuils
      this.updateMetricColor("cpuUsage", cpuUsage, 80, 60);
      this.updateMetricColor("memoryUsage", memoryUsage, 85, 70);
      this.updateMetricColor("diskUsage", diskUsage, 90, 75);
      this.updateMetricColor("responseTime", responseTime, 150, 100);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des métriques de monitoring:",
        error
      );
    }
  }

  updateMetricColor(metricId, value, warningThreshold, criticalThreshold) {
    const element = document.getElementById(metricId);
    if (!element) return;

    element.style.color =
      value >= criticalThreshold
        ? "#e17055"
        : value >= warningThreshold
        ? "#fdcb6e"
        : "#6c5ce7";
  }

  // ===== LOGS =====

  async refreshLogs() {
    try {
      const logsContainer = document.getElementById("logsContainer");
      logsContainer.innerHTML =
        '<div class="retro-loading"><div class="spinner-border" role="status"></div><p class="mt-2">Chargement des logs...</p></div>';

      // Simuler des logs (à remplacer par de vraies données)
      const logs = [
        {
          timestamp: new Date(),
          level: "info",
          message: "Tâche de nettoyage des utilisateurs terminée avec succès",
          details: "5 utilisateurs inactifs supprimés",
        },
        {
          timestamp: new Date(Date.now() - 60000),
          level: "warning",
          message: "Temps de réponse élevé détecté",
          details: "Base de données: 2.5s (seuil: 1s)",
        },
        {
          timestamp: new Date(Date.now() - 120000),
          level: "info",
          message: "Sauvegarde de la base de données terminée",
          details: "Taille: 45.2 MB, Durée: 1m 23s",
        },
        {
          timestamp: new Date(Date.now() - 300000),
          level: "error",
          message: "Échec de la tâche d'optimisation",
          details: "Timeout après 5 minutes",
        },
        {
          timestamp: new Date(Date.now() - 600000),
          level: "info",
          message: "Vérification de santé du système",
          details: "Tous les services sont opérationnels",
        },
      ];

      this.displayLogs(logs);
    } catch (error) {
      console.error("Erreur lors du chargement des logs:", error);
      this.showToast("Erreur lors du chargement des logs", "error");
    }
  }

  displayLogs(logs) {
    const logsContainer = document.getElementById("logsContainer");
    const logLevelFilter = document.getElementById("logLevelFilter").value;

    let filteredLogs = logs;
    if (logLevelFilter !== "all") {
      filteredLogs = logs.filter((log) => log.level === logLevelFilter);
    }

    if (filteredLogs.length === 0) {
      logsContainer.innerHTML =
        '<div class="text-center py-4"><i class="fas fa-info-circle fa-2x mb-3" style="color: var(--retro-accent);"></i><p style="color: var(--retro-accent);">Aucun log disponible</p></div>';
      return;
    }

    const logsHtml = filteredLogs
      .map(
        (log) => `
            <div class="retro-task" style="border-left: 4px solid ${
              log.level === "error"
                ? "#ff4444"
                : log.level === "warning"
                ? "#ff6b35"
                : "#00ff41"
            };">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-1">
                            <span class="retro-badge" style="background: ${
                              log.level === "error"
                                ? "#ff4444"
                                : log.level === "warning"
                                ? "#ff6b35"
                                : "#00ff41"
                            };">${log.level.toUpperCase()}</span>
                            <small style="color: var(--retro-accent);">${this.formatDate(
                              log.timestamp
                            )}</small>
                        </div>
                        <div class="fw-bold" style="color: var(--retro-text);">${
                          log.message
                        }</div>
                        ${
                          log.details
                            ? `<div style="color: var(--retro-accent); font-size: 0.85rem;">${log.details}</div>`
                            : ""
                        }
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    logsContainer.innerHTML = logsHtml;
  }

  getLogLevelColor(level) {
    const colors = {
      info: "success",
      warning: "warning",
      error: "danger",
    };
    return colors[level] || "secondary";
  }

  // ===== ACTIONS RAPIDES =====

  async runUserCleanup() {
    try {
      this.showToast("Démarrage du nettoyage des utilisateurs...", "info");

      // Appeler l'API MCP pour exécuter la tâche
      const response = await this.makeRequest("/tools/user-cleanup", {
        method: "POST",
        body: JSON.stringify({ dryRun: true }),
      });

      if (response.ok) {
        const result = await response.json();
        this.showToast(`Nettoyage terminé: ${result.message}`, "success");
      } else {
        throw new Error("Échec de l'exécution de la tâche");
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage des utilisateurs:", error);
      this.showToast("Erreur lors du nettoyage des utilisateurs", "error");
    }
  }

  async runDatabaseBackup() {
    try {
      this.showToast("Démarrage de la sauvegarde de la base...", "info");

      // Appeler l'API MCP pour exécuter la tâche
      const response = await this.makeRequest("/tools/database-backup", {
        method: "POST",
        body: JSON.stringify({
          includeCollections: ["users", "games", "tournaments"],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        this.showToast(`Sauvegarde terminée: ${result.message}`, "success");
      } else {
        throw new Error("Échec de l'exécution de la tâche");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la base:", error);
      this.showToast("Erreur lors de la sauvegarde de la base", "error");
    }
  }

  async runDatabaseOptimization() {
    try {
      this.showToast("Démarrage de l'optimisation de la base...", "info");

      // Appeler l'API MCP pour exécuter la tâche
      const response = await this.makeRequest("/tools/database-optimization", {
        method: "POST",
        body: JSON.stringify({ analyze: true, compact: true }),
      });

      if (response.ok) {
        const result = await response.json();
        this.showToast(`Optimisation terminée: ${result.message}`, "success");
      } else {
        throw new Error("Échec de l'exécution de la tâche");
      }
    } catch (error) {
      console.error("Erreur lors de l'optimisation de la base:", error);
      this.showToast("Erreur lors de l'optimisation de la base", "error");
    }
  }

  async runHealthCheck() {
    try {
      this.showToast("Vérification de la santé du système...", "info");

      // Appeler l'API MCP pour exécuter la tâche
      const response = await this.makeRequest("/tools/health-check", {
        method: "POST",
        body: JSON.stringify({ comprehensive: true }),
      });

      if (response.ok) {
        const result = await response.json();
        this.showToast(`Vérification terminée: ${result.message}`, "success");
      } else {
        throw new Error("Échec de l'exécution de la tâche");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de santé:", error);
      this.showToast("Erreur lors de la vérification de santé", "error");
    }
  }

  // ===== GESTION DU SERVEUR MCP =====

  async startMCPServer() {
    try {
      this.showToast("Démarrage du serveur MCP...", "info");

      // En production, vous devriez appeler une API pour démarrer le serveur
      // Pour l'instant, on simule le démarrage
      setTimeout(() => {
        this.checkServerStatus();
        this.showToast("Serveur MCP démarré avec succès", "success");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors du démarrage du serveur MCP:", error);
      this.showToast("Erreur lors du démarrage du serveur MCP", "error");
    }
  }

  async stopMCPServer() {
    try {
      this.showToast("Arrêt du serveur MCP...", "info");

      // En production, vous devriez appeler une API pour arrêter le serveur
      // Pour l'instant, on simule l'arrêt
      setTimeout(() => {
        this.checkServerStatus();
        this.showToast("Serveur MCP arrêté avec succès", "success");
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'arrêt du serveur MCP:", error);
      this.showToast("Erreur lors de l'arrêt du serveur MCP", "error");
    }
  }

  // ===== UTILITAIRES =====

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatDate(dateString) {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  showToast(message, type = "info") {
    const toastContainer = document.querySelector(".toast-container");

    const toast = document.createElement("div");
    toast.className = `toast show`;
    toast.style.cssText = `
      background: var(--retro-dark) !important;
      border: 2px solid var(--retro-primary) !important;
      color: var(--retro-text) !important;
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.3) !important;
    `;

    toast.innerHTML = `
            <div class="toast-body">
                <i class="fas fa-${this.getToastIcon(
                  type
                )} me-2" style="color: ${
      type === "success"
        ? "var(--retro-primary)"
        : type === "error"
        ? "#ff4444"
        : type === "warning"
        ? "#ff6b35"
        : "var(--retro-accent)"
    };"></i>
                ${message}
            </div>
        `;

    toastContainer.appendChild(toast);

    // Supprimer le toast après 5 secondes
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  getToastColor(type) {
    const colors = {
      success: "success",
      error: "danger",
      warning: "warning",
      info: "primary",
    };
    return colors[type] || "primary";
  }

  getToastIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-triangle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    return icons[type] || "info-circle";
  }
}

// ===== FONCTIONS GLOBALES =====

let mcpAdmin;

// Initialisation
document.addEventListener("DOMContentLoaded", function () {
  mcpAdmin = new MCPAdmin();
});

// Fonctions globales pour les boutons
function refreshAllData() {
  mcpAdmin.checkServerStatus();
  mcpAdmin.refreshTasks();
  mcpAdmin.refreshLogs();
}

function checkServerStatus() {
  mcpAdmin.checkServerStatus();
}

function startMCPServer() {
  mcpAdmin.startMCPServer();
}

function stopMCPServer() {
  mcpAdmin.stopMCPServer();
}

function refreshTasks() {
  mcpAdmin.refreshTasks();
}

function refreshLogs() {
  mcpAdmin.refreshLogs();
}

function loadConfiguration() {
  mcpAdmin.loadConfiguration();
}

function saveConfiguration() {
  mcpAdmin.saveConfiguration();
}

function startMonitoring() {
  mcpAdmin.startMonitoring();
}

function stopMonitoring() {
  mcpAdmin.stopMonitoring();
}

function runUserCleanup() {
  mcpAdmin.runUserCleanup();
}

function runDatabaseBackup() {
  mcpAdmin.runDatabaseBackup();
}

function runDatabaseOptimization() {
  mcpAdmin.runDatabaseOptimization();
}

function runHealthCheck() {
  mcpAdmin.runHealthCheck();
}

function runTask(taskName) {
  mcpAdmin.showToast(`Exécution de la tâche: ${taskName}`, "info");
  // Implémenter l'exécution de la tâche selon votre API
}

function editTask(taskName) {
  mcpAdmin.showToast(`Édition de la tâche: ${taskName}`, "info");
  // Implémenter l'édition de la tâche selon votre API
}
