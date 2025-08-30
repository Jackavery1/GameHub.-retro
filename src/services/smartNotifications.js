/**
 * 🔔 Notifications Intelligentes
 * Génère des alertes contextuelles basées sur le comportement utilisateur
 */

class SmartNotifications {
  constructor() {
    this.notificationTypes = {
      gameRecommendation: "game_recommendation",
      tournamentReminder: "tournament_reminder",
      performanceAlert: "performance_alert",
      socialSuggestion: "social_suggestion",
    };
  }

  async generateSmartNotifications(userId) {
    try {
      const userBehavior = await this.analyzeUserBehavior(userId);
      const notifications = [];

      // Recommandations de jeux
      if (this.shouldRecommendGame(userBehavior)) {
        notifications.push(
          await this.createGameRecommendation(userId, userBehavior)
        );
      }

      // Rappels de tournois
      if (this.shouldRemindTournament(userBehavior)) {
        notifications.push(await this.createTournamentReminder(userId));
      }

      // Alertes de performance
      if (this.shouldAlertPerformance(userBehavior)) {
        notifications.push(
          await this.createPerformanceAlert(userId, userBehavior)
        );
      }

      // Suggestions sociales
      if (this.shouldSuggestSocial(userBehavior)) {
        notifications.push(
          await this.createSocialSuggestion(userId, userBehavior)
        );
      }

      return notifications;
    } catch (error) {
      console.error("Erreur génération notifications:", error);
      return [];
    }
  }

  async analyzeUserBehavior(userId) {
    const behavior = {
      lastLogin: new Date(),
      gameSessions: await this.getRecentGameSessions(userId),
      performance: await this.getRecentPerformance(userId),
      socialActivity: await this.getSocialActivity(userId),
      preferences: await this.getUserPreferences(userId),
    };

    return behavior;
  }

  shouldRecommendGame(behavior) {
    const daysSinceLastGame = this.getDaysSinceLastGame(behavior.gameSessions);
    const hasLowEngagement = behavior.gameSessions.length < 3;

    return daysSinceLastGame > 2 || hasLowEngagement;
  }

  shouldRemindTournament(behavior) {
    const upcomingTournaments = behavior.tournaments || [];
    const hasActiveTournaments = upcomingTournaments.some(
      (t) => new Date(t.startDate) - new Date() < 24 * 60 * 60 * 1000 // 24h
    );

    return hasActiveTournaments;
  }

  shouldAlertPerformance(behavior) {
    const recentPerformance = behavior.performance.slice(-5);
    const averagePerformance =
      recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length;

    return averagePerformance < 40; // Performance faible
  }

  shouldSuggestSocial(behavior) {
    const socialActivity = behavior.socialActivity;
    const hasLowSocialActivity =
      socialActivity.friends < 5 || socialActivity.tournaments < 2;

    return hasLowSocialActivity;
  }

  async createGameRecommendation(userId, behavior) {
    return {
      type: this.notificationTypes.gameRecommendation,
      title: "🎮 Nouveau jeu pour vous !",
      message:
        "Basé sur vos préférences, nous pensons que vous aimeriez essayer ce jeu.",
      priority: "medium",
      action: "view_game",
      data: { gameId: "recommended_game_id" },
    };
  }

  async createTournamentReminder(userId) {
    return {
      type: this.notificationTypes.tournamentReminder,
      title: "🏆 Tournoi à venir !",
      message: "Un tournoi commence bientôt. Préparez-vous !",
      priority: "high",
      action: "view_tournament",
      data: { tournamentId: "upcoming_tournament_id" },
    };
  }

  async createPerformanceAlert(userId, behavior) {
    return {
      type: this.notificationTypes.performanceAlert,
      title: "📈 Améliorez votre jeu",
      message:
        "Vos performances récentes sont en baisse. Voici quelques conseils.",
      priority: "medium",
      action: "view_tips",
      data: { tips: ["practice_mode", "tutorial"] },
    };
  }

  async createSocialSuggestion(userId, behavior) {
    return {
      type: this.notificationTypes.socialSuggestion,
      title: "👥 Rejoignez la communauté",
      message: "Découvrez d'autres joueurs et participez à des tournois !",
      priority: "low",
      action: "view_community",
      data: { community: "active_players" },
    };
  }

  getDaysSinceLastGame(gameSessions) {
    if (gameSessions.length === 0) return 999;

    const lastGame = new Date(gameSessions[gameSessions.length - 1].date);
    const now = new Date();
    return Math.floor((now - lastGame) / (1000 * 60 * 60 * 24));
  }

  async getRecentGameSessions(userId) {
    return [
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ];
  }

  async getRecentPerformance(userId) {
    return [45, 50, 55, 60, 65];
  }

  async getSocialActivity(userId) {
    return {
      friends: 3,
      tournaments: 1,
    };
  }

  async getUserPreferences(userId) {
    return {
      notifications: true,
      gameRecommendations: true,
    };
  }
}

module.exports = SmartNotifications;
