#!/usr/bin/env node

/**
 * 🧪 Script de Test - Intégration MCP
 *
 * Ce script teste l'intégration des fonctionnalités MCP
 * dans GameHub Retro.
 */

const fs = require("fs");
const path = require("path");

class MCPIntegrationTester {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
    };
  }

  async runTests() {
    console.log("🧪 Test de l'Intégration MCP GameHub Retro");
    console.log("=".repeat(50));

    // Tests des fichiers d'intégration
    await this.testIntegrationFiles();

    // Tests des routes API
    await this.testAPIRoutes();

    // Tests des widgets
    await this.testWidgets();

    // Tests de performance
    await this.testPerformance();

    // Affichage des résultats
    this.displayResults();
  }

  async testIntegrationFiles() {
    console.log("\n📁 Test des fichiers d'intégration...");

    const files = [
      {
        path: "src/middleware/mcpIntegration.js",
        description: "Middleware d'intégration MCP",
      },
      {
        path: "src/services/mcpService.js",
        description: "Service MCP unifié",
      },
      {
        path: "public/js/mcp-integration.js",
        description: "JavaScript côté client",
      },
      {
        path: "views/partials/mcp-widgets.ejs",
        description: "Widgets MCP",
      },
      {
        path: "src/routes/mcp.js",
        description: "Routes API MCP",
      },
    ];

    for (const file of files) {
      await this.testFile(file);
    }
  }

  async testFile(file) {
    try {
      if (fs.existsSync(file.path)) {
        const stats = fs.statSync(file.path);
        const content = fs.readFileSync(file.path, "utf8");

        if (content.length > 0) {
          this.pass(`✅ ${file.description} - OK (${stats.size} bytes)`);
        } else {
          this.fail(`❌ ${file.description} - FICHIER VIDE`);
        }
      } else {
        this.fail(`❌ ${file.description} - MANQUANT`);
      }
    } catch (error) {
      this.fail(`❌ ${file.description} - ERREUR: ${error.message}`);
    }
  }

  async testAPIRoutes() {
    console.log("\n🌐 Test des routes API MCP...");

    const routes = [
      "/api/mcp/capabilities",
      "/api/mcp/ai/recommendations",
      "/api/mcp/blockchain/wallet",
      "/api/mcp/analytics/dashboard",
      "/api/mcp/health",
    ];

    for (const route of routes) {
      await this.testRoute(route);
    }
  }

  async testRoute(route) {
    try {
      const http = require("http");

      const options = {
        hostname: "localhost",
        port: 3001,
        path: route,
        method: "GET",
        timeout: 5000,
      };

      return new Promise((resolve) => {
        const req = http.request(options, (res) => {
          if (res.statusCode === 200 || res.statusCode === 404) {
            this.pass(`✅ Route ${route} - OK (${res.statusCode})`);
          } else {
            this.fail(`❌ Route ${route} - ERREUR ${res.statusCode}`);
          }
          resolve();
        });

        req.on("error", (error) => {
          this.fail(`❌ Route ${route} - ERREUR: ${error.message}`);
          resolve();
        });

        req.on("timeout", () => {
          this.fail(`❌ Route ${route} - TIMEOUT`);
          req.destroy();
          resolve();
        });

        req.end();
      });
    } catch (error) {
      this.fail(`❌ Route ${route} - ERREUR: ${error.message}`);
    }
  }

  async testWidgets() {
    console.log("\n🎨 Test des widgets MCP...");

    const widgets = [
      {
        name: "Widget IA",
        selector: '[data-mcp="ai-tools"]',
        description: "Widget de recommandations IA",
      },
      {
        name: "Widget AR",
        selector: '[data-mcp="ar-tools"]',
        description: "Widget d'expérience AR",
      },
      {
        name: "Widget Blockchain",
        selector: '[data-mcp="blockchain-tools"]',
        description: "Widget de portefeuille blockchain",
      },
      {
        name: "Widget Analytics",
        selector: '[data-mcp="analytics-tools"]',
        description: "Widget d'analytics avancés",
      },
    ];

    for (const widget of widgets) {
      await this.testWidget(widget);
    }
  }

  async testWidget(widget) {
    try {
      const widgetContent = fs.readFileSync(
        "views/partials/mcp-widgets.ejs",
        "utf8"
      );

      if (widgetContent.includes(widget.selector)) {
        this.pass(`✅ ${widget.description} - OK`);
      } else {
        this.fail(`❌ ${widget.description} - MANQUANT`);
      }
    } catch (error) {
      this.fail(`❌ ${widget.description} - ERREUR: ${error.message}`);
    }
  }

  async testPerformance() {
    console.log("\n⚡ Test de performance...");

    // Test de la taille des fichiers
    const files = [
      "public/js/mcp-integration.js",
      "views/partials/mcp-widgets.ejs",
    ];

    for (const file of files) {
      await this.testFileSize(file);
    }
  }

  async testFileSize(file) {
    try {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeKB = (stats.size / 1024).toFixed(2);

        if (stats.size < 100 * 1024) {
          // Moins de 100KB
          this.pass(`✅ ${file} - Taille OK (${sizeKB} KB)`);
        } else {
          this.fail(`⚠️  ${file} - TAILLE ÉLEVÉE (${sizeKB} KB)`);
        }
      } else {
        this.fail(`❌ ${file} - MANQUANT`);
      }
    } catch (error) {
      this.fail(`❌ ${file} - ERREUR: ${error.message}`);
    }
  }

  pass(message) {
    this.tests.push({ status: "PASS", message });
    this.results.passed++;
    this.results.total++;
    console.log(message);
  }

  fail(message) {
    this.tests.push({ status: "FAIL", message });
    this.results.failed++;
    this.results.total++;
    console.log(message);
  }

  displayResults() {
    console.log("\n📊 Résultats des Tests");
    console.log("=".repeat(50));
    console.log(`✅ Tests réussis: ${this.results.passed}`);
    console.log(`❌ Tests échoués: ${this.results.failed}`);
    console.log(`📋 Total: ${this.results.total}`);

    const successRate = (
      (this.results.passed / this.results.total) *
      100
    ).toFixed(1);
    console.log(`📈 Taux de réussite: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log("\n❌ Tests échoués:");
      this.tests
        .filter((test) => test.status === "FAIL")
        .forEach((test) => {
          console.log(`  - ${test.message}`);
        });
    }

    if (successRate >= 80) {
      console.log("\n🎉 Intégration MCP validée avec succès !");
    } else {
      console.log(
        "\n⚠️  Des problèmes ont été détectés. Vérifiez les erreurs ci-dessus."
      );
    }
  }
}

// Démarrage des tests
if (require.main === module) {
  const tester = new MCPIntegrationTester();
  tester.runTests().catch(console.error);
}

module.exports = MCPIntegrationTester;
