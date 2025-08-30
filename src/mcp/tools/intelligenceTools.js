const mongoose = require("mongoose");
const User = require("../../models/User");
const Game = require("../../models/Game");
const Tournament = require("../../models/Tournament");
const Match = require("../../models/Match");

const intelligenceTools = [
  // === SYSTÈME DE RECOMMANDATIONS ===

  {
    name: "get_game_recommendations",
    description:
      "Génère des recommandations de jeux personnalisées pour un utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "ID de l'utilisateur",
        },
        limit: {
          type: "number",
          default: 10,
          description: "Nombre maximum de recommandations",
        },
        includeSimilarUsers: {
          type: "boolean",
          default: true,
          description:
            "Inclure les recommandations basées sur des utilisateurs similaires",
        },
        includeGenrePreferences: {
          type: "boolean",
          default: true,
          description:
            "Inclure les recommandations basées sur les préférences de genre",
        },
      },
      required: ["userId"],
    },
    handler: async ({
      userId,
      limit = 10,
      includeSimilarUsers = true,
      includeGenrePreferences = true,
    }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        const recommendations = {
          userId,
          timestamp: new Date(),
          recommendations: [],
          algorithm: "hybrid",
          factors: {},
        };

        // 1. Recommandations basées sur l'historique des jeux favoris
        if (user.favorites && user.favorites.length > 0) {
          const favoriteGames = await Game.find({
            _id: { $in: user.favorites },
          });
          const favoriteGenres = favoriteGames.reduce((acc, game) => {
            if (game.genres) {
              game.genres.forEach((genre) => {
                acc[genre] = (acc[genre] || 0) + 1;
              });
            }
            return acc;
          }, {});

          // Trouver des jeux similaires par genre
          const similarGames = await Game.find({
            _id: { $nin: user.favorites },
            genres: { $in: Object.keys(favoriteGenres) },
          }).limit(limit);

          recommendations.recommendations.push(
            ...similarGames.map((game) => ({
              gameId: game._id,
              name: game.name,
              score: calculateSimilarityScore(game, favoriteGenres),
              reason: "Basé sur vos jeux favoris",
              type: "genre_similarity",
            }))
          );
        }

        // 2. Recommandations basées sur les utilisateurs similaires
        if (includeSimilarUsers) {
          const similarUsers = await findSimilarUsers(user, 5);
          const similarUserGames = await getGamesFromSimilarUsers(
            similarUsers,
            user.favorites || []
          );

          recommendations.recommendations.push(
            ...similarUserGames.map((game) => ({
              gameId: game._id,
              name: game.name,
              score: game.similarityScore,
              reason: `Aimé par des utilisateurs similaires (${game.similarUsersCount} utilisateurs)`,
              type: "collaborative_filtering",
            }))
          );
        }

        // 3. Recommandations basées sur la popularité et la nouveauté
        const popularGames = await Game.find({
          _id: { $nin: user.favorites || [] },
        })
          .sort({ rating: -1, releaseDate: -1 })
          .limit(Math.floor(limit / 2));

        recommendations.recommendations.push(
          ...popularGames.map((game) => ({
            gameId: game._id,
            name: game.name,
            score: game.rating || 0,
            reason: "Jeu populaire et bien noté",
            type: "popularity",
          }))
        );

        // Trier et limiter les recommandations
        recommendations.recommendations.sort((a, b) => b.score - a.score);
        recommendations.recommendations = recommendations.recommendations.slice(
          0,
          limit
        );

        // Ajouter des métadonnées
        recommendations.factors = {
          totalGames: recommendations.recommendations.length,
          types: recommendations.recommendations.reduce((acc, rec) => {
            acc[rec.type] = (acc[rec.type] || 0) + 1;
            return acc;
          }, {}),
          averageScore:
            recommendations.recommendations.reduce(
              (sum, rec) => sum + rec.score,
              0
            ) / recommendations.recommendations.length,
        };

        return recommendations;
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  // === MATCHMAKING AUTOMATIQUE ===

  {
    name: "find_matchmaking_opponents",
    description:
      "Trouve des adversaires appropriés pour un utilisateur basé sur ses compétences et préférences",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "ID de l'utilisateur",
        },
        gameId: {
          type: "string",
          description: "ID du jeu pour le matchmaking",
        },
        maxOpponents: {
          type: "number",
          default: 5,
          description: "Nombre maximum d'adversaires à suggérer",
        },
        skillRange: {
          type: "number",
          default: 200,
          description: "Plage de compétence acceptable (±points)",
        },
        includeOnlineOnly: {
          type: "boolean",
          default: true,
          description: "Inclure uniquement les utilisateurs en ligne",
        },
      },
      required: ["userId", "gameId"],
    },
    handler: async ({
      userId,
      gameId,
      maxOpponents = 5,
      skillRange = 200,
      includeOnlineOnly = true,
    }) => {
      try {
        const user = await User.findById(userId);
        const game = await Game.findById(gameId);

        if (!user || !game) {
          return { error: "Utilisateur ou jeu non trouvé" };
        }

        const matchmaking = {
          userId,
          gameId,
          timestamp: new Date(),
          userSkill: user.skillRating || 1000,
          gameName: game.name,
          opponents: [],
          algorithm: "skill_based_matchmaking",
        };

        // Construire la requête pour trouver des adversaires
        const query = {
          _id: { $ne: userId },
          isActive: true,
          skillRating: {
            $gte: (user.skillRating || 1000) - skillRange,
            $lte: (user.skillRating || 1000) + skillRange,
          },
        };

        if (includeOnlineOnly) {
          query.lastSeen = { $gte: new Date(Date.now() - 5 * 60 * 1000) }; // En ligne il y a moins de 5 minutes
        }

        // Trouver des utilisateurs avec des compétences similaires
        const potentialOpponents = await User.find(query)
          .sort({ skillRating: 1 })
          .limit(maxOpponents * 2); // Prendre plus pour filtrer

        // Calculer le score de compatibilité pour chaque adversaire
        for (const opponent of potentialOpponents) {
          const compatibilityScore = calculateCompatibilityScore(
            user,
            opponent,
            game
          );

          if (compatibilityScore > 0.3) {
            // Seuil de compatibilité minimum
            matchmaking.opponents.push({
              userId: opponent._id,
              username: opponent.username,
              skillRating: opponent.skillRating || 1000,
              compatibilityScore,
              lastSeen: opponent.lastSeen,
              preferredGenres: opponent.preferredGenres || [],
              matchHistory: await getMatchHistory(opponent._id, gameId),
            });
          }
        }

        // Trier par score de compatibilité et limiter
        matchmaking.opponents.sort(
          (a, b) => b.compatibilityScore - a.compatibilityScore
        );
        matchmaking.opponents = matchmaking.opponents.slice(0, maxOpponents);

        // Ajouter des statistiques
        matchmaking.stats = {
          totalOpponents: matchmaking.opponents.length,
          averageCompatibility:
            matchmaking.opponents.reduce(
              (sum, opp) => sum + opp.compatibilityScore,
              0
            ) / matchmaking.opponents.length,
          skillRange: `${matchmaking.userSkill - skillRange} - ${
            matchmaking.userSkill + skillRange
          }`,
        };

        return matchmaking;
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  // === NOTIFICATIONS INTELLIGENTES ===

  {
    name: "generate_smart_notifications",
    description:
      "Génère des notifications intelligentes et personnalisées pour un utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "ID de l'utilisateur",
        },
        notificationTypes: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "tournament",
              "friend_activity",
              "game_recommendation",
              "achievement",
              "reminder",
            ],
          },
          default: ["tournament", "friend_activity", "game_recommendation"],
          description: "Types de notifications à générer",
        },
        maxNotifications: {
          type: "number",
          default: 10,
          description: "Nombre maximum de notifications",
        },
        includePriority: {
          type: "boolean",
          default: true,
          description: "Inclure la priorité des notifications",
        },
      },
      required: ["userId"],
    },
    handler: async ({
      userId,
      notificationTypes = [
        "tournament",
        "friend_activity",
        "game_recommendation",
      ],
      maxNotifications = 10,
      includePriority = true,
    }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        const notifications = {
          userId,
          timestamp: new Date(),
          notifications: [],
          summary: {
            total: 0,
            byType: {},
            byPriority: {},
          },
        };

        // 1. Notifications de tournois
        if (notificationTypes.includes("tournament")) {
          const upcomingTournaments = await Tournament.find({
            startDate: { $gte: new Date() },
            status: "registration_open",
            maxParticipants: { $gt: 0 },
          })
            .sort({ startDate: 1 })
            .limit(5);

          for (const tournament of upcomingTournaments) {
            const isRegistered = await checkTournamentRegistration(
              userId,
              tournament._id
            );
            const priority = calculateTournamentPriority(tournament, user);

            if (!isRegistered && priority > 0.5) {
              notifications.notifications.push({
                id: `tournament_${tournament._id}`,
                type: "tournament",
                title: `Nouveau tournoi: ${tournament.name}`,
                message: `Inscrivez-vous maintenant pour le tournoi ${
                  tournament.name
                } qui commence le ${tournament.startDate.toLocaleDateString()}`,
                priority,
                data: {
                  tournamentId: tournament._id,
                  startDate: tournament.startDate,
                  gameName: tournament.gameName,
                  entryFee: tournament.entryFee,
                  prizePool: tournament.prizePool,
                },
                actionUrl: `/tournaments/${tournament._id}`,
                expiresAt: tournament.startDate,
              });
            }
          }
        }

        // 2. Notifications d'activité des amis
        if (notificationTypes.includes("friend_activity")) {
          const friends = user.friends || [];
          if (friends.length > 0) {
            const recentFriendActivity = await getRecentFriendActivity(
              friends,
              24
            ); // 24h

            for (const activity of recentFriendActivity) {
              const priority = calculateFriendActivityPriority(activity, user);

              notifications.notifications.push({
                id: `friend_${activity.friendId}_${activity.type}`,
                type: "friend_activity",
                title: `Activité de ${activity.friendName}`,
                message: activity.message,
                priority,
                data: {
                  friendId: activity.friendId,
                  friendName: activity.friendName,
                  activityType: activity.type,
                  timestamp: activity.timestamp,
                  gameId: activity.gameId,
                },
                actionUrl: activity.actionUrl,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
              });
            }
          }
        }

        // 3. Notifications de recommandations de jeux
        if (notificationTypes.includes("game_recommendation")) {
          const gameRecommendations = await getGameRecommendations(userId, 3);

          for (const rec of gameRecommendations.recommendations.slice(0, 3)) {
            const priority = calculateGameRecommendationPriority(rec, user);

            notifications.notifications.push({
              id: `game_rec_${rec.gameId}`,
              type: "game_recommendation",
              title: `Nouveau jeu recommandé: ${rec.name}`,
              message: `Basé sur vos préférences, nous pensons que vous aimeriez ${rec.name}`,
              priority,
              data: {
                gameId: rec.gameId,
                gameName: rec.name,
                reason: rec.reason,
                score: rec.score,
              },
              actionUrl: `/games/${rec.gameId}`,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
            });
          }
        }

        // 4. Notifications d'achievements
        if (notificationTypes.includes("achievement")) {
          const recentAchievements = await getRecentAchievements(userId, 7); // 7 jours

          for (const achievement of recentAchievements) {
            notifications.notifications.push({
              id: `achievement_${achievement.id}`,
              type: "achievement",
              title: `Nouvel achievement: ${achievement.name}`,
              message: achievement.description,
              priority: 0.9, // Les achievements ont une priorité élevée
              data: {
                achievementId: achievement.id,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                unlockedAt: achievement.unlockedAt,
              },
              actionUrl: `/profile/achievements`,
              expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
            });
          }
        }

        // 5. Notifications de rappels
        if (notificationTypes.includes("reminder")) {
          const reminders = await generateSmartReminders(userId);

          for (const reminder of reminders) {
            notifications.notifications.push({
              id: `reminder_${reminder.id}`,
              type: "reminder",
              title: reminder.title,
              message: reminder.message,
              priority: reminder.priority,
              data: {
                reminderType: reminder.type,
                dueDate: reminder.dueDate,
                gameId: reminder.gameId,
              },
              actionUrl: reminder.actionUrl,
              expiresAt: reminder.dueDate,
            });
          }
        }

        // Trier par priorité et limiter
        if (includePriority) {
          notifications.notifications.sort((a, b) => b.priority - a.priority);
        }
        notifications.notifications = notifications.notifications.slice(
          0,
          maxNotifications
        );

        // Générer le résumé
        notifications.summary.total = notifications.notifications.length;
        notifications.notifications.forEach((notif) => {
          notifications.summary.byType[notif.type] =
            (notifications.summary.byType[notif.type] || 0) + 1;
          const priorityLevel =
            notif.priority >= 0.8
              ? "high"
              : notif.priority >= 0.5
              ? "medium"
              : "low";
          notifications.summary.byPriority[priorityLevel] =
            (notifications.summary.byPriority[priorityLevel] || 0) + 1;
        });

        return notifications;
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  // === ANALYSE DES PRÉFÉRENCES UTILISATEUR ===

  {
    name: "analyze_user_preferences",
    description:
      "Analyse les préférences et comportements d'un utilisateur pour améliorer les recommandations",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "ID de l'utilisateur",
        },
        includeBehavioralAnalysis: {
          type: "boolean",
          default: true,
          description: "Inclure l'analyse comportementale",
        },
        includeSocialAnalysis: {
          type: "boolean",
          default: true,
          description: "Inclure l'analyse sociale",
        },
        timeRange: {
          type: "number",
          default: 90,
          description: "Plage de temps en jours pour l'analyse",
        },
      },
      required: ["userId"],
    },
    handler: async ({
      userId,
      includeBehavioralAnalysis = true,
      includeSocialAnalysis = true,
      timeRange = 90,
    }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeRange);

        const analysis = {
          userId,
          timestamp: new Date(),
          timeRange: `${timeRange} jours`,
          preferences: {},
          behavior: {},
          social: {},
          recommendations: [],
        };

        // 1. Analyse des préférences de jeux
        if (user.favorites && user.favorites.length > 0) {
          const favoriteGames = await Game.find({
            _id: { $in: user.favorites },
          });

          analysis.preferences.genres = favoriteGames.reduce((acc, game) => {
            if (game.genres) {
              game.genres.forEach((genre) => {
                acc[genre] = (acc[genre] || 0) + 1;
              });
            }
            return acc;
          }, {});

          analysis.preferences.platforms = favoriteGames.reduce((acc, game) => {
            if (game.platforms) {
              game.platforms.forEach((platform) => {
                acc[platform] = (acc[platform] || 0) + 1;
              });
            }
            return acc;
          }, {});

          analysis.preferences.avgRating =
            favoriteGames.reduce((sum, game) => sum + (game.rating || 0), 0) /
            favoriteGames.length;
          analysis.preferences.avgReleaseYear =
            favoriteGames.reduce(
              (sum, game) => sum + (game.releaseYear || 2000),
              0
            ) / favoriteGames.length;
        }

        // 2. Analyse comportementale
        if (includeBehavioralAnalysis) {
          const userMatches = await Match.find({
            $or: [{ player1: userId }, { player2: userId }],
            createdAt: { $gte: cutoffDate },
          });

          analysis.behavior.totalMatches = userMatches.length;
          analysis.behavior.winRate =
            userMatches.length > 0
              ? userMatches.filter((match) => match.winner === userId).length /
                userMatches.length
              : 0;

          analysis.behavior.avgMatchDuration =
            userMatches.length > 0
              ? userMatches.reduce(
                  (sum, match) => sum + (match.duration || 0),
                  0
                ) / userMatches.length
              : 0;

          analysis.behavior.preferredGameTimes =
            await analyzePreferredGameTimes(userId, cutoffDate);
          analysis.behavior.sessionPatterns = await analyzeSessionPatterns(
            userId,
            cutoffDate
          );
        }

        // 3. Analyse sociale
        if (includeSocialAnalysis) {
          analysis.social.friendsCount = user.friends ? user.friends.length : 0;
          analysis.social.tournamentsParticipated =
            await Tournament.countDocuments({
              participants: userId,
              startDate: { $gte: cutoffDate },
            });

          analysis.social.communityEngagement =
            await calculateCommunityEngagement(userId, cutoffDate);
          analysis.social.influenceScore = await calculateInfluenceScore(
            userId
          );
        }

        // 4. Générer des recommandations basées sur l'analyse
        analysis.recommendations = await generatePersonalizedRecommendations(
          analysis
        );

        // 5. Calculer le score de confiance de l'analyse
        analysis.confidenceScore = calculateAnalysisConfidence(analysis);

        return analysis;
      } catch (error) {
        return { error: error.message };
      }
    },
  },
];

