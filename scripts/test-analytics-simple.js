const AdvancedPredictiveAnalytics = require("../src/services/advancedPredictiveAnalytics");

console.log("🧪 Test Analytics Simplifié - Phase 5");

async function testAnalytics() {
  try {
    console.log("1. Test chargement service...");
    const service = new AdvancedPredictiveAnalytics();
    console.log("✅ Service chargé");

    console.log("2. Test initialisation...");
    const initResult = await service.initialize();
    console.log("✅ Initialisation:", initResult.success ? "SUCCÈS" : "ÉCHEC");

    console.log("3. Test prédiction utilisateur...");
    const prediction = await service.predictUserBehavior("test_user", "7d");
    console.log("✅ Prédiction:", prediction ? "SUCCÈS" : "ÉCHEC");

    console.log("4. Test prédiction tendances...");
    const trends = await service.predictGameTrends("30d");
    console.log("✅ Tendances:", trends ? "SUCCÈS" : "ÉCHEC");

    console.log("\n🎉 Tests Analytics Phase 5 terminés avec succès!");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAnalytics();
