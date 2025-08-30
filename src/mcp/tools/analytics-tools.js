/**
 * PHASE 4: Outils Analytics Avancés
 * GameHub Retro - Prédictions et Machine Learning
 */

const {
  User,
  Game,
  Tournament,
  Match,
  Registration,
} = require("../../models/index");

class AnalyticsTools {
  constructor() {
    this.predictiveEngine = new PredictiveEngine();
    this.mlOptimizer = new MLOptimizer();
    this.dataAnalyzer = new DataAnalyzer();
    this.realTimeDashboard = new RealTimeDashboard();
    this.isMLEnabled = this.checkMLSupport();
  }

  // ===== VÉRIFICATION DU SUPPORT ML =====
  checkMLSupport() {
    // Vérifier si TensorFlow.js ou autre librairie ML est disponible
    return (
      typeof window !== "undefined" &&
      (window.tf ||
        window.TensorFlow ||
        (typeof require !== "undefined" && require("tensorflow")))
    );
  }

  // ===== PRÉDICTIONS ET INSIGHTS =====
  async predictUserBehavior(userId, timeframe = "30d") {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("Utilisateur non trouvé");

      const userData = await this.collectUserData(userId, timeframe);
      const prediction = await this.predictiveEngine.predictBehavior(userData);

      return {
        success: true,
        prediction: {
          nextGame: prediction.nextGame,
          playTime: prediction.playTime,
          skillImprovement: prediction.skillImprovement,
          tournamentParticipation: prediction.tournamentParticipation,
          confidence: prediction.confidence,
        },
      };
    } catch (error) {
      console.error("❌ Erreur prédiction comportement:", error);
      return {
        success: false,
        error: error.message,
        prediction: this.getDefaultBehaviorPrediction(),
      };
    }
  }

  async predictTournamentOutcome(tournamentId, userId) {
    try {
      const tournament = await Tournament.findById(tournamentId);
      const user = await User.findById(userId);

      if (!tournament || !user) throw new Error("Données invalides");

      const tournamentData = await this.collectTournamentData(tournamentId);
      const userPerformance = await this.analyzeUserPerformance(userId);

      const prediction = await this.predictiveEngine.predictTournamentOutcome(
        tournamentData,
        userPerformance
      );

      return {
        success: true,
        prediction: {
          expectedRank: prediction.expectedRank,
          winProbability: prediction.winProbability,
          skillMatch: prediction.skillMatch,
          recommendations: prediction.recommendations,
          confidence: prediction.confidence,
        },
      };
    } catch (error) {
      console.error("❌ Erreur prédiction tournoi:", error);
      return {
        success: false,
        error: error.message,
        prediction: this.getDefaultTournamentPrediction(),
      };
    }
  }

  async predictGamePopularity(gameId, timeframe = "90d") {
    try {
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Jeu non trouvé");

      const gameData = await this.collectGameData(gameId, timeframe);
      const prediction = await this.predictiveEngine.predictGamePopularity(
        gameData
      );

      return {
        success: true,
        prediction: {
          popularityTrend: prediction.popularityTrend,
          playerGrowth: prediction.playerGrowth,
          tournamentInterest: prediction.tournamentInterest,
          marketDemand: prediction.marketDemand,
          confidence: prediction.confidence,
        },
      };
    } catch (error) {
      console.error("❌ Erreur prédiction popularité:", error);
      return {
        success: false,
        error: error.message,
        prediction: this.getDefaultPopularityPrediction(),
      };
    }
  }

  // ===== MACHINE LEARNING POUR L'OPTIMISATION =====
  async optimizeMatchmaking(tournamentId) {
    try {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) throw new Error("Tournoi non trouvé");

      const participants = await Registration.find({ tournament: tournamentId })
        .populate("user")
        .lean();

      const optimization = await this.mlOptimizer.optimizeMatchmaking(
        participants,
        tournament
      );

      return {
        success: true,
        optimization: {
          brackets: optimization.brackets,
          skillDistribution: optimization.skillDistribution,
          fairnessScore: optimization.fairnessScore,
          recommendations: optimization.recommendations,
        },
      };
    } catch (error) {
      console.error("❌ Erreur optimisation matchmaking:", error);
      return {
        success: false,
        error: error.message,
        optimization: this.getDefaultMatchmakingOptimization(),
      };
    }
  }

  async optimizeGameRecommendations(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("Utilisateur non trouvé");

      const userData = await this.collectUserData(userId, "90d");
      const optimization = await this.mlOptimizer.optimizeRecommendations(
        userData
      );

      return {
        success: true,
        optimization: {
          personalizedGames: optimization.personalizedGames,
          skillProgression: optimization.skillProgression,
          socialRecommendations: optimization.socialRecommendations,
          confidence: optimization.confidence,
        },
      };
    } catch (error) {
      console.error("❌ Erreur optimisation recommandations:", error);
      return {
        success: false,
        error: error.message,
        optimization: this.getDefaultRecommendationOptimization(),
      };
    }
  }

  // ===== ANALYSE DES DONNÉES EN TEMPS RÉEL =====
  async getRealTimeAnalytics() {
    try {
      const analytics = await this.realTimeDashboard.getAnalytics();

      return {
        success: true,
        analytics: {
          activeUsers: analytics.activeUsers,
          currentGames: analytics.currentGames,
          activeTournaments: analytics.activeTournaments,
          systemPerformance: analytics.systemPerformance,
          trends: analytics.trends,
        },
      };
    } catch (error) {
      console.error("❌ Erreur analytics temps réel:", error);
      return {
        success: false,
        error: error.message,
        analytics: this.getMockRealTimeAnalytics(),
      };
    }
  }

  async getAdvancedUserInsights(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("Utilisateur non trouvé");

      const insights = await this.dataAnalyzer.generateUserInsights(userId);

      return {
        success: true,
        insights: {
          performanceMetrics: insights.performanceMetrics,
          skillAnalysis: insights.skillAnalysis,
          socialNetwork: insights.socialNetwork,
          improvementAreas: insights.improvementAreas,
          achievements: insights.achievements,
        },
      };
    } catch (error) {
      console.error("❌ Erreur insights utilisateur:", error);
      return {
        success: false,
        error: error.message,
        insights: this.getDefaultUserInsights(),
      };
    }
  }

  // ===== COLLECTE DE DONNÉES =====
  async collectUserData(userId, timeframe) {
    const timeLimit = new Date(Date.now() - this.parseTimeframe(timeframe));

    const matches = await Match.find({
      $or: [{ "playerA.user": userId }, { "playerB.user": userId }],
      createdAt: { $gte: timeLimit },
    }).populate("tournament");

    const tournaments = await Registration.find({
      user: userId,
      createdAt: { $gte: timeLimit },
    }).populate("tournament");

    const user = await User.findById(userId);

    return {
      user,
      matches,
      tournaments,
      timeframe,
    };
  }

  async collectTournamentData(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    const participants = await Registration.find({
      tournament: tournamentId,
    }).populate("user");
    const matches = await Match.find({ tournament: tournamentId });

    return {
      tournament,
      participants,
      matches,
    };
  }

  async collectGameData(gameId, timeframe) {
    const timeLimit = new Date(Date.now() - this.parseTimeframe(timeframe));

    const matches = await Match.find({
      "tournament.game": gameId,
      createdAt: { $gte: timeLimit },
    }).populate("tournament");

    const tournaments = await Tournament.find({
      game: gameId,
      createdAt: { $gte: timeLimit },
    });

    return {
      matches,
      tournaments,
      timeframe,
    };
  }

  async analyzeUserPerformance(userId) {
    const matches = await Match.find({
      $or: [{ "playerA.user": userId }, { "playerB.user": userId }],
    });

    const totalMatches = matches.length;
    const wins = matches.filter(
      (m) => m.winner && m.winner.toString() === userId.toString()
    ).length;

    const winRate = totalMatches > 0 ? wins / totalMatches : 0.5;
    const averageScore = this.calculateAverageScore(matches, userId);

    return {
      totalMatches,
      winRate,
      averageScore,
      skillLevel: this.mapScoreToSkillLevel(averageScore),
      consistency: this.calculateConsistency(matches, userId),
    };
  }

  // ===== MÉTHODES UTILITAIRES =====
  parseTimeframe(timeframe) {
    const now = Date.now();
    switch (timeframe) {
      case "7d":
        return now - 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return now - 30 * 24 * 60 * 60 * 1000;
      case "90d":
        return now - 90 * 24 * 60 * 60 * 1000;
      case "1y":
        return now - 365 * 24 * 60 * 60 * 1000;
      default:
        return now - 30 * 24 * 60 * 60 * 1000;
    }
  }

  calculateAverageScore(matches, userId) {
    const userMatches = matches.filter(
      (m) =>
        m.playerA.user.toString() === userId.toString() ||
        m.playerB.user.toString() === userId.toString()
    );

    if (userMatches.length === 0) return 50;

    const totalScore = userMatches.reduce((sum, match) => {
      if (match.playerA.user.toString() === userId.toString()) {
        return sum + (match.playerAScore || 50);
      } else {
        return sum + (match.playerBScore || 50);
      }
    }, 0);

    return totalScore / userMatches.length;
  }

  mapScoreToSkillLevel(score) {
    if (score >= 90) return "expert";
    if (score >= 80) return "advanced";
    if (score >= 70) return "intermediate";
    if (score >= 60) return "beginner";
    return "novice";
  }

  calculateConsistency(matches, userId) {
    if (matches.length < 2) return "unknown";

    const scores = matches.map((match) => {
      if (match.playerA.user.toString() === userId.toString()) {
        return match.playerAScore || 50;
      } else {
        return match.playerBScore || 50;
      }
    });

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    const standardDeviation = Math.sqrt(variance);

    if (standardDeviation < 10) return "very_consistent";
    if (standardDeviation < 20) return "consistent";
    if (standardDeviation < 30) return "moderate";
    return "inconsistent";
  }

  // ===== MÉTHODES DE FALLBACK =====
  getDefaultBehaviorPrediction() {
    return {
      nextGame: "Super Mario Bros",
      playTime: "medium",
      skillImprovement: "stable",
      tournamentParticipation: "likely",
      confidence: 0.6,
    };
  }

  getDefaultTournamentPrediction() {
    return {
      expectedRank: "middle",
      winProbability: 0.5,
      skillMatch: "balanced",
      recommendations: ["Pratiquer régulièrement", "Analyser les replays"],
      confidence: 0.5,
    };
  }

  getDefaultPopularityPrediction() {
    return {
      popularityTrend: "stable",
      playerGrowth: "moderate",
      tournamentInterest: "increasing",
      marketDemand: "stable",
      confidence: 0.6,
    };
  }

  getDefaultMatchmakingOptimization() {
    return {
      brackets: "balanced",
      skillDistribution: "even",
      fairnessScore: 0.8,
      recommendations: [
        "Matchmaking équilibré",
        "Groupes de niveau similaires",
      ],
    };
  }

  getDefaultRecommendationOptimization() {
    return {
      personalizedGames: ["Super Mario Bros", "Duck Hunt", "Contra"],
      skillProgression: "gradual",
      socialRecommendations: ["Jouer avec des amis", "Rejoindre des clans"],
      confidence: 0.7,
    };
  }

  getMockRealTimeAnalytics() {
    return {
      activeUsers: 45,
      currentGames: 12,
      activeTournaments: 3,
      systemPerformance: "excellent",
      trends: ["Augmentation des tournois", "Nouveaux utilisateurs actifs"],
    };
  }

  getDefaultUserInsights() {
    return {
      performanceMetrics: {
        totalMatches: 25,
        winRate: 0.68,
        averageScore: 72,
      },
      skillAnalysis: {
        level: "intermediate",
        strengths: ["Réflexes", "Stratégie"],
        weaknesses: ["Précision", "Patience"],
      },
      socialNetwork: {
        friends: 8,
        clans: 2,
        influence: "moderate",
      },
      improvementAreas: ["Pratiquer la précision", "Développer la patience"],
      achievements: ["Premier tournoi gagné", "100 matchs joués"],
    };
  }
}

