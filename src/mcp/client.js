const WebSocket = require("ws");

class MCPClient {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Ajouter le token à l'URL WebSocket
        const wsUrl = new URL(this.url);
        wsUrl.searchParams.set("token", this.token);

        this.ws = new WebSocket(wsUrl.toString());

        this.ws.on("open", () => {
          console.log("🔌 Connecté au serveur MCP");
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.ws.on("message", (data) => {
          try {
            const message = JSON.parse(data);
            this.handleMessage(message);
          } catch (error) {
            console.error("❌ Erreur lors du parsing du message:", error);
          }
        });

        this.ws.on("error", (error) => {
          console.error("❌ Erreur WebSocket:", error);
          this.connected = false;
          reject(error);
        });

        this.ws.on("close", (code, reason) => {
          console.log(`🔌 Déconnecté du serveur MCP: ${code} - ${reason}`);
          this.connected = false;

          // Tentative de reconnexion automatique
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(
              `🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
            );

            setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        });

        // Timeout de connexion
        setTimeout(() => {
          if (!this.connected) {
            this.ws.close();
            reject(new Error("Timeout de connexion"));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  handleMessage(message) {
    switch (message.type) {
      case "welcome":
        console.log("🎉 Message de bienvenue reçu:", message.message);
        console.log("🔐 Authentifié en tant que:", message.authenticatedAs);
        console.log("👑 Rôle:", message.role);
        break;

      case "tool_result":
        const requestId = message.requestId;
        if (this.pendingRequests.has(requestId)) {
          const { resolve, reject } = this.pendingRequests.get(requestId);
          this.pendingRequests.delete(requestId);

          if (message.result && message.result.error) {
            reject(new Error(message.result.error));
          } else {
            resolve(message.result);
          }
        }
        break;

      case "error":
        console.error(`❌ Erreur MCP: ${message.error} - ${message.details}`);
        // Traiter les erreurs de requêtes en attente
        this.pendingRequests.forEach(({ reject }, requestId) => {
          reject(new Error(message.error));
        });
        this.pendingRequests.clear();
        break;

      default:
        console.log("📨 Message reçu:", message);
    }
  }

  async callTool(toolName, params = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket non connecté");
    }

    const requestId = ++this.requestId;

    return new Promise((resolve, reject) => {
      const message = {
        type: "tool_call",
        tool: toolName,
        params,
        requestId,
      };

      // Stocker la promesse en attente
      this.pendingRequests.set(requestId, { resolve, reject });

      // Timeout pour éviter les blocages
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Timeout pour l'outil ${toolName}`));
        }
      }, 30000); // 30 secondes

      // Intercepter la résolution pour nettoyer le timeout
      const originalResolve = resolve;
      resolve = (value) => {
        clearTimeout(timeout);
        originalResolve(value);
      };

      try {
        this.ws.send(JSON.stringify(message));
        console.log(`🛠️  Appel de l'outil ${toolName}:`, params);
      } catch (error) {
        this.pendingRequests.delete(requestId);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  ping() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket non connecté");
    }

    const message = {
      type: "ping",
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.connected = false;
    this.pendingRequests.clear();
  }

  isConnected() {
    return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Méthodes utilitaires pour les scripts de maintenance
  async healthCheck() {
    try {
      const result = await this.callTool("get_database_status", {
        includeStats: true,
      });
      return result;
    } catch (error) {
      throw new Error(`Vérification de santé échouée: ${error.message}`);
    }
  }

  async getSystemInfo() {
    try {
      const result = await this.callTool("get_system_info", {
        includePerformance: true,
      });
      return result;
    } catch (error) {
      throw new Error(
        `Récupération des infos système échouée: ${error.message}`
      );
    }
  }

  async backupDatabase(collections = null, backupName = null) {
    try {
      const result = await this.callTool("backup_database", {
        includeCollections: collections,
        backupName,
      });
      return result;
    } catch (error) {
      throw new Error(`Sauvegarde de la base échouée: ${error.message}`);
    }
  }

  async optimizeDatabase(operations = ["reindex", "validate"]) {
    try {
      const result = await this.callTool("optimize_database", { operations });
      return result;
    } catch (error) {
      throw new Error(`Optimisation de la base échouée: ${error.message}`);
    }
  }

  // Méthodes pour la gestion des utilisateurs
  async listUsers(page = 1, limit = 100, role = null) {
    try {
      const params = { page, limit };
      if (role) params.role = role;

      const result = await this.callTool("list_users", params);
      return result;
    } catch (error) {
      throw new Error(`Liste des utilisateurs échouée: ${error.message}`);
    }
  }

  async deleteUser(userId) {
    try {
      const result = await this.callTool("delete_user", { userId });
      return result;
    } catch (error) {
      throw new Error(`Suppression de l'utilisateur échouée: ${error.message}`);
    }
  }

  async updateUser(userId, updates) {
    try {
      const result = await this.callTool("update_user", { userId, updates });
      return result;
    } catch (error) {
      throw new Error(`Mise à jour de l'utilisateur échouée: ${error.message}`);
    }
  }

  // Méthodes pour la gestion des jeux
  async listGames(page = 1, limit = 100, genre = null, search = null) {
    try {
      const params = { page, limit };
      if (genre) params.genre = genre;
      if (search) params.search = search;

      const result = await this.callTool("list_games", params);
      return result;
    } catch (error) {
      throw new Error(`Liste des jeux échouée: ${error.message}`);
    }
  }

  async getGameStats(includeGenres = true) {
    try {
      const result = await this.callTool("get_game_stats", { includeGenres });
      return result;
    } catch (error) {
      throw new Error(`Statistiques des jeux échouées: ${error.message}`);
    }
  }

  // Méthodes pour la gestion des tournois
  async listTournaments(page = 1, limit = 100, status = null) {
    try {
      const params = { page, limit };
      if (status) params.status = status;

      const result = await this.callTool("list_tournaments", params);
      return result;
    } catch (error) {
      throw new Error(`Liste des tournois échouée: ${error.message}`);
    }
  }

  // Méthodes pour l'authentification
  async authenticateUser(email, password) {
    try {
      const result = await this.callTool("authenticate_user", {
        email,
        password,
      });
      return result;
    } catch (error) {
      throw new Error(`Authentification échouée: ${error.message}`);
    }
  }

  async checkPermissions(userId, requiredRole, action) {
    try {
      const result = await this.callTool("check_permissions", {
        userId,
        requiredRole,
        action,
      });
      return result;
    } catch (error) {
      throw new Error(`Vérification des permissions échouée: ${error.message}`);
    }
  }
}

module.exports = MCPClient;
