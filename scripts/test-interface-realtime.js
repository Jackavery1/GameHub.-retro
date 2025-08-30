#!/usr/bin/env node

/**
 * 🧪 Test Interface en Temps Réel - MCP GameHub Retro
 *
 * Ce script teste l'interface MCP en conditions réelles
 * et identifie tous les problèmes à corriger.
 */

const http = require("http");
const https = require("https");

class InterfaceTester {
  constructor() {
    this.baseUrl = "http://localhost:3001";
    this.mcpUrl = "http://localhost:3002";
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  async runAllTests() {
    console.log("🧪 Test Interface en Temps Réel - MCP GameHub Retro");
    console.log("=".repeat(60));

    // Tests des serveurs
    await this.testServers();

    // Tests des API MCP
    await this.testMCPAPIs();

    // Tests de l'interface utilisateur
    await this.testUserInterface();

    // Tests des widgets MCP
    await this.testMCPWidgets();

    // Tests de performance
    await this.testPerformance();

    // Affichage des résultats
    this.displayResults();
  }

  async testServers() {
    console.log("\n🔧 Test des Serveurs...");

    // Test serveur principal
    try {
      const response = await this.makeRequest(`${this.baseUrl}/`);
      if (response.statusCode === 200) {
        console.log("✅ Serveur principal: Opérationnel");
        this.results.passed++;
      } else {
        console.log("❌ Serveur principal: Erreur", response.statusCode);
        this.results.failed++;
        this.results.errors.push(`Serveur principal: ${response.statusCode}`);
      }
    } catch (error) {
      console.log("❌ Serveur principal: Non accessible");
      this.results.failed++;
      this.results.errors.push(`Serveur principal: ${error.message}`);
    }

    // Test serveur MCP
    try {
      const response = await this.makeRequest(`${this.mcpUrl}/health`);
      if (response.statusCode === 200) {
        console.log("✅ Serveur MCP: Opérationnel");
        this.results.passed++;
      } else {
        console.log("❌ Serveur MCP: Erreur", response.statusCode);
        this.results.failed++;
        this.results.errors.push(`Serveur MCP: ${response.statusCode}`);
      }
    } catch (error) {
      console.log("❌ Serveur MCP: Non accessible");
      this.results.failed++;
      this.results.errors.push(`Serveur MCP: ${error.message}`);
    }
  }

  async testMCPAPIs() {
    console.log("\n🔌 Test des APIs MCP...");

    const apis = [
      "/api/mcp/health",
      "/api/mcp/capabilities",
      "/api/mcp/ai/recommendations",
      "/api/mcp/blockchain/wallet",
      "/api/mcp/analytics/dashboard",
    ];

    for (const api of apis) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}${api}`);
        if (response.statusCode === 200) {
          console.log(`✅ ${api}: Fonctionnel`);
          this.results.passed++;
        } else {
          console.log(`❌ ${api}: Erreur ${response.statusCode}`);
          this.results.failed++;
          this.results.errors.push(`${api}: ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${api}: Non accessible`);
        this.results.failed++;
        this.results.errors.push(`${api}: ${error.message}`);
      }
    }
  }

  async testUserInterface() {
    console.log("\n🎨 Test de l'Interface Utilisateur...");

    const pages = [
      { path: "/", expectedStatus: [200] },
      { path: "/dashboard", expectedStatus: [200, 302] }, // Peut rediriger vers login
      { path: "/arcade", expectedStatus: [200] },
      { path: "/tournaments", expectedStatus: [200] },
      { path: "/admin/mcp-settings", expectedStatus: [200, 302] }, // Peut rediriger vers login
    ];

    for (const page of pages) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}${page.path}`);
        if (page.expectedStatus.includes(response.statusCode)) {
          console.log(`✅ ${page.path}: Accessible (${response.statusCode})`);
          this.results.passed++;
        } else {
          console.log(`❌ ${page.path}: Erreur ${response.statusCode}`);
          this.results.failed++;
          this.results.errors.push(`${page.path}: ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${page.path}: Non accessible`);
        this.results.failed++;
        this.results.errors.push(`${page.path}: ${error.message}`);
      }
    }
  }

  async testMCPWidgets() {
    console.log("\n🎯 Test des Widgets MCP...");

    try {
      const response = await this.makeRequest(`${this.baseUrl}/dashboard`);
      if (response.statusCode === 200 || response.statusCode === 302) {
        const content = response.data;

        // Vérifier la présence des widgets MCP (même si redirection)
        const widgets = [
          "ai-recommendations",
          "ar-experience",
          "blockchain-wallet",
          "analytics-dashboard",
        ];

        // Si c'est une redirection vers login, on vérifie juste que le système fonctionne
        if (response.statusCode === 302 || content.includes("login")) {
          console.log("✅ Dashboard: Redirection vers login (normal)");
          this.results.passed++;

          // Vérifier que les scripts MCP sont présents dans le layout général
          const layoutResponse = await this.makeRequest(`${this.baseUrl}/`);
          if (
            layoutResponse.statusCode === 200 &&
            (layoutResponse.data.includes("mcp-integration.js") ||
              layoutResponse.data.includes("mcp-integration"))
          ) {
            console.log("✅ Script MCP: Présent dans le layout");
            this.results.passed++;
          } else {
            console.log("❌ Script MCP: Manquant dans le layout");
            this.results.failed++;
            this.results.errors.push("Script MCP: Manquant dans le layout");
          }
        } else {
          // Dashboard accessible, vérifier les widgets
          for (const widget of widgets) {
            if (content.includes(widget)) {
              console.log(`✅ Widget ${widget}: Présent`);
              this.results.passed++;
            } else {
              console.log(`❌ Widget ${widget}: Manquant`);
              this.results.failed++;
              this.results.errors.push(`Widget ${widget}: Manquant`);
            }
          }

          // Vérifier les scripts MCP
          if (content.includes("mcp-integration.js")) {
            console.log("✅ Script MCP: Présent");
            this.results.passed++;
          } else {
            console.log("❌ Script MCP: Manquant");
            this.results.failed++;
            this.results.errors.push("Script MCP: Manquant");
          }
        }
      } else {
        console.log("❌ Dashboard: Non accessible");
        this.results.failed++;
        this.results.errors.push("Dashboard: Non accessible");
      }
    } catch (error) {
      console.log("❌ Test widgets: Erreur");
      this.results.failed++;
      this.results.errors.push(`Test widgets: ${error.message}`);
    }
  }

  async testPerformance() {
    console.log("\n⚡ Test de Performance...");

    const startTime = Date.now();

    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/mcp/health`);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration < 1000) {
        console.log(`✅ Performance: ${duration}ms (Excellent)`);
        this.results.passed++;
      } else if (duration < 3000) {
        console.log(`⚠️ Performance: ${duration}ms (Acceptable)`);
        this.results.passed++;
      } else {
        console.log(`❌ Performance: ${duration}ms (Lent)`);
        this.results.failed++;
        this.results.errors.push(`Performance: ${duration}ms`);
      }
    } catch (error) {
      console.log("❌ Test performance: Erreur");
      this.results.failed++;
      this.results.errors.push(`Performance: ${error.message}`);
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith("https") ? https : http;

      const req = client.get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers,
          });
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error("Timeout"));
      });
    });
  }

  displayResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSULTATS DES TESTS");
    console.log("=".repeat(60));

    const total = this.results.passed + this.results.failed;
    const successRate =
      total > 0 ? Math.round((this.results.passed / total) * 100) : 0;

    console.log(`✅ Tests réussis: ${this.results.passed}`);
    console.log(`❌ Tests échoués: ${this.results.failed}`);
    console.log(`📈 Taux de réussite: ${successRate}%`);

    if (this.results.errors.length > 0) {
      console.log("\n🔧 Problèmes identifiés:");
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (successRate >= 80) {
      console.log("\n🎉 Interface prête pour la Phase 2 !");
    } else {
      console.log("\n⚠️ Corrections nécessaires avant la Phase 2");
    }
  }
}

// Lancement des tests
const tester = new InterfaceTester();
tester.runAllTests().catch(console.error);
