class MCPEmulatorService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.sessionId = null;
    this.currentEmulator = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  async connect() {
    try {
      console.log("🔌 Connexion au service MCP Emulator...");

      this.ws = new WebSocket("ws://localhost:3002");

      this.ws.onopen = () => {
        console.log("✅ Connecté au service MCP Emulator");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log("🔌 Déconnecté du service MCP Emulator");
        this.isConnected = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("❌ Erreur WebSocket MCP:", error);
      };
    } catch (error) {
      console.error("❌ Erreur de connexion MCP:", error);
      this.handleReconnect();
    }
  }

  async authenticate() {
    try {
      const response = await fetch("/api/mcp/auth/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionBased: true }),
      });

      const authData = await response.json();

      if (authData.success && authData.token) {
        this.sendMessage({
          type: "authenticate",
          token: authData.token,
        });
      } else {
        console.error("❌ Échec de l'authentification MCP");
      }
    } catch (error) {
      console.error("❌ Erreur d'authentification MCP:", error);
    }
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case "authenticated":
        console.log("✅ Authentifié au service MCP Emulator");
        this.sessionId = data.sessionId;
        break;

      case "tool_result":
        this.handleToolResult(data);
        break;

      case "error":
        console.error("❌ Erreur MCP:", data.error);
        break;

      default:
        console.log("📨 Message MCP reçu:", data);
    }
  }

  handleToolResult(data) {
    const { tool, result, requestId } = data;

    if (result.error) {
      console.error(`❌ Erreur dans l'outil ${tool}:`, result.error);
      this.showNotification(`Erreur: ${result.error}`, "error");
    } else {
      console.log(`✅ Résultat de ${tool}:`, result);
      this.handleEmulatorResult(tool, result);
    }
  }

  handleEmulatorResult(tool, result) {
    switch (tool) {
      case "load_emulator":
        this.onEmulatorLoaded(result);
        break;

      case "upload_rom":
        this.onROMUploaded(result);
        break;

      case "save_game_state":
        this.onGameStateSaved(result);
        break;

      case "load_game_state":
        this.onGameStateLoaded(result);
        break;

      case "get_emulator_performance":
        this.onPerformanceReceived(result);
        break;

      case "list_available_roms":
        this.onROMsListed(result);
        break;
    }
  }

  async loadEmulator(emulatorType, romPath = null, config = {}) {
    if (!this.isConnected) {
      throw new Error("Service MCP non connecté");
    }

    const requestId = this.generateRequestId();

    this.sendMessage({
      type: "tool_call",
      tool: "load_emulator",
      params: { emulatorType, romPath, config },
      requestId,
    });

    return new Promise((resolve, reject) => {
      this.pendingRequests = this.pendingRequests || new Map();
      this.pendingRequests.set(requestId, { resolve, reject });

      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error("Timeout de la requête MCP"));
        }
      }, 10000);
    });
  }

  async uploadROM(emulatorType, file) {
    if (!this.isConnected) {
      throw new Error("Service MCP non connecté");
    }

    const fileData = await this.fileToBase64(file);

    this.sendMessage({
      type: "tool_call",
      tool: "upload_rom",
      params: {
        emulatorType,
        fileName: file.name,
        fileData,
        fileSize: file.size,
      },
    });
  }

  async saveGameState(gameName, stateData, slot = 1) {
    if (!this.isConnected || !this.sessionId) {
      throw new Error("Session MCP non disponible");
    }

    this.sendMessage({
      type: "tool_call",
      tool: "save_game_state",
      params: {
        sessionId: this.sessionId,
        gameName,
        stateData,
        slot,
      },
    });
  }

  async loadGameState(gameName, slot = 1) {
    if (!this.isConnected || !this.sessionId) {
      throw new Error("Session MCP non disponible");
    }

    this.sendMessage({
      type: "tool_call",
      tool: "load_game_state",
      params: {
        sessionId: this.sessionId,
        gameName,
        slot,
      },
    });
  }

  async getPerformance(metrics = ["all"]) {
    if (!this.isConnected || !this.sessionId) {
      throw new Error("Session MCP non disponible");
    }

    this.sendMessage({
      type: "tool_call",
      tool: "get_emulator_performance",
      params: {
        sessionId: this.sessionId,
        metrics,
      },
    });
  }

  async listROMs(emulatorType, includeBuiltin = true) {
    if (!this.isConnected) {
      throw new Error("Service MCP non connecté");
    }

    this.sendMessage({
      type: "tool_call",
      tool: "list_available_roms",
      params: {
        emulatorType,
        includeBuiltin,
      },
    });
  }

  async configureControls(emulatorType, controls, profile = "default") {
    if (!this.isConnected) {
      throw new Error("Service MCP non connecté");
    }

    this.sendMessage({
      type: "tool_call",
      tool: "configure_emulator_controls",
      params: {
        emulatorType,
        controls,
        profile,
      },
    });
  }

  // Callbacks pour les résultats
  onEmulatorLoaded(result) {
    this.currentEmulator = result.emulator;
    this.showNotification(
      `Émulateur ${result.emulator.type.toUpperCase()} chargé`,
      "success"
    );

    // Émettre un événement personnalisé
    window.dispatchEvent(
      new CustomEvent("emulatorLoaded", {
        detail: result,
      })
    );
  }

  onROMUploaded(result) {
    this.showNotification("ROM uploadée avec succès", "success");

    window.dispatchEvent(
      new CustomEvent("romUploaded", {
        detail: result,
      })
    );
  }

  onGameStateSaved(result) {
    this.showNotification(
      `Sauvegarde créée dans le slot ${result.slot}`,
      "success"
    );

    window.dispatchEvent(
      new CustomEvent("gameStateSaved", {
        detail: result,
      })
    );
  }

  onGameStateLoaded(result) {
    this.showNotification(
      `Sauvegarde chargée depuis le slot ${result.slot}`,
      "success"
    );

    window.dispatchEvent(
      new CustomEvent("gameStateLoaded", {
        detail: result,
      })
    );
  }

  onPerformanceReceived(result) {
    window.dispatchEvent(
      new CustomEvent("performanceReceived", {
        detail: result,
      })
    );
  }

  onROMsListed(result) {
    window.dispatchEvent(
      new CustomEvent("romsListed", {
        detail: result,
      })
    );
  }

  // Utilitaires
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  generateRequestId() {
    return "req_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `mcp-notification mcp-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("❌ Nombre maximum de tentatives de reconnexion atteint");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

// Styles pour les notifications
const style = document.createElement("style");
style.textContent = `
  .mcp-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  }
  
  .mcp-notification.show {
    transform: translateX(0);
  }
  
  .mcp-notification-success {
    background: #27ae60;
  }
  
  .mcp-notification-error {
    background: #e74c3c;
  }
  
  .mcp-notification-info {
    background: #3498db;
  }
  
  .mcp-notification-warning {
    background: #f39c12;
  }
`;

document.head.appendChild(style);

// Instance globale du service MCP
window.MCPEmulatorService = new MCPEmulatorService();

// Connexion automatique au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  window.MCPEmulatorService.connect();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = MCPEmulatorService;
}