// ===== MOTEUR PRÉDICTIF =====
class PredictiveEngine {
  async predictBehavior(userData) {
    // Algorithme de prédiction basé sur l'historique
    const { user, matches, tournaments } = userData;

    // Analyser les tendances
    const playTime = this.analyzePlayTimePattern(matches);
    const skillImprovement = this.analyzeSkillImprovement(matches);
    const nextGame = this.predictNextGame(matches, user);

    return {
      nextGame,
      playTime,
      skillImprovement,
      tournamentParticipation: this.predictTournamentParticipation(tournaments),
      confidence: this.calculatePredictionConfidence(matches.length),
    };
  }

  async predictTournamentOutcome(tournamentData, userPerformance) {
    const { tournament, participants, matches } = tournamentData;

    // Calculer la probabilité de victoire
    const winProbability = this.calculateWinProbability(
      userPerformance,
      participants
    );
    const expectedRank = this.predictRank(userPerformance, participants);

    return {
      expectedRank,
      winProbability,
      skillMatch: this.assessSkillMatch(userPerformance, participants),
      recommendations: this.generateTournamentRecommendations(userPerformance),
      confidence: this.calculatePredictionConfidence(matches.length),
    };
  }

  async predictGamePopularity(gameData) {
    const { matches, tournaments } = gameData;

    // Analyser les tendances de popularité
    const popularityTrend = this.analyzePopularityTrend(matches);
    const playerGrowth = this.predictPlayerGrowth(matches);

    return {
      popularityTrend,
      playerGrowth,
      tournamentInterest: this.analyzeTournamentInterest(tournaments),
      marketDemand: this.predictMarketDemand(matches),
      confidence: this.calculatePredictionConfidence(matches.length),
    };
  }

