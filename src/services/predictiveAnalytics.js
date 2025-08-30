/**
 * 📊 Analytics Prédictifs
 * Prédit les performances et analyse les tendances
 */

class PredictiveAnalytics {
  constructor() {
    this.predictionModels = {
      performance: this.performanceModel,
      improvement: this.improvementModel,
      engagement: this.engagementModel,
    };
  }

  async predictPerformance(userId, gameId) {
    try {
      const userData = await this.getUserData(userId);
      const gameData = await this.getGameData(gameId);
      const historicalPerformance = await this.getHistoricalPerformance(
        userId,
        gameId
      );

      const prediction = {
        expectedScore: this.calculateExpectedScore(
          userData,
          gameData,
          historicalPerformance
        ),
        winProbability: this.calculateWinProbability(userData, gameData),
        improvementRate: this.calculateImprovementRate(historicalPerformance),
        confidence: this.calculatePredictionConfidence(historicalPerformance),
      };

      return prediction;
    } catch (error) {
      console.error("Erreur prédiction performance:", error);
      return this.getFallbackPrediction();
    }
  }

  calculateExpectedScore(userData, gameData, historicalPerformance) {
    const baseScore = userData.averageScore || 50;
    const gameDifficulty = gameData.difficulty || 1;
    const recentTrend = this.calculateRecentTrend(historicalPerformance);

    return Math.min(100, Math.max(0, baseScore * gameDifficulty + recentTrend));
  }

  calculateWinProbability(userData, gameData) {
    const userSkill = userData.skillLevel || 0.5;
    const gameComplexity = gameData.complexity || 0.5;

    // Modèle simple basé sur la compétence et la complexité
    return Math.min(
      0.95,
      Math.max(0.05, userSkill * (1 - gameComplexity * 0.3))
    );
  }

  calculateImprovementRate(historicalPerformance) {
    if (historicalPerformance.length < 2) return 0.1;

    const recentScores = historicalPerformance.slice(-5);
    const improvement =
      recentScores.reduce((acc, score, index) => {
        if (index === 0) return 0;
        return acc + (score - recentScores[index - 1]);
      }, 0) /
      (recentScores.length - 1);

    return Math.max(0, improvement);
  }

  calculatePredictionConfidence(historicalPerformance) {
    const dataPoints = historicalPerformance.length;
    const consistency = this.calculateConsistency(historicalPerformance);

    if (dataPoints > 20 && consistency > 0.8) return 0.9;
    if (dataPoints > 10 && consistency > 0.6) return 0.7;
    if (dataPoints > 5) return 0.5;
    return 0.3;
  }

  calculateConsistency(scores) {
    if (scores.length < 2) return 0;

    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const variance =
      scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) /
      scores.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 1 - stdDev / 50); // Normalisé sur 100
  }

  getFallbackPrediction() {
    return {
      expectedScore: 50,
      winProbability: 0.5,
      improvementRate: 0.1,
      confidence: 0.3,
    };
  }

  async getUserData(userId) {
    return {
      averageScore: Math.floor(Math.random() * 50) + 30,
      skillLevel: Math.random(),
    };
  }

  async getGameData(gameId) {
    return {
      difficulty: Math.random(),
      complexity: Math.random(),
    };
  }

  async getHistoricalPerformance(userId, gameId) {
    return [65, 70, 75, 68, 72, 80, 78, 85, 82, 88];
  }

  calculateRecentTrend(historicalPerformance) {
    if (historicalPerformance.length < 2) return 0;
    const recent = historicalPerformance.slice(-3);
    return (recent[recent.length - 1] - recent[0]) / recent.length;
  }
}

module.exports = PredictiveAnalytics;
