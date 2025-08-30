/**
 * Service MCP Unifié
 * Gère les appels intelligents vers les outils MCP
 */

class MCPService {
  constructor() {
    this.client = null;
    this.cache = new Map();
    this.init();
  }

  async init() {
    try {
      const MCPClient = require("../mcp/client");
      this.client = new MCPClient("ws://localhost:3002", "admin-token");
      await this.client.connect();
    } catch (error) {
      console.log("MCP Service non disponible:", error.message);
    }
  }

  // Appel intelligent avec cache
  async intelligentCall(tool, method, params) {
    if (!this.client) {
      throw new Error("MCP Client non disponible");
    }

    const cacheKey = `${tool}.${method}.${JSON.stringify(params)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.client.call(tool, method, params);
    this.cache.set(cacheKey, result);

    return result;
  }

  // Fallback automatique
  async callWithFallback(tool, method, params, fallback) {
    try {
      return await this.intelligentCall(tool, method, params);
    } catch (error) {
      console.log(`Fallback pour ${tool}.${method}:`, error.message);
      return fallback(params);
    }
  }

  // Vérification des capacités
  async getCapabilities() {
    if (!this.client) {
      return [];
    }

    try {
      return await this.client.getCapabilities();
    } catch (error) {
      return [];
    }
  }

  // Nettoyage du cache
  clearCache() {
    this.cache.clear();
  }
}

module.exports = MCPService;
