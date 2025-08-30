/**
 * Intégration MCP côté Client
 * Gère l'intégration progressive des widgets MCP
 */

class MCPIntegration {
  constructor() {
    this.capabilities = new Set();
    this.widgets = new Map();
    this.init();
  }

  async init() {
    console.log("🎯 Initialisation MCP Integration...");

    // Détection des capacités
    await this.detectCapabilities();

    // Initialisation des widgets
    this.initializeWidgets();

    // Gestion des fallbacks
    this.setupFallbacks();

    console.log("✅ MCP Integration initialisée");
  }

  async detectCapabilities() {
    try {
      const response = await fetch("/api/mcp/capabilities");
      if (response.ok) {
        const capabilities = await response.json();
        capabilities.forEach((cap) => this.capabilities.add(cap));
        console.log("🎯 Capacités MCP détectées:", capabilities);
      }
    } catch (error) {
      console.log(
        "⚠️  MCP non disponible, utilisation des fonctionnalités classiques"
      );
    }
  }

  initializeWidgets() {
    document.querySelectorAll("[data-mcp]").forEach((widget) => {
      const capability = widget.dataset.mcp;

      if (this.capabilities.has(capability)) {
        this.activateWidget(widget, capability);
      } else {
        this.showFallback(widget);
      }
    });
  }

  activateWidget(widget, capability) {
    widget.classList.add("mcp-active");
    console.log(`🎯 Widget ${capability} activé`);

    switch (capability) {
      case "ai-tools":
        this.initAIWidget(widget);
        break;
      case "ar-tools":
        this.initARWidget(widget);
        break;
      case "blockchain-tools":
        this.initBlockchainWidget(widget);
        break;
      case "analytics-tools":
        this.initAnalyticsWidget(widget);
        break;
    }
  }

  showFallback(widget) {
    const fallback = widget.querySelector(".fallback-content, .fallback-3d");
    if (fallback) {
      fallback.style.display = "block";
    }
    widget.classList.add("mcp-fallback");
    console.log("⚠️  Widget en mode fallback");
  }

  initAIWidget(widget) {
    // Initialisation du widget IA
    const recommendationsList = widget.querySelector(".recommendations-list");
    if (recommendationsList) {
      this.loadAIRecommendations(recommendationsList);
    }
  }

  initARWidget(widget) {
    // Initialisation du widget AR
    const arContainer = widget.querySelector(".ar-container");
    if (arContainer) {
      this.initARExperience(arContainer);
    }
  }

  initBlockchainWidget(widget) {
    // Initialisation du widget Blockchain
    const walletInfo = widget.querySelector(".wallet-info");
    if (walletInfo) {
      this.loadWalletInfo(walletInfo);
    }
  }

  initAnalyticsWidget(widget) {
    // Initialisation du widget Analytics
    const analyticsContent = widget.querySelector(".analytics-content");
    if (analyticsContent) {
      this.loadAnalytics(analyticsContent);
    }
  }

  async loadAIRecommendations(container) {
    try {
      const response = await fetch("/api/mcp/ai/recommendations");
      if (response.ok) {
        const recommendations = await response.json();
        this.renderRecommendations(container, recommendations);
      }
    } catch (error) {
      console.log("Erreur chargement recommandations IA:", error);
    }
  }

  async loadWalletInfo(container) {
    try {
      const response = await fetch("/api/mcp/blockchain/wallet");
      if (response.ok) {
        const wallet = await response.json();
        this.renderWalletInfo(container, wallet);
      }
    } catch (error) {
      console.log("Erreur chargement portefeuille:", error);
    }
  }

  async loadAnalytics(container) {
    try {
      const response = await fetch("/api/mcp/analytics/dashboard");
      if (response.ok) {
        const analytics = await response.json();
        this.renderAnalytics(container, analytics);
      }
    } catch (error) {
      console.log("Erreur chargement analytics:", error);
    }
  }

  renderRecommendations(container, recommendations) {
    container.innerHTML = recommendations
      .map(
        (rec) => `
      <div class="recommendation-item">
        <h4>${rec.title}</h4>
        <p>${rec.description}</p>
        <div class="confidence-score">Confiance: ${rec.confidence}%</div>
      </div>
    `
      )
      .join("");
  }

  renderWalletInfo(container, wallet) {
    container.innerHTML = `
      <div class="wallet-balance">
        <h4>Solde: ${wallet.balance} tokens</h4>
        <p>NFTs: ${wallet.nfts.length}</p>
      </div>
    `;
  }

  renderAnalytics(container, analytics) {
    container.innerHTML = `
      <div class="analytics-summary">
        <h4>Performance: ${analytics.performance}%</h4>
        <p>Prédiction: ${analytics.prediction}</p>
      </div>
    `;
  }

  setupFallbacks() {
    // Gestion des erreurs de chargement
    window.addEventListener("error", (event) => {
      if (
        event.target.tagName === "SCRIPT" &&
        event.target.src.includes("mcp")
      ) {
        console.log("Script MCP non chargé, utilisation du fallback");
      }
    });
  }
}

// Initialisation automatique
document.addEventListener("DOMContentLoaded", () => {
  window.mcpIntegration = new MCPIntegration();
});