  // Méthodes utilitaires pour les prédictions
  analyzePlayTimePattern(matches) {
    if (matches.length === 0) return "unknown";

    const recentMatches = matches.slice(-10);
    const averageTime =
      recentMatches.reduce((sum, match) => sum + (match.duration || 30), 0) /
      recentMatches.length;

    if (averageTime > 60) return "long";
    if (averageTime > 30) return "medium";
    return "short";
  }

  analyzeSkillImprovement(matches) {
    if (matches.length < 5) return "unknown";

    const firstHalf = matches.slice(0, Math.floor(matches.length / 2));
    const secondHalf = matches.slice(Math.floor(matches.length / 2));

    const firstAvg = this.calculateAverageScore(firstHalf);
    const secondAvg = this.calculateAverageScore(secondHalf);

    if (secondAvg > firstAvg + 10) return "improving";
    if (secondAvg < firstAvg - 10) return "declining";
    return "stable";
  }

  predictNextGame(matches, user) {
    if (matches.length === 0) return "Super Mario Bros";

    // Analyser les jeux les plus joués récemment
    const recentGames = matches
      .slice(-5)
      .map((m) => m.tournament?.game?.name)
      .filter(Boolean);
    const gameCounts = {};

    recentGames.forEach((game) => {
      gameCounts[game] = (gameCounts[game] || 0) + 1;
    });

    const mostPlayed = Object.keys(gameCounts).sort(
      (a, b) => gameCounts[b] - gameCounts[a]
    )[0];
    return mostPlayed || "Super Mario Bros";
  }

