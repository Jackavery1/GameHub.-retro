/**
 * 🤖 Matchmaking Intelligent
 * Apparie les joueurs selon leurs compétences et préférences
 */

class IntelligentMatchmaking {
  constructor() {
    this.queue = new Map();
    this.eloK = 32; // Facteur K pour l'algorithme ELO
    this.maxWaitTime = 30000; // 30 secondes max
  }

  async findOpponent(userId, gameId, preferences = {}) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const compatiblePlayers = await this.findCompatiblePlayers(
        userProfile,
        gameId
      );

      if (compatiblePlayers.length === 0) {
        // Ajouter à la file d'attente
        return this.addToQueue(userId, userProfile, gameId, preferences);
      }

      // Trouver le meilleur match
      const bestMatch = this.findBestMatch(userProfile, compatiblePlayers);
      return {
        opponent: bestMatch,
        estimatedWaitTime: 0,
        matchQuality: bestMatch.quality,
      };
    } catch (error) {
      console.error("Erreur matchmaking:", error);
      return this.getFallbackMatch(userId);
    }
  }

  async findCompatiblePlayers(userProfile, gameId) {
    const compatiblePlayers = [];
    const skillRange = this.calculateSkillRange(userProfile.elo);

    // Simuler la recherche de joueurs compatibles
    const mockPlayers = [
      { id: "player1", elo: userProfile.elo + 50, gameId, quality: 0.9 },
      { id: "player2", elo: userProfile.elo - 30, gameId, quality: 0.85 },
      { id: "player3", elo: userProfile.elo + 100, gameId, quality: 0.7 },
    ];

    return mockPlayers.filter(
      (player) => player.elo >= skillRange.min && player.elo <= skillRange.max
    );
  }

  calculateSkillRange(elo) {
    const range = 200; // ±200 points ELO
    return {
      min: Math.max(elo - range, 100),
      max: elo + range,
    };
  }

  findBestMatch(userProfile, compatiblePlayers) {
    return compatiblePlayers.reduce((best, current) => {
      return current.quality > best.quality ? current : best;
    });
  }

  addToQueue(userId, userProfile, gameId, preferences) {
    const queueEntry = {
      userId,
      userProfile,
      gameId,
      preferences,
      timestamp: Date.now(),
    };

    this.queue.set(userId, queueEntry);

    return {
      opponent: null,
      estimatedWaitTime: this.estimateWaitTime(),
      matchQuality: 0.5,
    };
  }

  estimateWaitTime() {
    const queueSize = this.queue.size;
    return Math.min(queueSize * 5000, this.maxWaitTime); // 5s par joueur en file
  }

  getFallbackMatch(userId) {
    return {
      opponent: { id: "ai-opponent", elo: 1200, quality: 0.6 },
      estimatedWaitTime: 0,
      matchQuality: 0.6,
    };
  }

  async getUserProfile(userId) {
    // Simulation du profil utilisateur
    return {
      elo: Math.floor(Math.random() * 500) + 1000,
      gameId: "test-game",
    };
  }
}

module.exports = IntelligentMatchmaking;
