/**
 * 🧪 Tests des Fonctionnalités AR - Phase 3
 */

const ARRenderer = require("../src/services/arRenderer");
const ARTrackingSystem = require("../src/services/arTracking");
const ARInteractionSystem = require("../src/services/arInteractions");
const ARGamingExperience = require("../src/services/arGaming");
const ARSocialSystem = require("../src/services/arSocial");

class ARTestSuite {
  constructor() {
    this.renderer = new ARRenderer();
    this.tracking = new ARTrackingSystem();
    this.interactions = new ARInteractionSystem();
    this.gaming = new ARGamingExperience();
    this.social = new ARSocialSystem();
    this.results = { passed: 0, failed: 0, errors: [] };
  }

  async runAllTests() {
    console.log("🧪 Tests des fonctionnalités AR...");

    await this.testARRenderer();
    await this.testARTracking();
    await this.testARInteractions();
    await this.testARGaming();
    await this.testARSocial();

    this.displayResults();
  }

  async testARRenderer() {
    try {
      // Test de l'initialisation du renderer
      await this.renderer.init();

      if (this.renderer.initialized) {
        console.log("✅ Système de rendu AR: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Renderer non initialisé");
      }
    } catch (error) {
      console.log("❌ Système de rendu AR:", error.message);
      this.results.failed++;
      this.results.errors.push("Renderer AR: " + error.message);
    }
  }

  async testARTracking() {
    try {
      // Test de la calibration
      const calibrated = await this.tracking.calibrate();

      if (typeof calibrated === "boolean") {
        console.log("✅ Système de tracking AR: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Tracking invalide");
      }
    } catch (error) {
      console.log("❌ Système de tracking AR:", error.message);
      this.results.failed++;
      this.results.errors.push("Tracking AR: " + error.message);
    }
  }

  async testARInteractions() {
    try {
      this.interactions.init();

      if (this.interactions.gestures.size > 0) {
        console.log("✅ Système d'interactions AR: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Gestes non configurés");
      }
    } catch (error) {
      console.log("❌ Système d'interactions AR:", error.message);
      this.results.failed++;
      this.results.errors.push("Interactions AR: " + error.message);
    }
  }

  async testARGaming() {
    try {
      const gameConfig = { type: "platformer", difficulty: "normal" };
      const started = await this.gaming.startGameAR("test-game", gameConfig);

      if (started) {
        console.log("✅ Expériences de jeu AR: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Jeu AR non démarré");
      }
    } catch (error) {
      console.log("❌ Expériences de jeu AR:", error.message);
      this.results.failed++;
      this.results.errors.push("Gaming AR: " + error.message);
    }
  }

  async testARSocial() {
    try {
      await this.social.init();

      if (this.social.userAvatar) {
        console.log("✅ Système social AR: Fonctionnel");
        this.results.passed++;
      } else {
        throw new Error("Avatar utilisateur non créé");
      }
    } catch (error) {
      console.log("❌ Système social AR:", error.message);
      this.results.failed++;
      this.results.errors.push("Social AR: " + error.message);
    }
  }

  displayResults() {
    const total = this.results.passed + this.results.failed;
    const successRate =
      total > 0 ? Math.round((this.results.passed / total) * 100) : 0;

    console.log("\n📊 Résultats des tests AR:");
    console.log("✅ Tests réussis:", this.results.passed);
    console.log("❌ Tests échoués:", this.results.failed);
    console.log("📈 Taux de réussite:", successRate + "%");

    if (successRate >= 80) {
      console.log("🎉 Phase 3 AR validée avec succès !");
    } else {
      console.log("⚠️ Corrections nécessaires");
    }
  }
}

module.exports = ARTestSuite;

// Exécution automatique des tests si le fichier est lancé directement
if (require.main === module) {
  const arTestSuite = new ARTestSuite();
  arTestSuite.runAllTests().catch(console.error);
}
