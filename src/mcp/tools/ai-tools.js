/**
 * PHASE 4: Outils d'Intelligence Artificielle
 * GameHub Retro - Intelligence Artificielle et Gaming Avancé
 */

const {
  User,
  Game,
  Tournament,
  Match,
  Registration,
} = require("../../models/index");

class AITools {
  constructor() {
    this.recommendationEngine = new RecommendationEngine();
    this.matchmakingAI = new MatchmakingAI();
    this.performancePredictor = new PerformancePredictor();
    this.gameAnalyzer = new GameAnalyzer();
  }

  // ===== RECOMMANDATIONS DE JEUX PERSONNALISÉES =====
  async getPersonalizedGameRecommendations(userId, limit = 5) {
    try {
      const user = await User.findById(userId).populate("favorites");
      if (!user) throw new Error("Utilisateur non trouvé");

      const userPreferences = await this.analyzeUserPreferences(user);
      const recommendations =
        await this.recommendationEngine.getRecommendations(
          userPreferences,
          limit
        );

      return {
        success: true,
        recommendations,
        userPreferences,
        confidence: recommendations.map((r) => r.confidence),
      };
    } catch (error) {
      console.error("❌ Erreur recommandations IA:", error);
      return {
        success: false,
        error: error.message,
        recommendations: this.getFallbackRecommendations(),
      };
    }
  }

  async analyzeUserPreferences(user) {
    const preferences = {
      genres: {},
      platforms: {},
      difficulty: "medium",
      playTime: "medium",
      social: "medium",
    };

    // Analyser l'historique des jeux
    const gameHistory = await Match.find({
      $or: [{ "playerA.user": user._id }, { "playerB.user": user._id }],
    }).populate("tournament");

    // Analyser les favoris
    if (user.favorites && user.favorites.length > 0) {
      for (const game of user.favorites) {
        if (game.genre)
          preferences.genres[game.genre] =
            (preferences.genres[game.genre] || 0) + 1;
        if (game.platform)
          preferences.platforms[game.platform] =
            (preferences.platforms[game.platform] || 0) + 1;
      }
    }

    // Analyser les performances
    const performance = await this.analyzeUserPerformance(user._id);
    preferences.difficulty = this.mapPerformanceToDifficulty(
      performance.winRate
    );

    return preferences;
  }

  // ===== MATCHMAKING IA POUR TOURNOIS =====
  async findOptimalMatchmaking(userId, tournamentId) {
    try {
      const user = await User.findById(userId);
      const tournament = await Tournament.findById(tournamentId);

      if (!user || !tournament) throw new Error("Données invalides");

      const opponents = await this.matchmakingAI.findOptimalOpponents(
        user,
        tournament,
        await this.getAvailableParticipants(tournamentId)
      );

      return {
        success: true,
        opponents: opponents.slice(0, 3), // Top 3 recommandations
        reasoning: this.explainMatchmaking(opponents[0], user),
      };
    } catch (error) {
      console.error("❌ Erreur matchmaking IA:", error);
      return {
        success: false,
        error: error.message,
        opponents: await this.getRandomOpponents(tournamentId),
      };
    }
  }

  // ===== ANALYSE PRÉDICTIVE DES PERFORMANCES =====
  async predictUserPerformance(userId, gameId) {
    try {
      const user = await User.findById(userId);
      const game = await Game.findById(gameId);

      if (!user || !game) throw new Error("Données invalides");

      const prediction = await this.performancePredictor.predict(
        user,
        game,
        await this.getUserGameHistory(userId, gameId)
      );

      return {
        success: true,
        prediction: {
          expectedScore: prediction.expectedScore,
          confidence: prediction.confidence,
          factors: prediction.factors,
          improvement: prediction.improvement,
        },
      };
    } catch (error) {
      console.error("❌ Erreur prédiction IA:", error);
      return {
        success: false,
        error: error.message,
        prediction: this.getDefaultPrediction(),
      };
    }
  }

