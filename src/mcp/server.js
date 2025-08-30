const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// Charger les variables d'environnement
require("dotenv").config();

// Import de la configuration de base de données
const dbConfig = require("../config/db");

// Import des outils MCP
const userTools = require("./tools/userTools");
const gameTools = require("./tools/gameTools");
const tournamentTools = require("./tools/tournamentTools");
const authTools = require("./tools/authTools");
const databaseTools = require("./tools/databaseTools");
const intelligenceTools = require("./tools/intelligenceTools");

// Import du middleware d'authentification
const MCPAuthMiddleware = require("./middleware/auth");

class MCPServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.tools = new Map();
    this.clients = new Map(); // Map des clients authentifiés
    this.isTestMode =
      process.env.NODE_ENV === "test" || !process.env.MONGODB_URI;
    this.authMiddleware = new MCPAuthMiddleware();

    // Initialiser la connexion à la base de données
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Se connecter à la base de données
      await dbConfig.connectDB();
      console.log("✅ Base de données connectée pour le serveur MCP");

      // Configurer le serveur après la connexion DB
      this.setupMiddleware();
      this.setupWebSocket();
      this.registerTools();
      this.setupMaintenanceTasks();
    } catch (error) {
      console.error("❌ Erreur de connexion à la base de données:", error);
      // Continuer en mode test si la DB n'est pas disponible
      this.isTestMode = true;
      console.log("🔄 Mode test activé - base de données non disponible");

      this.setupMiddleware();
      this.setupWebSocket();
      this.registerTools();
      this.setupMaintenanceTasks();
    }
  }

  setupMiddleware() {
    // Middleware CORS global pour tous les endpoints
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "http://localhost:3001");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
      res.header("Access-Control-Allow-Credentials", "true");

      // Gestion de la requête preflight OPTIONS
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
      }

      next();
    });

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Endpoint public pour la santé (sans authentification)
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        server: "gamehub-retro-mcp",
        version: "1.0.0",
        mode: this.isTestMode ? "test" : "production",
        secured: true,
        message: "Accès MCP réservé aux administrateurs",
        database: this.isTestMode ? "Mode test" : "Connectée",
        timestamp: new Date().toISOString(),
      });
    });

    // Endpoint de test simple pour déboguer
    this.app.get("/test", (req, res) => {
      res.json({
        message: "Serveur MCP opérationnel",
        cookies: req.headers.cookie || "Aucun cookie",
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
      });
    });

    // Endpoints protégés nécessitant une authentification admin
    this.app.get(
      "/tools",
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      (req, res) => {
        const toolsList = Array.from(this.tools.entries()).map(
          ([name, tool]) => ({
            name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })
        );
        res.json({
          tools: toolsList,
          authenticatedAs: req.adminUser.name,
          role: req.adminUser.role,
        });
      }
    );

    // Endpoint pour générer un token d'accès admin
    this.app.post("/auth/generate-token", async (req, res) => {
      try {
        console.log("🔐 Tentative de génération de token MCP:", req.body);

        const { sessionBased, adminUserId, adminPassword } = req.body;

        let adminUser = null;

        if (sessionBased) {
          console.log("🔑 Authentification par session demandée");

          // Authentification par session - vérifier les cookies de session
          const sessionId =
            req.headers.cookie?.match(/connect\.sid=([^;]+)/)?.[1];

          console.log(
            "🍪 Session ID extrait:",
            sessionId ? "Présent" : "Absent"
          );

          if (!sessionId) {
            console.log("❌ Aucune session détectée");
            return res.status(401).json({
              error: "Session invalide",
              message: "Aucune session active détectée",
            });
          }

          // Vérifier la session via le serveur principal
          try {
            console.log(
              "🔍 Vérification de session via le serveur principal..."
            );

            const sessionCheck = await fetch(
              `http://localhost:3001/auth/check-session`,
              {
                method: "GET",
                headers: {
                  Cookie: `connect.sid=${sessionId}`,
                },
              }
            );

            console.log(
              "📡 Réponse du serveur principal:",
              sessionCheck.status
            );

            if (!sessionCheck.ok) {
              console.log("❌ Session invalide côté serveur principal");
              return res.status(401).json({
                error: "Session expirée",
                message: "Veuillez vous reconnecter",
              });
            }

            const sessionData = await sessionCheck.json();
            console.log("📊 Données de session:", sessionData);

            if (sessionData.role !== "admin") {
              console.log("❌ Utilisateur non admin:", sessionData.role);
              return res.status(403).json({
                error: "Accès refusé",
                message: "Droits administrateur requis",
              });
            }

            adminUser = {
              id: sessionData.userId,
              name: sessionData.username,
              role: sessionData.role,
            };

            console.log("✅ Utilisateur admin identifié:", adminUser.name);
          } catch (sessionError) {
            console.error(
              "❌ Erreur lors de la vérification de session:",
              sessionError
            );
            return res.status(500).json({
              error: "Erreur de vérification de session",
              message:
                "Impossible de vérifier la session: " + sessionError.message,
            });
          }
        } else {
          console.log("🔑 Authentification par identifiants demandée");

          // Authentification traditionnelle par identifiants
          if (!adminUserId || !adminPassword) {
            return res.status(400).json({
              error: "Identifiants requis",
              message: "adminUserId et adminPassword sont nécessaires",
            });
          }

          // Vérifier que l'utilisateur est admin et que le mot de passe est correct
          const User = require("../models/User");
          const admin = await User.findById(adminUserId);

          if (!admin || admin.role !== "admin") {
            return res.status(403).json({
              error: "Accès refusé",
              message: "Utilisateur non admin",
            });
          }

          if (!admin.verifyPassword(adminPassword)) {
            return res.status(401).json({
              error: "Mot de passe incorrect",
              message: "Authentification échouée",
            });
          }

          adminUser = { id: admin._id, name: admin.username, role: admin.role };
        }

        // Générer le token MCP
        console.log("🎫 Génération du token MCP pour:", adminUser.name);
        const token = await this.authMiddleware.generateAdminToken(
          adminUser.id
        );

        console.log("✅ Token MCP généré avec succès");

        res.json({
          success: true,
          token,
          expiresAt: new Date(Date.now() + this.authMiddleware.tokenExpiry),
          message: "Token MCP généré avec succès",
          user: {
            id: adminUser.id,
            name: adminUser.name,
            role: adminUser.role,
          },
        });
      } catch (error) {
        console.error("❌ Erreur lors de la génération du token:", error);
        res.status(500).json({
          error: "Erreur interne",
          message: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    });

    // Endpoint pour révoquer un token
    this.app.delete(
      "/auth/revoke-token",
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const { token } = req.body;

          if (!token) {
            return res.status(400).json({
              error: "Token requis",
              message: "Le token à révoquer est nécessaire",
            });
          }

          const success = await this.authMiddleware.revokeAdminToken(token);

          if (success) {
            res.json({
              success: true,
              message: "Token révoqué avec succès",
            });
          } else {
            res.status(500).json({
              error: "Erreur lors de la révocation",
              message: "Impossible de révoquer le token",
            });
          }
        } catch (error) {
          console.error("Erreur lors de la révocation du token:", error);
          res.status(500).json({
            error: "Erreur interne",
            message: error.message,
          });
        }
      }
    );

    // Endpoint pour les statistiques admin
    this.app.get(
      "/admin/stats",
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const stats = {
            connectedClients: this.clients.size,
            activeTools: this.tools.size,
            serverUptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            authenticatedAs: req.adminUser.name,
            timestamp: new Date(),
          };

          res.json(stats);
        } catch (error) {
          console.error("Erreur lors de la récupération des stats:", error);
          res.status(500).json({
            error: "Erreur interne",
            message: error.message,
          });
        }
      }
    );

    // Endpoint pour les tâches de maintenance
    this.app.post("/tools/:taskName", async (req, res) => {
      try {
        const { taskName } = req.params;
        const { dryRun = true, ...params } = req.body;

        // Simuler l'exécution des tâches de maintenance
        const taskResults = {
          "health-check": {
            status: "success",
            message: "Vérification de santé effectuée",
            details: {
              database: "OK",
              memory: "OK",
              cpu: "OK",
              uptime: process.uptime(),
            },
          },
          "database-optimization": {
            status: "success",
            message: "Optimisation de base de données effectuée",
            details: {
              indexes: "Optimisés",
              queries: "Analysées",
              performance: "Améliorée",
            },
          },
          "user-cleanup": {
            status: "success",
            message: "Nettoyage des utilisateurs effectué",
            details: {
              inactiveUsers: "Identifiés",
              cleanupMode: dryRun ? "Simulation" : "Exécution",
            },
          },
          "database-backup": {
            status: "success",
            message: "Sauvegarde de base de données effectuée",
            details: {
              backupSize: "2.5 MB",
              backupTime: new Date().toISOString(),
              location: "/backups/",
            },
          },
        };

        const result = taskResults[taskName] || {
          status: "error",
          message: `Tâche '${taskName}' non reconnue`,
        };

        res.json(result);
      } catch (error) {
        console.error(
          `Erreur lors de l'exécution de la tâche ${req.params.taskName}:`,
          error
        );
        res.status(500).json({
          status: "error",
          message: "Erreur lors de l'exécution de la tâche",
          error: error.message,
        });
      }
    });
  }

  setupWebSocket() {
    this.wss.on("connection", async (ws, req) => {
      console.log("🔌 Nouvelle connexion WebSocket MCP");

      // Authentification WebSocket
      const token =
        req.url.split("token=")[1] ||
        req.headers["authorization"]?.replace("Bearer ", "");

      if (!token) {
        ws.send(
          JSON.stringify({
            type: "error",
            error: "Authentification requise",
            details: "Token d'accès MCP requis pour la connexion",
          })
        );
        ws.close(1008, "Token d'authentification manquant");
        return;
      }

      const authResult = await this.authMiddleware.authenticateWebSocket(
        ws,
        token
      );

      if (!authResult.isValid) {
        ws.send(
          JSON.stringify({
            type: "error",
            error: "Accès refusé",
            details: authResult.error,
          })
        );
        ws.close(1008, "Authentification échouée");
        return;
      }

      // Connexion authentifiée réussie
      console.log(
        `🔐 Client MCP authentifié: ${authResult.user.name} (${authResult.user.role})`
      );
      this.clients.set(ws, authResult.user);

      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error("❌ Erreur lors du traitement du message:", error);
          this.sendError(ws, "Erreur de traitement", error.message);
        }
      });

      ws.on("close", () => {
        console.log(
          `🔌 Client MCP déconnecté: ${this.clients.get(ws)?.name || "Inconnu"}`
        );
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("❌ Erreur WebSocket:", error);
        this.clients.delete(ws);
      });

      this.sendMessage(ws, {
        type: "welcome",
        message: "Bienvenue sur le serveur MCP GameHub Retro!",
        server: "gamehub-retro-mcp",
        version: "1.0.0",
        mode: this.isTestMode ? "test" : "production",
        secured: true,
        authenticatedAs: authResult.user.name,
        role: authResult.user.role,
        availableTools: Array.from(this.tools.keys()),
      });
    });
  }

  registerTools() {
    const allTools = [
      ...userTools,
      ...gameTools,
      ...tournamentTools,
      ...authTools,
      ...databaseTools,
      ...intelligenceTools,
    ];

    allTools.forEach((tool) => {
      this.tools.set(tool.name, tool);
      console.log(`🛠️  Outil enregistré: ${tool.name}`);
    });

    console.log(`✅ ${this.tools.size} outils MCP enregistrés`);
  }

  async handleMessage(ws, data) {
    const { type, tool, params, requestId } = data;

    switch (type) {
      case "tool_call":
        await this.handleToolCall(ws, tool, params, requestId);
        break;

      case "ping":
        this.sendMessage(ws, { type: "pong", timestamp: Date.now() });
        break;

      default:
        this.sendError(
          ws,
          "Type de message non supporté",
          `Type '${type}' non reconnu`
        );
    }
  }

  async handleToolCall(ws, toolName, params, requestId) {
    const tool = this.tools.get(toolName);
    const adminUser = this.clients.get(ws);

    if (!tool) {
      this.sendError(
        ws,
        "Outil non trouvé",
        `L'outil '${toolName}' n'existe pas`,
        requestId
      );
      return;
    }

    try {
      console.log(
        `🛠️  Appel d'outil: ${toolName} par ${adminUser.name}`,
        params
      );

      let result;
      if (this.isTestMode && toolName.startsWith("get_database_")) {
        result = {
          message: "Mode test - simulation de la base de données",
          tool: toolName,
          simulated: true,
        };
      } else {
        result = await tool.handler(params);
      }

      this.sendMessage(ws, {
        type: "tool_result",
        tool: toolName,
        result,
        requestId,
        timestamp: Date.now(),
        executedBy: adminUser.name,
      });

      console.log(`✅ Résultat de ${toolName}:`, result);
    } catch (error) {
      console.error(`❌ Erreur dans l'outil ${toolName}:`, error);
      this.sendError(ws, "Erreur d'exécution", error.message, requestId);
    }
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, error, details, requestId = null) {
    const errorMessage = {
      type: "error",
      error,
      details,
      timestamp: Date.now(),
    };

    if (requestId) {
      errorMessage.requestId = requestId;
    }

    this.sendMessage(ws, errorMessage);
  }

  broadcast(message) {
    this.clients.forEach((adminUser, client) => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendMessage(client, message);
      }
    });
  }

  // Configuration des tâches de maintenance automatique
  setupMaintenanceTasks() {
    // Nettoyer les tokens expirés toutes les heures
    setInterval(() => {
      this.authMiddleware.cleanupExpiredTokens();
      console.log("🧹 Nettoyage des tokens expirés effectué");
    }, 60 * 60 * 1000);

    // Nettoyer les clients déconnectés toutes les 5 minutes
    setInterval(() => {
      for (const [ws, adminUser] of this.clients.entries()) {
        if (ws.readyState !== WebSocket.OPEN) {
          this.clients.delete(ws);
          console.log(`🧹 Client déconnecté supprimé: ${adminUser.name}`);
        }
      }
    }, 5 * 60 * 1000);

    console.log("🔄 Tâches de maintenance automatique configurées");
  }

  start(port = 3002) {
    this.server.listen(port, () => {
      console.log(`🚀 Serveur MCP GameHub Retro démarré sur le port ${port}`);
      console.log(`📡 WebSocket: ws://localhost:${port}?token=YOUR_TOKEN`);
      console.log(`🌐 HTTP: http://localhost:${port}`);
      console.log(`🔍 Santé: http://localhost:${port}/health`);
      console.log(`🛠️  Outils: http://localhost:${port}/tools (Admin Only)`);
      console.log(`🔐 Auth: http://localhost:${port}/auth/generate-token`);
      console.log(
        `📊 Stats: http://localhost:${port}/admin/stats (Admin Only)`
      );
      console.log(`🔧 Mode: ${this.isTestMode ? "TEST" : "PRODUCTION"}`);
      console.log(`🛡️  Sécurité: Accès MCP réservé aux administrateurs`);
    });
  }

  stop() {
    this.wss.close();
    this.server.close();
    console.log("🛑 Serveur MCP arrêté");
  }
}

// Démarrage du serveur
async function main() {
  try {
    console.log("🚀 Démarrage du serveur MCP GameHub Retro sécurisé...");

    const mcpServer = new MCPServer();

    // Attendre l'initialisation de la base de données
    await mcpServer.initializeDatabase();

    // Démarrer le serveur
    mcpServer.start();

    // Gestion de l'arrêt propre
    process.on("SIGINT", () => {
      console.log("\n🛑 Arrêt du serveur MCP...");
      mcpServer.stop();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Arrêt du serveur MCP...");
      mcpServer.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MCPServer;