// === FONCTIONS UTILITAIRES ===

// Calculer le score de similarité entre un jeu et les préférences
function calculateSimilarityScore(game, favoriteGenres) {
  let score = 0;
  if (game.genres) {
    game.genres.forEach((genre) => {
      score += (favoriteGenres[genre] || 0) * 0.1;
    });
  }
  return Math.min(score, 1.0);
}

// Trouver des utilisateurs similaires
async function findSimilarUsers(user, limit) {
  const userGenres = await getUserPreferredGenres(user._id);

  return await User.find({
    _id: { $ne: user._id },
    isActive: true,
  })
    .limit(limit * 2)
    .then((users) => {
      return users
        .map((u) => ({
          user: u,
          similarity: calculateUserSimilarity(userGenres, u),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    });
}

// Obtenir les jeux des utilisateurs similaires
async function getGamesFromSimilarUsers(similarUsers, userFavorites) {
  const gameIds = [];
  const gameScores = {};

  for (const { user, similarity } of similarUsers) {
    if (user.favorites) {
      user.favorites.forEach((gameId) => {
        if (!userFavorites.includes(gameId)) {
          gameIds.push(gameId);
          gameScores[gameId] = (gameScores[gameId] || 0) + similarity;
        }
      });
    }
  }

  const games = await Game.find({ _id: { $in: gameIds } });
  return games.map((game) => ({
    ...game.toObject(),
    similarityScore: gameScores[game._id] || 0,
    similarUsersCount: Object.keys(gameScores).filter(
      (id) => id === game._id.toString()
    ).length,
  }));
}

// Calculer le score de compatibilité entre deux utilisateurs
function calculateCompatibilityScore(user1, user2, game) {
  let score = 0;

  // Compatibilité des compétences
  const skillDiff = Math.abs(
    (user1.skillRating || 1000) - (user2.skillRating || 1000)
  );
  score += Math.max(0, 1 - skillDiff / 1000) * 0.4;

  // Compatibilité des genres
  if (user1.preferredGenres && user2.preferredGenres) {
    const commonGenres = user1.preferredGenres.filter((g) =>
      user2.preferredGenres.includes(g)
    );
    score +=
      (commonGenres.length /
        Math.max(user1.preferredGenres.length, user2.preferredGenres.length)) *
      0.3;
  }

  // Compatibilité temporelle (basée sur lastSeen)
  if (user1.lastSeen && user2.lastSeen) {
    const timeDiff = Math.abs(user1.lastSeen - user2.lastSeen);
    score += Math.max(0, 1 - timeDiff / (24 * 60 * 60 * 1000)) * 0.3;
  }

  return score;
}

// Obtenir l'historique des matchs
async function getMatchHistory(userId, gameId) {
  const matches = await Match.find({
    $or: [{ player1: userId }, { player2: userId }],
    game: gameId,
  })
    .sort({ createdAt: -1 })
    .limit(10);

  return matches.map((match) => ({
    opponent: match.player1 === userId ? match.player2 : match.player1,
    result: match.winner === userId ? "win" : match.winner ? "loss" : "draw",
    date: match.createdAt,
  }));
}

// Calculer la priorité d'un tournoi
function calculateTournamentPriority(tournament, user) {
  let priority = 0.5;

  // Priorité basée sur la date de début
  const daysUntilStart = Math.ceil(
    (tournament.startDate - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilStart <= 1) priority += 0.3;
  else if (daysUntilStart <= 7) priority += 0.2;

  // Priorité basée sur le prix
  if (tournament.prizePool > 0) priority += 0.1;

  // Priorité basée sur les préférences de l'utilisateur
  if (user.preferredGenres && tournament.gameGenres) {
    const commonGenres = user.preferredGenres.filter((g) =>
      tournament.gameGenres.includes(g)
    );
    priority += (commonGenres.length / user.preferredGenres.length) * 0.1;
  }

  return Math.min(priority, 1.0);
}

// Vérifier l'inscription à un tournoi
async function checkTournamentRegistration(userId, tournamentId) {
  const tournament = await Tournament.findById(tournamentId);
  return tournament && tournament.participants.includes(userId);
}

// Obtenir l'activité récente des amis
async function getRecentFriendActivity(friendIds, hours) {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Simuler l'activité des amis (dans un vrai système, cela viendrait de logs d'activité)
  const activities = [];

  for (const friendId of friendIds.slice(0, 5)) {
    const friend = await User.findById(friendId);
    if (friend) {
      activities.push({
        friendId: friend._id,
        friendName: friend.username,
        type: "game_played",
        message: `${friend.username} a joué à un jeu`,
        timestamp: new Date(
          Date.now() - Math.random() * hours * 60 * 60 * 1000
        ),
        gameId: null,
        actionUrl: `/users/${friend.username}`,
      });
    }
  }

  return activities.sort((a, b) => b.timestamp - a.timestamp);
}

// Calculer la priorité de l'activité d'un ami
function calculateFriendActivityPriority(activity, user) {
  let priority = 0.5;

  // Priorité basée sur la récence
  const hoursAgo = (Date.now() - activity.timestamp) / (1000 * 60 * 60);
  if (hoursAgo <= 1) priority += 0.3;
  else if (hoursAgo <= 6) priority += 0.2;

  // Priorité basée sur la relation (amis proches)
  if (user.closeFriends && user.closeFriends.includes(activity.friendId)) {
    priority += 0.2;
  }

  return Math.min(priority, 1.0);
}

// Obtenir les recommandations de jeux
async function getGameRecommendations(userId, limit) {
  // Cette fonction serait normalement plus complexe
  // Pour l'instant, retournons des jeux populaires
  const games = await Game.find().sort({ rating: -1 }).limit(limit);

  return {
    recommendations: games.map((game) => ({
      gameId: game._id,
      name: game.name,
      reason: "Jeu populaire",
      score: game.rating || 0,
    })),
  };
}

// Calculer la priorité d'une recommandation de jeu
function calculateGameRecommendationPriority(recommendation, user) {
  let priority = 0.6;

  // Priorité basée sur le score de recommandation
  priority += recommendation.score * 0.2;

  // Priorité basée sur la nouveauté
  if (recommendation.reason.includes("nouveau")) {
    priority += 0.1;
  }

  return Math.min(priority, 1.0);
}

// Obtenir les achievements récents
async function getRecentAchievements(userId, days) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Simuler les achievements (dans un vrai système, cela viendrait d'une collection d'achievements)
  return [
    {
      id: "first_win",
      name: "Première Victoire",
      description: "Vous avez gagné votre premier match !",
      icon: "🏆",
      unlockedAt: new Date(
        Date.now() - Math.random() * days * 24 * 60 * 60 * 1000
      ),
    },
  ].filter((achievement) => achievement.unlockedAt >= cutoffDate);
}

// Générer des rappels intelligents
async function generateSmartReminders(userId) {
  const reminders = [];

  // Rappel de connexion si l'utilisateur n'a pas joué depuis longtemps
  const user = await User.findById(userId);
  if (user && user.lastLogin) {
    const daysSinceLastLogin =
      (Date.now() - user.lastLogin) / (1000 * 60 * 60 * 24);
    if (daysSinceLastLogin > 7) {
      reminders.push({
        id: "login_reminder",
        title: "Revenez jouer !",
        message:
          "Il y a longtemps que vous n'avez pas joué. Revenez pour de nouvelles aventures !",
        priority: 0.7,
        type: "login",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        actionUrl: "/",
        gameId: null,
      });
    }
  }

  return reminders;
}

// Obtenir les genres préférés d'un utilisateur
async function getUserPreferredGenres(userId) {
  const user = await User.findById(userId);
  if (!user || !user.favorites) return {};

  const favoriteGames = await Game.find({ _id: { $in: user.favorites } });
  return favoriteGames.reduce((acc, game) => {
    if (game.genres) {
      game.genres.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
    }
    return acc;
  }, {});
}

// Calculer la similarité entre deux utilisateurs
function calculateUserSimilarity(user1Genres, user2) {
  // Cette fonction serait plus complexe dans un vrai système
  // Pour l'instant, retournons une similarité aléatoire
  return Math.random() * 0.8 + 0.2;
}

// Analyser les heures de jeu préférées
async function analyzePreferredGameTimes(userId, cutoffDate) {
  // Simuler l'analyse des heures de jeu
  return {
    peakHours: ["18:00", "20:00", "22:00"],
    averageSessionDuration: "45 minutes",
    preferredDays: ["weekend", "friday", "saturday"],
  };
}

// Analyser les patterns de session
async function analyzeSessionPatterns(userId, cutoffDate) {
  // Simuler l'analyse des patterns de session
  return {
    averageSessionsPerDay: 2.5,
    longestSession: "3h 15m",
    typicalSessionTime: "1h 30m",
  };
}

// Calculer l'engagement communautaire
async function calculateCommunityEngagement(userId, cutoffDate) {
  // Simuler le calcul de l'engagement
  return {
    forumPosts: Math.floor(Math.random() * 20),
    comments: Math.floor(Math.random() * 50),
    tournamentsCreated: Math.floor(Math.random() * 3),
    communityScore: Math.floor(Math.random() * 100),
  };
}

// Calculer le score d'influence
async function calculateInfluenceScore(userId) {
  // Simuler le calcul du score d'influence
  return Math.floor(Math.random() * 1000);
}

// Générer des recommandations personnalisées
async function generatePersonalizedRecommendations(analysis) {
  const recommendations = [];

  // Recommandation basée sur les genres préférés
  if (analysis.preferences.genres) {
    const topGenre = Object.entries(analysis.preferences.genres).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (topGenre) {
      recommendations.push({
        type: "genre_exploration",
        message: `Explorez plus de jeux ${topGenre[0]}`,
        priority: 0.8,
      });
    }
  }

  // Recommandation basée sur le comportement
  if (analysis.behavior.winRate < 0.4) {
    recommendations.push({
      type: "skill_improvement",
      message:
        "Considérez des jeux plus simples pour améliorer votre taux de victoire",
      priority: 0.7,
    });
  }

  return recommendations;
}

// Calculer le score de confiance de l'analyse
function calculateAnalysisConfidence(analysis) {
  let confidence = 0.5;

  // Plus de données = plus de confiance
  if (
    analysis.preferences.genres &&
    Object.keys(analysis.preferences.genres).length > 0
  ) {
    confidence += 0.2;
  }

  if (analysis.behavior.totalMatches > 10) {
    confidence += 0.2;
  }

  if (analysis.social.friendsCount > 5) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

module.exports = intelligenceTools;





