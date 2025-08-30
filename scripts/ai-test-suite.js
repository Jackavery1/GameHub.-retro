/**
 * 🧪 Tests des Fonctionnalités IA - Phase 2
 */

const AIRecommendationEngine = require("../src/services/aiRecommendationEngine");
const IntelligentMatchmaking = require("../src/services/intelligentMatchmaking");
const PredictiveAnalytics = require("../src/services/predictiveAnalytics");
const SmartNotifications = require("../src/services/smartNotifications");

class AITestSuite {
  constructor() {
    this.recommendationEngine = new AIRecommendationEngine();
    this.matchmaking = new IntelligentMatchmaking();
    this.analytics = new PredictiveAnalytics();
    this.notifications = new SmartNotifications();
    this.results = { passed: 0, failed: 0, errors: [] };
  }

  async runAllTests() {
    console.log("🧪 Tests des fonctionnalités IA...");

    await this.testRecommendationEngine();
    await this.testMatchmaking();
    await this.testAnalytics();
    await this.testNotifications();

    this.displayResults();
  }

  async testRecommendationEngine() {
    try {
      const recommendations =
        await this.recommendationEngine.generateRecommendations("test-user", 5);

      if (recommendations && recommendations.length > 0) {
        console.log("✅ Moteur de recommandations: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Aucune recommandation générée");
      }
    } catch (error) {
      console.log("❌ Moteur de recommandations:", error.message);
      this.results.failed++;
      this.results.errors.push("Moteur de recommandations: " + error.message);
    }
  }

  async testMatchmaking() {
    try {
      const match = await this.matchmaking.findOpponent(
        "test-user",
        "test-game"
      );

      if (match && (match.opponent || match.estimatedWaitTime !== undefined)) {
        console.log("✅ Matchmaking intelligent: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Matchmaking invalide");
      }
    } catch (error) {
      console.log("❌ Matchmaking intelligent:", error.message);
      this.results.failed++;
      this.results.errors.push("Matchmaking: " + error.message);
    }
  }

  async testAnalytics() {
    try {
      const prediction = await this.analytics.predictPerformance(
        "test-user",
        "test-game"
      );

      if (prediction && prediction.expectedScore !== undefined) {
        console.log("✅ Analytics prédictifs: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Prédiction invalide");
      }
    } catch (error) {
      console.log("❌ Analytics prédictifs:", error.message);
      this.results.failed++;
      this.results.errors.push("Analytics: " + error.message);
    }
  }

  async testNotifications() {
    try {
      const notifications = await this.notifications.generateSmartNotifications(
        "test-user"
      );

      if (Array.isArray(notifications)) {
        console.log("✅ Notifications intelligentes: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Notifications invalides");
      }
    } catch (error) {
      console.log("❌ Notifications intelligentes:", error.message);
      this.results.failed++;
      this.results.errors.push("Notifications: " + error.message);
    }
  }

  displayResults() {
    const total = this.results.passed + this.results.failed;
    const successRate =
      total > 0 ? Math.round((this.results.passed / total) * 100) : 0;

    console.log("\n📊 Résultats des tests IA:");
    console.log("✅ Tests réussis:", this.results.passed);
    console.log("❌ Tests échoués:", this.results.failed);
    console.log("📈 Taux de réussite:", successRate + "%");

    if (successRate >= 80) {
      console.log("🎉 Phase 2 IA validée avec succès !");
    } else {
      console.log("⚠️ Corrections nécessaires");
    }
  }
}

module.exports = AITestSuite;

// Exécution automatique des tests si le fichier est lancé directement
if (require.main === module) {
  const aiTestSuite = new AITestSuite();
  aiTestSuite.runAllTests().catch(console.error);
}
