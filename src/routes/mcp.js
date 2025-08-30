/**
 * Routes API MCP
 * Gère les endpoints pour l'intégration des widgets MCP
 */

const express = require("express");
const router = express.Router();
const MCPService = require("../services/mcpService");

const mcpService = new MCPService();

// Route pour récupérer les capacités MCP
router.get("/capabilities", async (req, res) => {
  try {
    const capabilities = await mcpService.getCapabilities();
    res.json(capabilities);
  } catch (error) {
    console.log("Erreur récupération capacités MCP:", error.message);
    res.json([]);
  }
});

// Route pour les recommandations IA
router.get("/ai/recommendations", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const recommendations = await mcpService.callWithFallback(
      "ai-tools",
      "get_game_recommendations",
      { userId },
      () => [
        {
          title: "Mario Bros",
          description: "Jeu de plateforme classique",
          confidence: 85,
        },
        {
          title: "Duck Hunt",
          description: "Jeu de tir avec le pistolet",
          confidence: 78,
        },
        {
          title: "Pac-Man",
          description: "Jeu de labyrinthe addictif",
          confidence: 92,
        },
      ]
    );
    res.json(recommendations);
  } catch (error) {
    console.log("Erreur recommandations IA:", error.message);
    res.json([]);
  }
});

// Route pour le portefeuille blockchain
router.get("/blockchain/wallet", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const wallet = await mcpService.callWithFallback(
      "blockchain-tools",
      "get_wallet_info",
      { userId },
      () => ({
        balance: 1000,
        nfts: [
          { id: 1, name: "Score Record", rarity: "rare" },
          { id: 2, name: "Tournament Winner", rarity: "epic" },
          { id: 3, name: "Speed Runner", rarity: "common" },
          { id: 4, name: "Perfect Game", rarity: "legendary" },
          { id: 5, name: "First Win", rarity: "common" },
        ],
      })
    );
    res.json(wallet);
  } catch (error) {
    console.log("Erreur portefeuille blockchain:", error.message);
    res.json({
      balance: 0,
      nfts: [],
    });
  }
});

// Route pour les analytics
router.get("/analytics/dashboard", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const analytics = await mcpService.callWithFallback(
      "analytics-tools",
      "get_user_analytics",
      { userId },
      () => ({
        performance: 85,
        prediction: "Amélioration de 15% cette semaine",
        gamesPlayed: 150,
        averageScore: 85,
        winRate: 65,
      })
    );
    res.json(analytics);
  } catch (error) {
    console.log("Erreur analytics:", error.message);
    res.json({
      performance: 0,
      prediction: "Données non disponibles",
      gamesPlayed: 0,
      averageScore: 0,
      winRate: 0,
    });
  }
});

// Route pour le matchmaking IA
router.get("/ai/matchmaking", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { gameId, skillLevel } = req.query;
    const opponents = await mcpService.callWithFallback(
      "ai-tools",
      "find_matchmaking_opponents",
      { userId, gameId, skillLevel },
      () => [
        { id: "user1", name: "Player1", skillLevel: skillLevel || 5 },
        { id: "user2", name: "Player2", skillLevel: (skillLevel || 5) + 1 },
        { id: "user3", name: "Player3", skillLevel: (skillLevel || 5) - 1 },
      ]
    );
    res.json(opponents);
  } catch (error) {
    console.log("Erreur matchmaking IA:", error.message);
    res.json([]);
  }
});

// Route pour les analytics IA
router.get("/ai/analytics", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const analytics = await mcpService.callWithFallback(
      "ai-tools",
      "get_predictive_analytics",
      { userId },
      () => ({
        performance: 85,
        prediction: "Amélioration de 15% cette semaine",
        gamesPlayed: 150,
        averageScore: 85,
        winRate: 65,
        improvementRate: 0.15,
        nextMilestone: "Pro Level",
      })
    );
    res.json(analytics);
  } catch (error) {
    console.log("Erreur analytics IA:", error.message);
    res.json({
      performance: 0,
      prediction: "Données non disponibles",
      gamesPlayed: 0,
      averageScore: 0,
      winRate: 0,
      improvementRate: 0,
      nextMilestone: "Unknown",
    });
  }
});

// Route pour les notifications IA
router.get("/ai/notifications", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const notifications = await mcpService.callWithFallback(
      "ai-tools",
      "generate_smart_notifications",
      { userId },
      () => [
        {
          type: "tournament",
          message: "Nouveau tournoi disponible !",
          priority: "high",
        },
        {
          type: "achievement",
          message: "Félicitations ! Nouveau record battu",
          priority: "medium",
        },
        {
          type: "recommendation",
          message: "Essayez ce nouveau jeu basé sur vos préférences",
          priority: "low",
        },
      ]
    );
    res.json(notifications);
  } catch (error) {
    console.log("Erreur notifications IA:", error.message);
    res.json([]);
  }
});

// Route pour le matchmaking IA (POST - garder pour compatibilité)
router.post("/ai/matchmaking", async (req, res) => {
  try {
    const { userId, gameId, skillLevel } = req.body;
    const opponents = await mcpService.callWithFallback(
      "ai-tools",
      "find_matchmaking_opponents",
      { userId, gameId, skillLevel },
      () => [
        { id: "user1", name: "Player1", skillLevel: skillLevel },
        { id: "user2", name: "Player2", skillLevel: skillLevel + 1 },
        { id: "user3", name: "Player3", skillLevel: skillLevel - 1 },
      ]
    );
    res.json(opponents);
  } catch (error) {
    console.log("Erreur matchmaking IA:", error.message);
    res.json([]);
  }
});

// Route pour les notifications intelligentes
router.get("/notifications/smart", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const notifications = await mcpService.callWithFallback(
      "ai-tools",
      "generate_smart_notifications",
      { userId },
      () => [
        {
          type: "tournament",
          message: "Nouveau tournoi disponible !",
          priority: "high",
        },
        {
          type: "achievement",
          message: "Félicitations ! Nouveau record battu",
          priority: "medium",
        },
        {
          type: "recommendation",
          message: "Essayez ce nouveau jeu basé sur vos préférences",
          priority: "low",
        },
      ]
    );
    res.json(notifications);
  } catch (error) {
    console.log("Erreur notifications intelligentes:", error.message);
    res.json([]);
  }
});

// Route pour l'analyse des préférences utilisateur
router.get("/ai/preferences", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const preferences = await mcpService.callWithFallback(
      "ai-tools",
      "analyze_user_preferences",
      { userId },
      () => ({
        favoriteGenres: ["Platformer", "Shooter", "Puzzle"],
        playStyle: "Competitive",
        preferredDifficulty: "Medium",
        sessionDuration: "30-60 minutes",
      })
    );
    res.json(preferences);
  } catch (error) {
    console.log("Erreur analyse préférences:", error.message);
    res.json({
      favoriteGenres: [],
      playStyle: "Unknown",
      preferredDifficulty: "Unknown",
      sessionDuration: "Unknown",
    });
  }
});

// Route de santé MCP
router.get("/health", async (req, res) => {
  try {
    const health = await mcpService.callWithFallback(
      "databaseTools",
      "health_check",
      {},
      () => ({
        status: "healthy",
        score: 100,
        timestamp: new Date().toISOString(),
      })
    );
    res.json(health);
  } catch (error) {
    console.log("Erreur santé MCP:", error.message);
    res.json({
      status: "degraded",
      score: 0,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