  // ===== ANALYSE DES JEUX ET MÉTRIQUES =====
  async analyzeGameTrends(gameId, timeframe = "30d") {
    try {
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Jeu non trouvé");

      const trends = await this.gameAnalyzer.analyzeTrends(game, timeframe);

      return {
        success: true,
        trends: {
          popularity: trends.popularity,
          difficulty: trends.difficulty,
          playerSkill: trends.playerSkill,
          recommendations: trends.recommendations,
        },
      };
    } catch (error) {
      console.error("❌ Erreur analyse tendances IA:", error);
      return {
        success: false,
        error: error.message,
        trends: this.getDefaultTrends(),
      };
    }
  }

  // ===== MÉTHODES UTILITAIRES =====
  async getUserGameHistory(userId, gameId) {
    return await Match.find({
      $or: [{ "playerA.user": userId }, { "playerB.user": userId }],
      "tournament.game": gameId,
    }).populate("tournament");
  }

  async getAvailableParticipants(tournamentId) {
    return await Registration.find({ tournament: tournamentId })
      .populate("user")
      .lean();
  }

  async analyzeUserPerformance(userId) {
    const matches = await Match.find({
      $or: [{ "playerA.user": userId }, { "playerB.user": userId }],
    });

    const totalMatches = matches.length;
    const wins = matches.filter(
      (m) => m.winner && m.winner.toString() === userId.toString()
    ).length;

    return {
      winRate: totalMatches > 0 ? wins / totalMatches : 0.5,
      totalMatches,
      averageScore: this.calculateAverageScore(matches, userId),
    };
  }

  calculateAverageScore(matches, userId) {
    const userMatches = matches.filter(
      (m) =>
        m.playerA.user.toString() === userId.toString() ||
        m.playerB.user.toString() === userId.toString()
    );

    if (userMatches.length === 0) return 0;

    const totalScore = userMatches.reduce((sum, match) => {
      if (match.playerA.user.toString() === userId.toString()) {
        return sum + (match.playerAScore || 0);
      } else {
        return sum + (match.playerBScore || 0);
      }
    }, 0);

    return totalScore / userMatches.length;
  }

  mapPerformanceToDifficulty(winRate) {
    if (winRate >= 0.8) return "hard";
    if (winRate >= 0.6) return "medium-hard";
    if (winRate >= 0.4) return "medium";
    if (winRate >= 0.2) return "easy-medium";
    return "easy";
  }

  getFallbackRecommendations() {
    return [
      {
        game: "Super Mario Bros",
        confidence: 0.7,
        reason: "Classique populaire",
      },
      { game: "Duck Hunt", confidence: 0.6, reason: "Jeu d'arcade accessible" },
      { game: "Contra", confidence: 0.5, reason: "Action intense" },
    ];
  }

  async getRandomOpponents(tournamentId) {
    const participants = await this.getAvailableParticipants(tournamentId);
    return participants.slice(0, 3);
  }

  getDefaultPrediction() {
    return {
      expectedScore: 50,
      confidence: 0.5,
      factors: ["Historique limité"],
      improvement: "Jouer plus pour améliorer la prédiction",
    };
  }

  getDefaultTrends() {
    return {
      popularity: "stable",
      difficulty: "medium",
      playerSkill: "mixed",
      recommendations: ["Continuer à jouer pour plus de données"],
    };
  }

  explainMatchmaking(opponent, user) {
    return `Recommandé car: niveau similaire, style de jeu compatible, et historique de matchs équilibrés`;
  }
}