  predictTournamentParticipation(tournaments) {
    if (tournaments.length === 0) return "unknown";

    const recentTournaments = tournaments.slice(-3);
    const participationRate = recentTournaments.length / 3;

    if (participationRate > 0.8) return "very_likely";
    if (participationRate > 0.5) return "likely";
    if (participationRate > 0.2) return "possible";
    return "unlikely";
  }

  calculateWinProbability(userPerformance, participants) {
    const userSkill = userPerformance.skillLevel;
    const totalParticipants = participants.length;

    // Calculer la position relative dans le classement
    const skillLevels = participants.map((p) =>
      this.mapSkillToScore(p.user.skillLevel || "intermediate")
    );
    const userScore = this.mapSkillToScore(userSkill);

    const betterPlayers = skillLevels.filter(
      (score) => score > userScore
    ).length;
    const winProbability = Math.max(0.1, 1 - betterPlayers / totalParticipants);

    return Math.round(winProbability * 100) / 100;
  }

  predictRank(userPerformance, participants) {
    const userSkill = userPerformance.skillLevel;
    const skillLevels = participants.map(
      (p) => p.user.skillLevel || "intermediate"
    );

    const sortedSkills = skillLevels.sort(
      (a, b) => this.mapSkillToScore(b) - this.mapSkillToScore(a)
    );
    const userPosition = sortedSkills.findIndex((skill) => skill === userSkill);

    if (userPosition === 0) return "top";
    if (userPosition <= Math.floor(participants.length * 0.25)) return "upper";
    if (userPosition <= Math.floor(participants.length * 0.75)) return "middle";
    return "lower";
  }

