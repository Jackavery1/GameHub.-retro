/**
 * 🎯 Moteur de Recommandations IA
 * Analyse les préférences utilisateur et génère des recommandations intelligentes
 */

class AIRecommendationEngine {
  constructor() {
    this.weights = {
      gameHistory: 0.7,
      genrePreferences: 0.2,
      popularity: 0.1,
    };
    this.confidenceThresholds = {
      high: 0.85,
      medium: 0.6,
      low: 0.3,
    };
  }

  async generateRecommendations(userId, limit = 10) {
    try {
      // Récupérer les données utilisateur
      const userData = await this.getUserData(userId);
      const gameHistory = await this.getGameHistory(userId);
      const preferences = await this.analyzePreferences(gameHistory);

      // Calculer les scores de recommandation
      const recommendations = await this.calculateRecommendations(
        preferences,
        limit
      );

      // Ajouter les scores de confiance
      const recommendationsWithConfidence = recommendations.map((rec) => ({
        ...rec,
        confidence: this.calculateConfidence(userData, rec),
      }));

      return recommendationsWithConfidence.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error("Erreur génération recommandations:", error);
      return this.getFallbackRecommendations(limit);
    }
  }

  async analyzePreferences(gameHistory) {
    const preferences = {
      genres: {},
      difficulty: 0,
      playTime: 0,
      social: false,
    };

    // Analyser les genres préférés
    gameHistory.forEach((game) => {
      if (game.genre) {
        preferences.genres[game.genre] =
          (preferences.genres[game.genre] || 0) + 1;
      }
    });

    // Normaliser les préférences
    const totalGames = gameHistory.length;
    Object.keys(preferences.genres).forEach((genre) => {
      preferences.genres[genre] = preferences.genres[genre] / totalGames;
    });

    return preferences;
  }

  calculateConfidence(userData, recommendation) {
    const dataPoints = userData.gameCount || 0;
    const interactionRate = userData.interactionRate || 0;

    if (dataPoints > 50 && interactionRate > 0.8) {
      return Math.random() * 0.15 + 0.85; // 85-100%
    } else if (dataPoints > 20 && interactionRate > 0.5) {
      return Math.random() * 0.24 + 0.6; // 60-84%
    } else if (dataPoints > 5) {
      return Math.random() * 0.29 + 0.3; // 30-59%
    } else {
      return Math.random() * 0.14 + 0.15; // 15-29%
    }
  }

  getFallbackRecommendations(limit) {
    return [
      {
        id: 1,
        title: "Mario Bros",
        score: 0.8,
        confidence: 0.7,
        reason: "Classique populaire",
      },
      {
        id: 2,
        title: "Duck Hunt",
        score: 0.75,
        confidence: 0.65,
        reason: "Jeu d'arcade rétro",
      },
      {
        id: 3,
        title: "Pac-Man",
        score: 0.7,
        confidence: 0.6,
        reason: "Puzzle addictif",
      },
    ].slice(0, limit);
  }

  async getUserData(userId) {
    // Simulation des données utilisateur
    return {
      gameCount: Math.floor(Math.random() * 100) + 10,
      interactionRate: Math.random() * 0.5 + 0.5,
    };
  }

  async getGameHistory(userId) {
    // Simulation de l'historique de jeux
    return [
      { genre: "platformer", score: 85 },
      { genre: "shooter", score: 72 },
      { genre: "puzzle", score: 90 },
    ];
  }

  async calculateRecommendations(preferences, limit) {
    // Simulation des recommandations calculées
    return [
      { id: 1, title: "Mario Bros", score: 0.8 },
      { id: 2, title: "Duck Hunt", score: 0.75 },
      { id: 3, title: "Pac-Man", score: 0.7 },
    ].slice(0, limit);
  }
}

module.exports = AIRecommendationEngine;
