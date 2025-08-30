const axios = require("axios");

class AnalyticsCompleteTest {
  constructor() {
    this.baseUrl = "http://localhost:3001";
    this.testResults = [];
  }

  async runAllTests() {
    console.log("🧪 === TEST COMPLET ANALYTICS PHASE 5 ===\n");

    try {
      // Test API Analytics
      await this.testAnalyticsAPI();

      // Test Interface Web
      await this.testWebInterface();

      // Test Services
      await this.testServices();

      // Affichage des résultats
      this.displayResults();
    } catch (error) {
      console.error("❌ Erreur lors des tests:", error.message);
    }
  }

  async testAnalyticsAPI() {
    console.log("🔌 Test API Analytics...");

    const endpoints = [
      "/api/analytics/real-time",
      "/api/analytics/predictions",
      "/api/analytics/business",
      "/api/analytics/optimization",
      "/api/analytics/anomalies",
      "/api/analytics/ab-testing",
      "/api/analytics/performance",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint}`);
        this.addResult(`API ${endpoint}`, true, `Status: ${response.status}`);
      } catch (error) {
        this.addResult(
          `API ${endpoint}`,
          false,
          `Erreur: ${error.response?.status || error.message}`
        );
      }
    }
  }

  async testWebInterface() {
    console.log("\n🌐 Test Interface Web...");

    try {
      // Test page dashboard
      const dashboardResponse = await axios.get(`${this.baseUrl}/dashboard`);
      this.addResult(
        "Page Dashboard",
        true,
        `Status: ${dashboardResponse.status}`
      );

      // Vérifier présence widgets analytics
      const hasAnalyticsWidgets = dashboardResponse.data.includes(
        "analytics-container"
      );
      this.addResult(
        "Widgets Analytics",
        hasAnalyticsWidgets,
        hasAnalyticsWidgets ? "Présents" : "Absents"
      );

      // Vérifier présence script analytics
      const hasAnalyticsScript = dashboardResponse.data.includes(
        "analytics-dashboard.js"
      );
      this.addResult(
        "Script Analytics",
        hasAnalyticsScript,
        hasAnalyticsScript ? "Chargé" : "Manquant"
      );
    } catch (error) {
      this.addResult("Interface Web", false, `Erreur: ${error.message}`);
    }
  }

  async testServices() {
    console.log("\n⚙️ Test Services Analytics...");

    const services = [
      "advancedPredictiveAnalytics",
      "businessIntelligence",
      "realTimeOptimization",
      "anomalyDetection",
      "abTesting",
      "performanceMetrics",
    ];

    for (const service of services) {
      try {
        const ServiceClass = require(`../src/services/${service}`);
        const serviceInstance = new ServiceClass();
        const initResult = await serviceInstance.initialize();

        this.addResult(
          `Service ${service}`,
          initResult.success,
          initResult.success ? "Initialisé" : initResult.error || "Échec"
        );
      } catch (error) {
        this.addResult(`Service ${service}`, false, `Erreur: ${error.message}`);
      }
    }
  }

  addResult(test, success, message) {
    this.testResults.push({ test, success, message });
    const icon = success ? "✅" : "❌";
    console.log(`${icon} ${test}: ${message}`);
  }

  displayResults() {
    console.log("\n📊 === RÉSULTATS DES TESTS ===");
    console.log("=".repeat(50));

    const total = this.testResults.length;
    const success = this.testResults.filter((r) => r.success).length;
    const rate = ((success / total) * 100).toFixed(1);

    console.log(`Total: ${total} | Succès: ${success} | Taux: ${rate}%`);

    if (rate >= 90) {
      console.log(
        "🎉 EXCELLENT! Phase 5 Analytics entièrement opérationnelle!"
      );
    } else if (rate >= 70) {
      console.log(
        "✅ BON! Phase 5 Analytics fonctionnelle avec quelques ajustements mineurs."
      );
    } else {
      console.log("⚠️ ATTENTION! Phase 5 Analytics nécessite des corrections.");
    }

    console.log("=".repeat(50));
  }
}

// Exécution
if (require.main === module) {
  const tester = new AnalyticsCompleteTest();
  tester.runAllTests();
}

module.exports = AnalyticsCompleteTest;