  assessSkillMatch(userPerformance, participants) {
    const userSkill = this.mapSkillToScore(userPerformance.skillLevel);
    const participantSkills = participants.map((p) =>
      this.mapSkillToScore(p.user.skillLevel || "intermediate")
    );

    const averageSkill =
      participantSkills.reduce((sum, skill) => sum + skill, 0) /
      participantSkills.length;
    const skillDifference = Math.abs(userSkill - averageSkill);

    if (skillDifference < 20) return "balanced";
    if (skillDifference < 40) return "moderate";
    return "unbalanced";
  }

  generateTournamentRecommendations(userPerformance) {
    const recommendations = [];

    if (userPerformance.consistency === "inconsistent") {
      recommendations.push("Travailler la régularité des performances");
    }

    if (userPerformance.skillLevel === "beginner") {
      recommendations.push("Pratiquer les bases avant le tournoi");
    }

    recommendations.push("Analyser les replays des adversaires");
    recommendations.push("Maintenir une routine d'entraînement");

    return recommendations;
  }

  analyzePopularityTrend(matches) {
    if (matches.length < 10) return "stable";

    const recentMatches = matches.slice(-10);
    const olderMatches = matches.slice(0, 10);

    const recentCount = recentMatches.length;
    const olderCount = olderMatches.length;

    if (recentCount > olderCount * 1.5) return "increasing";
    if (recentCount < olderCount * 0.7) return "decreasing";
    return "stable";
  }

  predictPlayerGrowth(matches) {
    if (matches.length < 20) return "moderate";

    const growthRate = this.calculateGrowthRate(matches);

    if (growthRate > 0.2) return "rapid";
    if (growthRate > 0.1) return "moderate";
    if (growthRate > 0.05) return "slow";
    return "stable";
  }

  analyzeTournamentInterest(tournaments) {
    if (tournaments.length === 0) return "unknown";

    const recentTournaments = tournaments.slice(-5);
    const averageParticipants =
      recentTournaments.reduce((sum, t) => sum + (t.maxPlayers || 8), 0) /
      recentTournaments.length;

    if (averageParticipants > 12) return "high";
    if (averageParticipants > 8) return "moderate";
    return "low";
  }

  predictMarketDemand(matches) {
    if (matches.length < 15) return "stable";

    const demandTrend = this.analyzePopularityTrend(matches);

    if (demandTrend === "increasing") return "high";
    if (demandTrend === "decreasing") return "low";
    return "stable";
  }

  calculatePredictionConfidence(dataPoints) {
    if (dataPoints < 5) return 0.3;
    if (dataPoints < 15) return 0.6;
    if (dataPoints < 50) return 0.8;
    return 0.95;
  }

  calculateAverageScore(matches) {
    if (matches.length === 0) return 50;

    const scores = matches
      .flatMap((m) => [m.playerAScore || 50, m.playerBScore || 50])
      .filter((score) => score > 0);

    if (scores.length === 0) return 50;

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateGrowthRate(matches) {
    if (matches.length < 10) return 0.1;

    const firstHalf = matches.slice(0, Math.floor(matches.length / 2));
    const secondHalf = matches.slice(Math.floor(matches.length / 2));

    const firstCount = firstHalf.length;
    const secondCount = secondHalf.length;

    return (secondCount - firstCount) / firstCount;
  }

  mapSkillToScore(skillLevel) {
    const skillMap = {
      expert: 90,
      advanced: 80,
      intermediate: 70,
      beginner: 60,
      novice: 50,
    };

    return skillMap[skillLevel] || 70;
  }
}

// ===== OPTIMISEUR ML =====
class MLOptimizer {
  async optimizeMatchmaking(participants, tournament) {
    // Algorithme d'optimisation du matchmaking
    const skillLevels = participants.map((p) =>
      this.mapSkillToScore(p.user.skillLevel || "intermediate")
    );
    const brackets = this.createBalancedBrackets(participants, skillLevels);

    return {
      brackets,
      skillDistribution: this.analyzeSkillDistribution(skillLevels),
      fairnessScore: this.calculateFairnessScore(brackets),
      recommendations: this.generateOptimizationRecommendations(brackets),
    };
  }

  async optimizeRecommendations(userData) {
    // Optimisation des recommandations de jeux
    const { user, matches } = userData;

    const personalizedGames = this.findPersonalizedGames(matches, user);
    const skillProgression = this.optimizeSkillProgression(matches);

    return {
      personalizedGames,
      skillProgression,
      socialRecommendations: this.generateSocialRecommendations(user),
      confidence: this.calculateOptimizationConfidence(matches.length),
    };
  }

