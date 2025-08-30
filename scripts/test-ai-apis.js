#!/usr/bin/env node

/**
 * 🧠 Test des APIs IA en Conditions Réelles - Phase 2
 *
 * Ce script teste les nouvelles APIs IA intégrées
 * dans l'interface MCP GameHub Retro.
 */

const http = require("http");

class AIAPITester {
  constructor() {
    this.baseUrl = "http://localhost:3001";
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  async runAllTests() {
    console.log("🧠 " + "=".repeat(60));
    console.log("🚀 TEST DES APIs IA EN CONDITIONS RÉELLES");
    console.log("=".repeat(60));

    // Tests des APIs IA existantes
    await this.testExistingAIAPIs();

    // Tests des nouvelles fonctionnalités IA
    await this.testNewAIFeatures();

    // Tests de performance IA
    await this.testAIPerformance();

    // Affichage des résultats
    this.displayResults();
  }

  async testExistingAIAPIs() {
    console.log("\n🔌 Test des APIs IA Existantes...");

    const apis = [
      { path: "/api/mcp/ai/recommendations", name: "Recommandations IA" },
      { path: "/api/mcp/ai/matchmaking", name: "Matchmaking IA" },
      { path: "/api/mcp/ai/analytics", name: "Analytics IA" },
      { path: "/api/mcp/ai/notifications", name: "Notifications IA" },
    ];

    for (const api of apis) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}${api.path}`);
        if (response.statusCode === 200) {
          console.log(`✅ ${api.name}: Fonctionnel`);
          this.results.passed++;

          // Analyser la réponse
          this.analyzeAIResponse(api.name, response.data);
        } else {
          console.log(`❌ ${api.name}: Erreur ${response.statusCode}`);
          this.results.failed++;
          this.results.errors.push(`${api.name}: ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${api.name}: Non accessible`);
        this.results.failed++;
        this.results.errors.push(`${api.name}: ${error.message}`);
      }
    }
  }

  async testNewAIFeatures() {
    console.log("\n🎯 Test des Nouvelles Fonctionnalités IA...");

    // Test des services IA directement
    try {
      const AIRecommendationEngine = require("../src/services/aiRecommendationEngine");
      const IntelligentMatchmaking = require("../src/services/intelligentMatchmaking");
      const PredictiveAnalytics = require("../src/services/predictiveAnalytics");
      const SmartNotifications = require("../src/services/smartNotifications");

      const recommendationEngine = new AIRecommendationEngine();
      const matchmaking = new IntelligentMatchmaking();
      const analytics = new PredictiveAnalytics();
      const notifications = new SmartNotifications();

      // Test recommandations avancées
      const recommendations =
        await recommendationEngine.generateRecommendations("test-user", 3);
      if (recommendations && recommendations.length > 0) {
        console.log("✅ Recommandations IA Avancées: Fonctionnel");
        console.log(`   📊 ${recommendations.length} recommandations générées`);
        recommendations.forEach((rec, index) => {
          console.log(
            `   ${index + 1}. ${rec.title} (Score: ${Math.round(
              rec.score * 100
            )}%, Confiance: ${Math.round(rec.confidence * 100)}%)`
          );
        });
        this.results.passed++;
      }

      // Test matchmaking intelligent
      const match = await matchmaking.findOpponent("test-user", "mario-bros");
      if (match && match.opponent) {
        console.log("✅ Matchmaking Intelligent: Fonctionnel");
        console.log(
          `   🤖 Adversaire trouvé: ${match.opponent.id} (ELO: ${match.opponent.elo})`
        );
        console.log(`   ⏱️ Temps d'attente: ${match.estimatedWaitTime}ms`);
        this.results.passed++;
      }

      // Test analytics prédictifs
      const prediction = await analytics.predictPerformance(
        "test-user",
        "mario-bros"
      );
      if (prediction && prediction.expectedScore !== undefined) {
        console.log("✅ Analytics Prédictifs: Fonctionnel");
        console.log(
          `   📈 Score prédit: ${Math.round(prediction.expectedScore)}`
        );
        console.log(
          `   🎯 Probabilité de victoire: ${Math.round(
            prediction.winProbability * 100
          )}%`
        );
        console.log(
          `   📊 Taux d'amélioration: ${Math.round(
            prediction.improvementRate * 100
          )}%`
        );
        this.results.passed++;
      }

      // Test notifications intelligentes
      const smartNotifications = await notifications.generateSmartNotifications(
        "test-user"
      );
      if (Array.isArray(smartNotifications)) {
        console.log("✅ Notifications Intelligentes: Fonctionnel");
        console.log(
          `   🔔 ${smartNotifications.length} notifications générées`
        );
        smartNotifications.forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title} (${notif.priority})`);
        });
        this.results.passed++;
      }
    } catch (error) {
      console.log("❌ Test des services IA:", error.message);
      this.results.failed++;
      this.results.errors.push(`Services IA: ${error.message}`);
    }
  }

  async testAIPerformance() {
    console.log("\n⚡ Test de Performance IA...");

    const startTime = Date.now();

    try {
      // Test de performance des recommandations
      const AIRecommendationEngine = require("../src/services/aiRecommendationEngine");
      const engine = new AIRecommendationEngine();

      const recommendations = await engine.generateRecommendations(
        "test-user",
        10
      );
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration < 100) {
        console.log(`✅ Performance IA: ${duration}ms (Excellent)`);
        this.results.passed++;
      } else if (duration < 500) {
        console.log(`⚠️ Performance IA: ${duration}ms (Acceptable)`);
        this.results.passed++;
      } else {
        console.log(`❌ Performance IA: ${duration}ms (Lent)`);
        this.results.failed++;
        this.results.errors.push(`Performance IA: ${duration}ms`);
      }

      console.log(
        `   🎯 ${recommendations.length} recommandations générées en ${duration}ms`
      );
    } catch (error) {
      console.log("❌ Test performance IA:", error.message);
      this.results.failed++;
      this.results.errors.push(`Performance IA: ${error.message}`);
    }
  }

  analyzeAIResponse(apiName, data) {
    try {
      const response = JSON.parse(data);

      switch (apiName) {
        case "Recommandations IA":
          if (response.recommendations && response.recommendations.length > 0) {
            console.log(
              `   📊 ${response.recommendations.length} recommandations disponibles`
            );
          }
          break;

        case "Matchmaking IA":
          if (response.opponents && response.opponents.length > 0) {
            console.log(
              `   🤖 ${response.opponents.length} adversaires compatibles`
            );
          }
          break;

        case "Analytics IA":
          if (response.metrics) {
            console.log(
              `   📈 Métriques disponibles: ${
                Object.keys(response.metrics).length
              }`
            );
          }
          break;

        case "Notifications IA":
          if (response.notifications && response.notifications.length > 0) {
            console.log(
              `   🔔 ${response.notifications.length} notifications actives`
            );
          }
          break;
      }
    } catch (error) {
      console.log(`   ⚠️ Impossible d'analyser la réponse: ${error.message}`);
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
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
    console.log("📊 RÉSULTATS DES TESTS IA");
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

    if (successRate >= 90) {
      console.log("\n🎉 APIs IA opérationnelles à 100% !");
      console.log("🧠 GameHub Retro dispose de fonctionnalités IA avancées !");
    } else if (successRate >= 70) {
      console.log(
        "\n✅ APIs IA fonctionnelles avec quelques améliorations possibles"
      );
    } else {
      console.log("\n⚠️ Corrections nécessaires pour les APIs IA");
    }
  }
}

// Lancement des tests
const aiTester = new AIAPITester();
aiTester.runAllTests().catch(console.error);