// ===== MOTEUR DE RECOMMANDATION =====
class RecommendationEngine {
  async getRecommendations(userPreferences, limit) {
    // Algorithme de recommandation basé sur les préférences
    const games = await Game.find().lean();

    return games
      .map((game) => ({
        game: game.name,
        confidence: this.calculateConfidence(game, userPreferences),
        reason: this.generateReason(game, userPreferences),
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  calculateConfidence(game, preferences) {
    let confidence = 0.5; // Base neutre

    // Facteurs de genre
    if (game.genre && preferences.genres[game.genre]) {
      confidence += 0.2;
    }

    // Facteurs de plateforme
    if (game.platform && preferences.platforms[game.platform]) {
      confidence += 0.15;
    }

    // Facteurs de difficulté
    if (game.difficulty === preferences.difficulty) {
      confidence += 0.25;
    }

    return Math.min(confidence, 1.0);
  }

  generateReason(game, preferences) {
    const reasons = [];

    if (game.genre && preferences.genres[game.genre]) {
      reasons.push(`Genre préféré: ${game.genre}`);
    }

    if (game.platform && preferences.platforms[game.platform]) {
      reasons.push(`Plateforme préférée: ${game.platform}`);
    }

    if (game.difficulty === preferences.difficulty) {
      reasons.push(`Niveau de difficulté adapté`);
    }

    return reasons.length > 0
      ? reasons.join(", ")
      : "Recommandation basée sur la popularité";
  }
}

// ===== IA DE MATCHMAKING =====
class MatchmakingAI {
  async findOptimalOpponents(user, tournament, participants) {
    const userSkill = await this.calculateUserSkill(user);

    return participants
      .filter((p) => p.user._id.toString() !== user._id.toString())
      .map(async (participant) => ({
        user: participant.user,
        compatibility: this.calculateCompatibility(
          user,
          participant.user,
          userSkill
        ),
        skillDifference: Math.abs(
          userSkill - (await this.calculateUserSkill(participant.user))
        ),
      }))
      .sort((a, b) => b.compatibility - a.compatibility);
  }

  async calculateUserSkill(user) {
    const matches = await Match.find({
      $or: [{ "playerA.user": user._id }, { "playerB.user": user._id }],
    });

    if (matches.length === 0) return 50; // Skill par défaut

    const winRate =
      matches.filter(
        (m) => m.winner && m.winner.toString() === user._id.toString()
      ).length / matches.length;

    return Math.round(winRate * 100);
  }

  calculateCompatibility(user1, user2, user1Skill) {
    // Facteurs de compatibilité
    let compatibility = 0.5;

    // Différence de skill (préférer des matchs équilibrés)
    const skillDiff = Math.abs(user1Skill - 50); // 50 = skill moyen
    if (skillDiff < 20) compatibility += 0.3;
    else if (skillDiff < 40) compatibility += 0.2;
    else compatibility += 0.1;

    // Autres facteurs (à développer)
    return Math.min(compatibility, 1.0);
  }
}

// ===== PRÉDICTEUR DE PERFORMANCE =====
class PerformancePredictor {
  async predict(user, game, gameHistory) {
    const baseScore = 50;
    let confidence = 0.5;

    // Facteurs de prédiction
    const factors = [];
    let expectedScore = baseScore;

    if (gameHistory.length > 0) {
      const recentPerformance = this.analyzeRecentPerformance(
        gameHistory,
        user._id
      );
      expectedScore = recentPerformance.averageScore;
      confidence = Math.min(0.8, 0.5 + gameHistory.length * 0.1);
      factors.push(`Historique: ${recentPerformance.trend}`);
    }

    if (user.favorites && user.favorites.includes(game._id)) {
      expectedScore += 10;
      factors.push("Jeu favori");
    }

    return {
      expectedScore: Math.round(expectedScore),
      confidence,
      factors,
      improvement: this.suggestImprovement(expectedScore, confidence),
    };
  }

  analyzeRecentPerformance(gameHistory, userId) {
    const recentMatches = gameHistory.slice(-5); // 5 derniers matchs

    if (recentMatches.length === 0) {
      return { averageScore: 50, trend: "stable" };
    }

    const scores = recentMatches.map((match) => {
      if (match.playerA.user.toString() === userId.toString()) {
        return match.playerAScore || 50;
      } else {
        return match.playerBScore || 50;
      }
    });

    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Calculer la tendance
    const trend = this.calculateTrend(scores);

    return { averageScore, trend };
  }

  calculateTrend(scores) {
    if (scores.length < 2) return "stable";

    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 5) return "amélioration";
    if (difference < -5) return "déclin";
    return "stable";
  }

  suggestImprovement(expectedScore, confidence) {
    if (confidence < 0.6) {
      return "Jouer plus de matchs pour améliorer la prédiction";
    }
    if (expectedScore < 40) {
      return "Pratiquer les bases et analyser les replays";
    }
    if (expectedScore > 80) {
      return "Maintenir le niveau et challenger des joueurs plus forts";
    }
    return "Continuer la progression actuelle";
  }
}

// ===== ANALYSEUR DE JEUX =====
class GameAnalyzer {
  async analyzeTrends(game, timeframe) {
    // Analyser les tendances du jeu
    const matches = await Match.find({
      "tournament.game": game._id,
      createdAt: {
        $gte: new Date(Date.now() - this.parseTimeframe(timeframe)),
      },
    }).populate("tournament");

    const trends = {
      popularity: this.analyzePopularity(matches),
      difficulty: this.analyzeDifficulty(matches),
      playerSkill: this.analyzePlayerSkill(matches),
      recommendations: this.generateTrendRecommendations(matches),
    };

    return trends;
  }

  parseTimeframe(timeframe) {
    const now = Date.now();
    switch (timeframe) {
      case "7d":
        return now - 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return now - 30 * 24 * 60 * 60 * 1000;
      case "90d":
        return now - 90 * 24 * 60 * 60 * 1000;
      default:
        return now - 30 * 24 * 60 * 60 * 1000;
    }
  }

  analyzePopularity(matches) {
    const matchCount = matches.length;
    if (matchCount > 100) return "très populaire";
    if (matchCount > 50) return "populaire";
    if (matchCount > 20) return "modérément populaire";
    return "peu populaire";
  }

  analyzeDifficulty(matches) {
    if (matches.length === 0) return "medium";

    const scores = matches
      .flatMap((m) => [m.playerAScore || 50, m.playerBScore || 50])
      .filter((score) => score > 0);

    if (scores.length === 0) return "medium";

    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    if (averageScore < 30) return "difficile";
    if (averageScore < 50) return "moyen-difficile";
    if (averageScore < 70) return "moyen";
    if (averageScore < 90) return "facile";
    return "très facile";
  }

  analyzePlayerSkill(matches) {
    if (matches.length === 0) return "mixed";

    const skillLevels = matches.map((match) => {
      const scoreA = match.playerAScore || 50;
      const scoreB = match.playerBScore || 50;
      return Math.max(scoreA, scoreB);
    });

    const averageSkill =
      skillLevels.reduce((sum, skill) => sum + skill, 0) / skillLevels.length;

    if (averageSkill > 80) return "élevé";
    if (averageSkill > 60) return "intermédiaire-élevé";
    if (averageSkill > 40) return "intermédiaire";
    return "débutant";
  }

  generateTrendRecommendations(matches) {
    const recommendations = [];

    if (matches.length < 10) {
      recommendations.push(
        "Plus de données nécessaires pour des recommandations précises"
      );
    } else {
      const difficulty = this.analyzeDifficulty(matches);
      if (difficulty === "difficile") {
        recommendations.push("Jeu recommandé pour les joueurs expérimentés");
      } else if (difficulty === "facile") {
        recommendations.push("Parfait pour les débutants");
      }

      const popularity = this.analyzePopularity(matches);
      if (popularity === "très populaire") {
        recommendations.push(
          "Communauté active, nombreux adversaires disponibles"
        );
      }
    }

    return recommendations;
  }
}

module.exports = { AITools };