  createBalancedBrackets(participants, skillLevels) {
    // Créer des brackets équilibrés
    const sortedParticipants = participants
      .map((p, i) => ({ participant: p, skill: skillLevels[i] }))
      .sort((a, b) => b.skill - a.skill);

    const brackets = [];
    const bracketSize = Math.ceil(participants.length / 4);

    for (let i = 0; i < participants.length; i += bracketSize) {
      brackets.push(sortedParticipants.slice(i, i + bracketSize));
    }

    return brackets;
  }

  analyzeSkillDistribution(skillLevels) {
    const average =
      skillLevels.reduce((sum, skill) => sum + skill, 0) / skillLevels.length;
    const variance =
      skillLevels.reduce(
        (sum, skill) => sum + Math.pow(skill - average, 2),
        0
      ) / skillLevels.length;
    const standardDeviation = Math.sqrt(variance);

    if (standardDeviation < 15) return "very_even";
    if (standardDeviation < 25) return "even";
    if (standardDeviation < 35) return "moderate";
    return "uneven";
  }

  calculateFairnessScore(brackets) {
    if (brackets.length < 2) return 1.0;

    const bracketSkills = brackets.map(
      (bracket) => bracket.reduce((sum, p) => sum + p.skill, 0) / bracket.length
    );

    const averageSkill =
      bracketSkills.reduce((sum, skill) => sum + skill, 0) /
      bracketSkills.length;
    const variance =
      bracketSkills.reduce(
        (sum, skill) => sum + Math.pow(skill - averageSkill, 2),
        0
      ) / bracketSkills.length;

    // Score de 0 à 1, plus c'est proche de 1, plus c'est équitable
    return Math.max(0, 1 - variance / 100);
  }

  generateOptimizationRecommendations(brackets) {
    const recommendations = [];

    if (brackets.length > 1) {
      recommendations.push("Brackets équilibrés créés");
      recommendations.push("Niveaux de compétence distribués uniformément");
    }

    if (brackets.some((b) => b.length < 3)) {
      recommendations.push("Considérer fusionner les petits brackets");
    }

    return recommendations;
  }

  findPersonalizedGames(matches, user) {
    if (matches.length === 0)
      return ["Super Mario Bros", "Duck Hunt", "Contra"];

    const gameCounts = {};
    matches.forEach((match) => {
      const gameName = match.tournament?.game?.name;
      if (gameName) {
        gameCounts[gameName] = (gameCounts[gameName] || 0) + 1;
      }
    });

    return Object.keys(gameCounts)
      .sort((a, b) => gameCounts[b] - gameCounts[a])
      .slice(0, 3);
  }

  optimizeSkillProgression(matches) {
    if (matches.length < 5) return "gradual";

    const progression = this.analyzeSkillProgression(matches);

    if (progression === "improving") return "accelerated";
    if (progression === "declining") return "remedial";
    return "gradual";
  }

  generateSocialRecommendations(user) {
    return [
      "Rejoindre des clans actifs",
      "Participer à des événements communautaires",
      "Créer des défis avec des amis",
    ];
  }

  calculateOptimizationConfidence(dataPoints) {
    if (dataPoints < 10) return 0.5;
    if (dataPoints < 25) return 0.7;
    if (dataPoints < 50) return 0.85;
    return 0.95;
  }

  analyzeSkillProgression(matches) {
    if (matches.length < 5) return "stable";

    const firstHalf = matches.slice(0, Math.floor(matches.length / 2));
    const secondHalf = matches.slice(Math.floor(matches.length / 2));

    const firstAvg = this.calculateAverageScore(firstHalf);
    const secondAvg = this.calculateAverageScore(secondHalf);

    if (secondAvg > firstAvg + 10) return "improving";
    if (secondAvg < firstAvg - 10) return "declining";
    return "stable";
  }

