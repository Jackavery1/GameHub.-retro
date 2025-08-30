const crypto = require("crypto");

class MCPAuthMiddleware {
  constructor() {
    this.adminTokens = new Map(); // Map des tokens actifs
    this.tokenExpiry = 24 * 60 * 60 * 1000; // 24 heures
    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredTokens(),
      60 * 60 * 1000
    ); // Nettoyage toutes les heures
  }

  // Générer un token admin simple (sans base de données)
  async generateAdminToken(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + this.tokenExpiry;

    this.adminTokens.set(token, {
      userId,
      expiry,
      createdAt: Date.now(),
    });

    console.log(`🎫 Token MCP généré pour l'utilisateur ${userId}`);
    return token;
  }

  // Vérifier un token admin
  authenticateAdmin(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Token manquant",
          message: "Token d'authentification requis",
        });
      }

      const token = authHeader.substring(7); // Enlever "Bearer "
      const tokenData = this.adminTokens.get(token);

      if (!tokenData) {
        return res.status(401).json({
          error: "Token invalide",
          message: "Token d'authentification invalide ou expiré",
        });
      }

      if (Date.now() > tokenData.expiry) {
        this.adminTokens.delete(token);
        return res.status(401).json({
          error: "Token expiré",
          message: "Token d'authentification expiré",
        });
      }

      // Ajouter les informations de l'utilisateur à la requête
      req.adminUser = {
        id: tokenData.userId,
        name: "Admin", // Nom par défaut
        role: "admin",
      };

      next();
    } catch (error) {
      console.error("❌ Erreur d'authentification MCP:", error);
      return res.status(500).json({
        error: "Erreur d'authentification",
        message: "Erreur lors de la vérification du token",
      });
    }
  }

  // Authentification WebSocket
  async authenticateWebSocket(ws, token) {
    try {
      const tokenData = this.adminTokens.get(token);

      if (!tokenData) {
        return {
          isValid: false,
          error: "Token invalide",
        };
      }

      if (Date.now() > tokenData.expiry) {
        this.adminTokens.delete(token);
        return {
          isValid: false,
          error: "Token expiré",
        };
      }

      return {
        isValid: true,
        user: {
          id: tokenData.userId,
          name: "Admin",
          role: "admin",
        },
      };
    } catch (error) {
      console.error("❌ Erreur d'authentification WebSocket MCP:", error);
      return {
        isValid: false,
        error: "Erreur d'authentification",
      };
    }
  }

  // Révoquer un token
  async revokeAdminToken(token) {
    try {
      const deleted = this.adminTokens.delete(token);
      console.log(`🗑️ Token MCP révoqué: ${deleted ? "succès" : "non trouvé"}`);
      return deleted;
    } catch (error) {
      console.error("❌ Erreur lors de la révocation du token:", error);
      return false;
    }
  }

  // Nettoyer les tokens expirés
  cleanupExpiredTokens() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, data] of this.adminTokens.entries()) {
      if (now > data.expiry) {
        this.adminTokens.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 ${cleanedCount} tokens MCP expirés nettoyés`);
    }
  }

  // Obtenir le nombre de tokens actifs
  getActiveTokensCount() {
    return this.adminTokens.size;
  }

  // Obtenir la durée de vie des tokens
  getTokenExpiry() {
    return this.tokenExpiry;
  }
}

module.exports = MCPAuthMiddleware;
