/**
 * Middleware d'Intégration MCP
 * Gère l'intégration progressive des fonctionnalités MCP
 */

const mcpIntegration = {
  // Vérification des capacités MCP
  checkMCPCapabilities: (capabilities) => {
    return async (req, res, next) => {
      try {
        if (req.mcpClient) {
          const availableCapabilities = await req.mcpClient.getCapabilities();
          req.mcpEnabled = capabilities.every((cap) =>
            availableCapabilities.includes(cap)
          );
        } else {
          req.mcpEnabled = false;
        }
      } catch (error) {
        req.mcpEnabled = false;
      }
      next();
    };
  },

  // Fallback automatique
  gracefulFallback: (feature) => {
    return async (req, res, next) => {
      try {
        if (req.mcpEnabled) {
          await feature(req, res, next);
        } else {
          // Utiliser la version classique
          next();
        }
      } catch (error) {
        console.log(`Fallback pour ${feature.name}:`, error.message);
        next();
      }
    };
  },

  // Initialisation du client MCP
  initMCPClient: () => {
    return async (req, res, next) => {
      try {
        const { MCPClient } = require("../mcp/client");
        req.mcpClient = new MCPClient();
        await req.mcpClient.connect();
      } catch (error) {
        console.log("MCP Client non disponible:", error.message);
        req.mcpClient = null;
      }
      next();
    };
  },
};

module.exports = mcpIntegration;