  calculateAverageScore(matches) {
    if (matches.length === 0) return 50;

    const scores = matches
      .flatMap((m) => [m.playerAScore || 50, m.playerBScore || 50])
      .filter((score) => score > 0);

    if (scores.length === 0) return 50;

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  mapSkillToScore(skillLevel) {
    const skillMap = {
      expert: 90,
      advanced: 80,
      intermediate: 70,
      beginner: 60,
      novice: 50,
    };

    return skillMap[skillLevel] || 70;
  }
}

// ===== ANALYSEUR DE DONNÉES =====
class DataAnalyzer {
  async generateUserInsights(userId) {
    // Générer des insights détaillés sur l'utilisateur
    const matches = await Match.find({
      $or: [{ "playerA.user": userId }, { "playerB.user": userId }],
    });

    const performanceMetrics = this.calculatePerformanceMetrics(
      matches,
      userId
    );
    const skillAnalysis = this.analyzeSkillBreakdown(matches, userId);
    const socialNetwork = await this.analyzeSocialNetwork(userId);

    return {
      performanceMetrics,
      skillAnalysis,
      socialNetwork,
      improvementAreas: this.identifyImprovementAreas(skillAnalysis),
      achievements: this.calculateAchievements(matches, userId),
    };
  }

  calculatePerformanceMetrics(matches, userId) {
    const totalMatches = matches.length;
    const wins = matches.filter(
      (m) => m.winner && m.winner.toString() === userId.toString()
    ).length;

    return {
      totalMatches,
      winRate: totalMatches > 0 ? wins / totalMatches : 0,
      averageScore: this.calculateAverageScore(matches, userId),
      bestScore: this.findBestScore(matches, userId),
      consistency: this.calculateConsistency(matches, userId),
    };
  }

  analyzeSkillBreakdown(matches, userId) {
    const skills = {
      reflexes: this.assessReflexes(matches, userId),
      strategy: this.assessStrategy(matches, userId),
      precision: this.assessPrecision(matches, userId),
      patience: this.assessPatience(matches, userId),
    };

    const overallLevel = this.calculateOverallSkillLevel(skills);
    const strengths = this.identifyStrengths(skills);
    const weaknesses = this.identifyWeaknesses(skills);

    return {
      level: overallLevel,
      skills,
      strengths,
      weaknesses,
    };
  }

  async analyzeSocialNetwork(userId) {
    // Analyser le réseau social de l'utilisateur
    const matches = await Match.find({
      $or: [{ "playerA.user": userId }, { "playerB.user": userId }],
    });

    const opponents = new Set();
    matches.forEach((match) => {
      if (match.playerA.user.toString() === userId.toString()) {
        opponents.add(match.playerB.user.toString());
      } else {
        opponents.add(match.playerA.user.toString());
      }
    });

    return {
      friends: opponents.size,
      clans: Math.floor(opponents.size / 4),
      influence: this.calculateInfluence(opponents.size),
    };
  }

  identifyImprovementAreas(skillAnalysis) {
    const areas = [];

    if (skillAnalysis.skills.precision < 0.6) {
      areas.push("Travailler la précision des tirs");
    }

    if (skillAnalysis.skills.patience < 0.6) {
      areas.push("Développer la patience et la stratégie");
    }

    if (skillAnalysis.skills.reflexes < 0.6) {
      areas.push("Améliorer les réflexes");
    }

    if (areas.length === 0) {
      areas.push("Maintenir le niveau actuel");
    }

    return areas;
  }

  calculateAchievements(matches, userId) {
    const achievements = [];

    if (matches.length >= 100) {
      achievements.push("100 matchs joués");
    }

    if (matches.length >= 50) {
      achievements.push("50 matchs joués");
    }

    const wins = matches.filter(
      (m) => m.winner && m.winner.toString() === userId.toString()
    ).length;

    if (wins >= 25) {
      achievements.push("25 victoires");
    }

    if (wins >= 10) {
      achievements.push("10 victoires");
    }

    return achievements;
  }

  // Méthodes utilitaires pour l'analyse
  calculateAverageScore(matches, userId) {
    const userMatches = matches.filter(
      (m) =>
        m.playerA.user.toString() === userId.toString() ||
        m.playerB.user.toString() === userId.toString()
    );

    if (userMatches.length === 0) return 0;

    const totalScore = userMatches.reduce((sum, match) => {
      if (match.playerA.user.toString() === userId.toString()) {
        return sum + (match.playerAScore || 50);
      } else {
        return sum + (match.playerBScore || 50);
      }
    }, 0);

    return Math.round(totalScore / userMatches.length);
  }

