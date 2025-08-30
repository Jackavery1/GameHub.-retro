#!/usr/bin/env node

/**
 * 🚀 Script de Démarrage - Implémentation Intelligente MCP
 *
 * Ce script lance l'implémentation progressive des fonctionnalités MCP
 * dans GameHub Retro selon la stratégie définie.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class MCPIntegrationStarter {
  constructor() {
    this.currentPhase = 1;
    this.phases = [
      { name: "Fondations", duration: "Semaine 1-2", status: "pending" },
      {
        name: "Intelligence Artificielle",
        duration: "Semaine 3-4",
        status: "pending",
      },
      { name: "Réalité Augmentée", duration: "Semaine 5-6", status: "pending" },
      { name: "Blockchain Gaming", duration: "Semaine 7-8", status: "pending" },
      {
        name: "Analytics Avancés",
        duration: "Semaine 9-10",
        status: "pending",
      },
    ];
  }

  async start() {
    console.log("🎯 GameHub Retro - Démarrage Implémentation MCP Intelligente");
    console.log("=".repeat(60));

    // Vérification de l'environnement
    await this.checkEnvironment();

    // Affichage du plan
    this.displayPlan();

    // Démarrage de la phase 1
    await this.startPhase1();
  }

  async checkEnvironment() {
    console.log("\n🔍 Vérification de l'environnement...");

    // Vérifier les dépendances
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const requiredDeps = ["express", "mongoose", "ws", "node-cron"];

    const missingDeps = requiredDeps.filter(
      (dep) => !packageJson.dependencies[dep]
    );

    if (missingDeps.length > 0) {
      console.log("⚠️  Dépendances manquantes:", missingDeps.join(", "));
      console.log("📦 Installation des dépendances...");
      execSync("npm install", { stdio: "inherit" });
    } else {
      console.log("✅ Toutes les dépendances sont installées");
    }

    // Vérifier la configuration MCP
    if (!fs.existsSync("mcp-config.json")) {
      console.log("⚠️  Configuration MCP manquante");
      this.createMCPConfig();
    } else {
      console.log("✅ Configuration MCP trouvée");
    }

    // Vérifier les outils MCP
    const mcpToolsDir = "src/mcp/tools";
    if (!fs.existsSync(mcpToolsDir)) {
      console.log("❌ Outils MCP manquants");
      process.exit(1);
    }

    const tools = fs.readdirSync(mcpToolsDir);
    console.log(`✅ ${tools.length} outils MCP disponibles`);
  }

  createMCPConfig() {
    const config = {
      server: {
        port: 3001,
        host: "localhost",
      },
      client: {
        url: "ws://localhost:3001",
        token: process.env.MCP_ADMIN_TOKEN || "admin-token",
      },
      tools: {
        "ai-tools": true,
        "ar-tools": true,
        "blockchain-tools": true,
        "analytics-tools": true,
        databaseTools: true,
        gameTools: true,
        tournamentTools: true,
        userTools: true,
        authTools: true,
      },
      integration: {
        progressive: true,
        fallback: true,
        monitoring: true,
        cache: true,
      },
    };

    fs.writeFileSync("mcp-config.json", JSON.stringify(config, null, 2));
    console.log("✅ Configuration MCP créée");
  }

  displayPlan() {
    console.log("\n📋 Plan d'Implémentation Intelligente");
    console.log("=".repeat(60));

    this.phases.forEach((phase, index) => {
      const status = phase.status === "pending" ? "⏳" : "✅";
      console.log(
        `${status} Phase ${index + 1}: ${phase.name} (${phase.duration})`
      );
    });

    console.log("\n🎯 Objectifs:");
    console.log("• Intégration progressive des fonctionnalités MCP");
    console.log("• Expérience utilisateur enrichie");
    console.log("• Compatibilité avec les fonctionnalités classiques");
    console.log("• Performance optimisée avec fallbacks intelligents");
  }

  async startPhase1() {
    console.log("\n🚀 Démarrage Phase 1: Fondations");
    console.log("=".repeat(40));

    try {
      // 1. Démarrer le serveur MCP
      console.log("1️⃣ Démarrage du serveur MCP...");
      this.startMCPServer();

      // 2. Créer les fichiers d'intégration
      console.log("2️⃣ Création des fichiers d'intégration...");
      await this.createIntegrationFiles();

      // 3. Tester l'intégration
      console.log("3️⃣ Test de l'intégration...");
      await this.testIntegration();

      // 4. Afficher les prochaines étapes
      this.displayNextSteps();
    } catch (error) {
      console.error("❌ Erreur lors du démarrage:", error.message);
      process.exit(1);
    }
  }

  startMCPServer() {
    try {
      // Vérifier si le serveur MCP est déjà en cours
      const isRunning = this.checkMCPServer();

      if (!isRunning) {
        console.log("🔄 Démarrage du serveur MCP...");
        execSync("npm run mcp:start", { stdio: "inherit" });
      } else {
        console.log("✅ Serveur MCP déjà en cours");
      }
    } catch (error) {
      console.log("⚠️  Serveur MCP non démarré, continuation...");
    }
  }

  checkMCPServer() {
    try {
      // Vérifier si le port MCP est utilisé
      const result = execSync("netstat -an | findstr :3001", {
        encoding: "utf8",
      });
      return result.includes("LISTENING");
    } catch {
      return false;
    }
  }

  async createIntegrationFiles() {
    const files = [
      {
        path: "src/middleware/mcpIntegration.js",
        content: this.getMCPIntegrationMiddleware(),
      },
      {
        path: "src/services/mcpService.js",
        content: this.getMCPService(),
      },
      {
        path: "public/js/mcp-integration.js",
        content: this.getMCPIntegrationJS(),
      },
      {
        path: "views/partials/mcp-widgets.ejs",
        content: this.getMCPWidgets(),
      },
    ];

    for (const file of files) {
      const dir = path.dirname(file.path);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (!fs.existsSync(file.path)) {
        fs.writeFileSync(file.path, file.content);
        console.log(`✅ ${file.path} créé`);
      } else {
        console.log(`⚠️  ${file.path} existe déjà`);
      }
    }
  }

  getMCPIntegrationMiddleware() {
    return `/**
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
          req.mcpEnabled = capabilities.every(cap => availableCapabilities.includes(cap));
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
        console.log(\`Fallback pour \${feature.name}:\`, error.message);
        next();
      }
    };
  },
  
  // Initialisation du client MCP
  initMCPClient: () => {
    return async (req, res, next) => {
      try {
        const { MCPClient } = require('../mcp/client');
        req.mcpClient = new MCPClient();
        await req.mcpClient.connect();
      } catch (error) {
        console.log('MCP Client non disponible:', error.message);
        req.mcpClient = null;
      }
      next();
    };
  }
};

module.exports = mcpIntegration;
`;
  }

  getMCPService() {
    return `/**
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
      const { MCPClient } = require('../mcp/client');
      this.client = new MCPClient();
      await this.client.connect();
    } catch (error) {
      console.log('MCP Service non disponible:', error.message);
    }
  }
  
  // Appel intelligent avec cache
  async intelligentCall(tool, method, params) {
    if (!this.client) {
      throw new Error('MCP Client non disponible');
    }
    
    const cacheKey = \`\${tool}.\${method}.\${JSON.stringify(params)}\`;
    
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
      console.log(\`Fallback pour \${tool}.\${method}:\`, error.message);
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
`;
  }

  getMCPIntegrationJS() {
    return `/**
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
    console.log('🎯 Initialisation MCP Integration...');
    
    // Détection des capacités
    await this.detectCapabilities();
    
    // Initialisation des widgets
    this.initializeWidgets();
    
    // Gestion des fallbacks
    this.setupFallbacks();
    
    console.log('✅ MCP Integration initialisée');
  }
  
  async detectCapabilities() {
    try {
      const response = await fetch('/api/mcp/capabilities');
      if (response.ok) {
        const capabilities = await response.json();
        capabilities.forEach(cap => this.capabilities.add(cap));
        console.log('🎯 Capacités MCP détectées:', capabilities);
      }
    } catch (error) {
      console.log('⚠️  MCP non disponible, utilisation des fonctionnalités classiques');
    }
  }
  
  initializeWidgets() {
    document.querySelectorAll('[data-mcp]').forEach(widget => {
      const capability = widget.dataset.mcp;
      
      if (this.capabilities.has(capability)) {
        this.activateWidget(widget, capability);
      } else {
        this.showFallback(widget);
      }
    });
  }
  
  activateWidget(widget, capability) {
    widget.classList.add('mcp-active');
    console.log(\`🎯 Widget \${capability} activé\`);
    
    switch (capability) {
      case 'ai-tools':
        this.initAIWidget(widget);
        break;
      case 'ar-tools':
        this.initARWidget(widget);
        break;
      case 'blockchain-tools':
        this.initBlockchainWidget(widget);
        break;
      case 'analytics-tools':
        this.initAnalyticsWidget(widget);
        break;
    }
  }
  
  showFallback(widget) {
    const fallback = widget.querySelector('.fallback-content, .3d-fallback');
    if (fallback) {
      fallback.style.display = 'block';
    }
    widget.classList.add('mcp-fallback');
    console.log('⚠️  Widget en mode fallback');
  }
  
  initAIWidget(widget) {
    // Initialisation du widget IA
    const recommendationsList = widget.querySelector('.recommendations-list');
    if (recommendationsList) {
      this.loadAIRecommendations(recommendationsList);
    }
  }
  
  initARWidget(widget) {
    // Initialisation du widget AR
    const arContainer = widget.querySelector('.ar-container');
    if (arContainer) {
      this.initARExperience(arContainer);
    }
  }
  
  initBlockchainWidget(widget) {
    // Initialisation du widget Blockchain
    const walletInfo = widget.querySelector('.wallet-info');
    if (walletInfo) {
      this.loadWalletInfo(walletInfo);
    }
  }
  
  initAnalyticsWidget(widget) {
    // Initialisation du widget Analytics
    const analyticsContent = widget.querySelector('.analytics-content');
    if (analyticsContent) {
      this.loadAnalytics(analyticsContent);
    }
  }
  
  async loadAIRecommendations(container) {
    try {
      const response = await fetch('/api/mcp/ai/recommendations');
      if (response.ok) {
        const recommendations = await response.json();
        this.renderRecommendations(container, recommendations);
      }
    } catch (error) {
      console.log('Erreur chargement recommandations IA:', error);
    }
  }
  
  async loadWalletInfo(container) {
    try {
      const response = await fetch('/api/mcp/blockchain/wallet');
      if (response.ok) {
        const wallet = await response.json();
        this.renderWalletInfo(container, wallet);
      }
    } catch (error) {
      console.log('Erreur chargement portefeuille:', error);
    }
  }
  
  async loadAnalytics(container) {
    try {
      const response = await fetch('/api/mcp/analytics/dashboard');
      if (response.ok) {
        const analytics = await response.json();
        this.renderAnalytics(container, analytics);
      }
    } catch (error) {
      console.log('Erreur chargement analytics:', error);
    }
  }
  
  renderRecommendations(container, recommendations) {
    container.innerHTML = recommendations.map(rec => \`
      <div class="recommendation-item">
        <h4>\${rec.title}</h4>
        <p>\${rec.description}</p>
        <div class="confidence-score">Confiance: \${rec.confidence}%</div>
      </div>
    \`).join('');
  }
  
  renderWalletInfo(container, wallet) {
    container.innerHTML = \`
      <div class="wallet-balance">
        <h4>Solde: \${wallet.balance} tokens</h4>
        <p>NFTs: \${wallet.nfts.length}</p>
      </div>
    \`;
  }
  
  renderAnalytics(container, analytics) {
    container.innerHTML = \`
      <div class="analytics-summary">
        <h4>Performance: \${analytics.performance}%</h4>
        <p>Prédiction: \${analytics.prediction}</p>
      </div>
    \`;
  }
  
  setupFallbacks() {
    // Gestion des erreurs de chargement
    window.addEventListener('error', (event) => {
      if (event.target.tagName === 'SCRIPT' && event.target.src.includes('mcp')) {
        console.log('Script MCP non chargé, utilisation du fallback');
      }
    });
  }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  window.mcpIntegration = new MCPIntegration();
});
`;
  }

  getMCPWidgets() {
    return `<!-- Widgets MCP Intelligents -->
<div class="mcp-widgets">
  
  <!-- Widget IA -->
  <div class="widget ai-recommendations" data-mcp="ai-tools">
    <div class="widget-header">
      <h3>🎯 Recommandations IA</h3>
      <div class="widget-status mcp-status">MCP</div>
    </div>
    <div class="widget-content">
      <div class="recommendations-list">
        <div class="loading">Chargement des recommandations...</div>
      </div>
      <div class="fallback-content" style="display: none;">
        <p>Recommandations classiques basées sur la popularité</p>
        <ul>
          <li>Mario Bros</li>
          <li>Duck Hunt</li>
          <li>Pac-Man</li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- Widget AR -->
  <div class="widget ar-experience" data-mcp="ar-tools">
    <div class="widget-header">
      <h3>🥽 Expérience AR</h3>
      <div class="widget-status mcp-status">MCP</div>
    </div>
    <div class="widget-content">
      <div class="ar-container">
        <div class="ar-notice">
          <p>Activez votre caméra pour l'expérience AR</p>
          <button class="btn btn-primary" onclick="startAR()">Démarrer AR</button>
        </div>
      </div>
      <div class="3d-fallback" style="display: none;">
        <p>Mode 3D classique</p>
        <div class="3d-viewer">
          <!-- Contenu 3D -->
        </div>
      </div>
    </div>
  </div>
  
  <!-- Widget Blockchain -->
  <div class="widget blockchain-wallet" data-mcp="blockchain-tools">
    <div class="widget-header">
      <h3>⛓️ Portefeuille Blockchain</h3>
      <div class="widget-status mcp-status">MCP</div>
    </div>
    <div class="widget-content">
      <div class="wallet-info">
        <div class="loading">Chargement du portefeuille...</div>
      </div>
      <div class="fallback-content" style="display: none;">
        <p>Mode simulation blockchain</p>
        <div class="simulated-wallet">
          <p>Solde: 1000 tokens (simulation)</p>
          <p>NFTs: 5 (simulation)</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Widget Analytics -->
  <div class="widget analytics-dashboard" data-mcp="analytics-tools">
    <div class="widget-header">
      <h3>📊 Analytics Avancés</h3>
      <div class="widget-status mcp-status">MCP</div>
    </div>
    <div class="widget-content">
      <div class="analytics-content">
        <div class="loading">Chargement des analytics...</div>
      </div>
      <div class="fallback-content" style="display: none;">
        <p>Statistiques de base</p>
        <div class="basic-stats">
          <p>Parties jouées: 150</p>
          <p>Score moyen: 85</p>
        </div>
      </div>
    </div>
  </div>
  
</div>

<style>
.mcp-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.widget {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
}

.widget:hover {
  transform: translateY(-5px);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.widget-status {
  background: rgba(255,255,255,0.2);
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.mcp-active .widget-status {
  background: #4CAF50;
}

.mcp-fallback .widget-status {
  background: #FF9800;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.fallback-content {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 10px;
  margin-top: 10px;
}

.recommendation-item {
  background: rgba(255,255,255,0.1);
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
}

.confidence-score {
  font-size: 12px;
  color: #FFD700;
  margin-top: 5px;
}

.btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn:hover {
  background: rgba(255,255,255,0.3);
}
</style>
`;
  }

  async testIntegration() {
    console.log("🧪 Test de l'intégration...");

    try {
      // Test des fichiers créés
      const files = [
        "src/middleware/mcpIntegration.js",
        "src/services/mcpService.js",
        "public/js/mcp-integration.js",
        "views/partials/mcp-widgets.ejs",
      ];

      for (const file of files) {
        if (fs.existsSync(file)) {
          console.log(`✅ ${file} - OK`);
        } else {
          console.log(`❌ ${file} - MANQUANT`);
        }
      }

      // Test du serveur MCP
      const mcpRunning = this.checkMCPServer();
      console.log(
        mcpRunning ? "✅ Serveur MCP - OK" : "⚠️  Serveur MCP - NON DÉMARRÉ"
      );

      console.log("✅ Tests d'intégration terminés");
    } catch (error) {
      console.log("⚠️  Erreur lors des tests:", error.message);
    }
  }

  displayNextSteps() {
    console.log("\n🎯 Prochaines Étapes");
    console.log("=".repeat(40));
    console.log("1. Intégrer les widgets MCP dans le dashboard");
    console.log("2. Ajouter les routes API MCP");
    console.log("3. Tester les fonctionnalités IA");
    console.log("4. Configurer les fallbacks");
    console.log("5. Lancer les tests utilisateur");

    console.log("\n📋 Commandes utiles:");
    console.log("• npm run start          # Démarrer l'application");
    console.log("• npm run mcp:start      # Démarrer le serveur MCP");
    console.log("• npm run test:mcp       # Tester les fonctionnalités MCP");

    console.log("\n🚀 Phase 1 terminée ! Prêt pour la Phase 2 (IA)");
  }
}

// Démarrage du script
if (require.main === module) {
  const starter = new MCPIntegrationStarter();
  starter.start().catch(console.error);
}

module.exports = MCPIntegrationStarter;