  findBestScore(matches, userId) {
    const userMatches = matches.filter(
      (m) =>
        m.playerA.user.toString() === userId.toString() ||
        m.playerB.user.toString() === userId.toString()
    );

    if (userMatches.length === 0) return 0;

    return Math.max(
      ...userMatches.map((match) => {
        if (match.playerA.user.toString() === userId.toString()) {
          return match.playerAScore || 0;
        } else {
          return match.playerBScore || 0;
        }
      })
    );
  }

  calculateConsistency(matches, userId) {
    if (matches.length < 2) return "unknown";

    const scores = matches.map((match) => {
      if (match.playerA.user.toString() === userId.toString()) {
        return match.playerAScore || 50;
      } else {
        return match.playerBScore || 50;
      }
    });

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    const standardDeviation = Math.sqrt(variance);

    if (standardDeviation < 10) return "very_consistent";
    if (standardDeviation < 20) return "consistent";
    if (standardDeviation < 30) return "moderate";
    return "inconsistent";
  }

  assessReflexes(matches, userId) {
    // Évaluer les réflexes basés sur la vitesse de réaction
    return 0.7; // Placeholder
  }

  assessStrategy(matches, userId) {
    // Évaluer la stratégie basée sur les patterns de jeu
    return 0.8; // Placeholder
  }

  assessPrecision(matches, userId) {
    // Évaluer la précision basée sur les scores
    return 0.6; // Placeholder
  }

  assessPatience(matches, userId) {
    // Évaluer la patience basée sur le style de jeu
    return 0.5; // Placeholder
  }

  calculateOverallSkillLevel(skills) {
    const average =
      Object.values(skills).reduce((sum, skill) => sum + skill, 0) /
      Object.keys(skills).length;

    if (average >= 0.8) return "expert";
    if (average >= 0.7) return "advanced";
    if (average >= 0.6) return "intermediate";
    if (average >= 0.5) return "beginner";
    return "novice";
  }

  identifyStrengths(skills) {
    return Object.entries(skills)
      .filter(([skill, value]) => value >= 0.7)
      .map(([skill]) => skill.charAt(0).toUpperCase() + skill.slice(1));
  }

  identifyWeaknesses(skills) {
    return Object.entries(skills)
      .filter(([skill, value]) => value < 0.6)
      .map(([skill]) => skill.charAt(0).toUpperCase() + skill.slice(1));
  }

  calculateInfluence(friendCount) {
    if (friendCount >= 20) return "high";
    if (friendCount >= 10) return "moderate";
    if (friendCount >= 5) return "low";
    return "minimal";
  }
}

// ===== DASHBOARD TEMPS RÉEL =====
class RealTimeDashboard {
  async getAnalytics() {
    // Récupérer les analytics en temps réel
    const activeUsers = await this.getActiveUsers();
    const currentGames = await this.getCurrentGames();
    const activeTournaments = await this.getActiveTournaments();
    const systemPerformance = await this.getSystemPerformance();

    return {
      activeUsers,
      currentGames,
      activeTournaments,
      systemPerformance,
      trends: await this.getTrends(),
    };
  }

  async getActiveUsers() {
    // Compter les utilisateurs actifs dans les dernières 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await User.countDocuments({
      lastActivity: { $gte: fiveMinutesAgo },
    });

    return activeUsers;
  }

  async getCurrentGames() {
    // Compter les matchs en cours
    const currentGames = await Match.countDocuments({
      status: "active",
      updatedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });

    return currentGames;
  }

  async getActiveTournaments() {
    // Compter les tournois actifs
    const activeTournaments = await Tournament.countDocuments({
      status: "active",
      startsAt: { $lte: new Date() },
      endsAt: { $gte: new Date() },
    });

    return activeTournaments;
  }

  async getSystemPerformance() {
    // Évaluer les performances du système
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    let performance = "excellent";

    if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.8) {
      performance = "poor";
    } else if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.6) {
      performance = "moderate";
    }

    return performance;
  }

  async getTrends() {
    // Analyser les tendances récentes
    const trends = [];

    const recentMatches = await Match.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const previousDayMatches = await Match.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        $lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    if (recentMatches > previousDayMatches * 1.2) {
      trends.push("Augmentation de l'activité de jeu");
    }

    const recentTournaments = await Tournament.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    if (recentTournaments > 5) {
      trends.push("Nouveaux tournois créés");
    }

    if (trends.length === 0) {
      trends.push("Activité stable");
    }

    return trends;
  }
}

module.exports = { AnalyticsTools };
