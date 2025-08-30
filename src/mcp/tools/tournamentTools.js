const Tournament = require("../../models/Tournament");
const Match = require("../../models/Match");
const Registration = require("../../models/Registration");
const User = require("../../models/User");
const Game = require("../../models/Game");

const tournamentTools = [
  {
    name: "get_tournament",
    description: "Récupère un tournoi par son ID ou nom",
    inputSchema: {
      type: "object",
      properties: {
        tournamentId: { type: "string", description: "ID du tournoi" },
        name: { type: "string", description: "Nom du tournoi" },
      },
      oneOf: [{ required: ["tournamentId"] }, { required: ["name"] }],
    },
    handler: async ({ tournamentId, name }) => {
      try {
        let tournament;
        if (tournamentId) {
          tournament = await Tournament.findById(tournamentId)
            .populate("game", "name slug cover")
            .populate("organizer", "name email");
        } else if (name) {
          tournament = await Tournament.findOne({
            name: { $regex: name, $options: "i" },
          })
            .populate("game", "name slug cover")
            .populate("organizer", "name email");
        }

        if (!tournament) {
          return { error: "Tournoi non trouvé" };
        }

        return { tournament };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "create_tournament",
    description: "Crée un nouveau tournoi",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nom du tournoi" },
        description: { type: "string", description: "Description du tournoi" },
        gameId: { type: "string", description: "ID du jeu" },
        organizerId: { type: "string", description: "ID de l'organisateur" },
        maxParticipants: {
          type: "number",
          description: "Nombre maximum de participants",
        },
        startDate: {
          type: "string",
          description: "Date de début (ISO string)",
        },
        endDate: { type: "string", description: "Date de fin (ISO string)" },
        format: {
          type: "string",
          enum: ["single_elimination", "double_elimination", "round_robin"],
          default: "single_elimination",
        },
        entryFee: {
          type: "number",
          default: 0,
          description: "Frais d'inscription",
        },
        prizePool: { type: "number", default: 0, description: "Prix à gagner" },
      },
      required: [
        "name",
        "gameId",
        "organizerId",
        "maxParticipants",
        "startDate",
      ],
    },
    handler: async ({
      name,
      description,
      gameId,
      organizerId,
      maxParticipants,
      startDate,
      endDate,
      format = "single_elimination",
      entryFee = 0,
      prizePool = 0,
    }) => {
      try {
        const game = await Game.findById(gameId);
        if (!game) {
          return { error: "Jeu non trouvé" };
        }

        const organizer = await User.findById(organizerId);
        if (!organizer) {
          return { error: "Organisateur non trouvé" };
        }

        const tournament = new Tournament({
          name,
          description,
          game: gameId,
          organizer: organizerId,
          maxParticipants,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          format,
          entryFee,
          prizePool,
          status: "registration",
        });

        await tournament.save();

        const populatedTournament = await Tournament.findById(tournament._id)
          .populate("game", "name slug cover")
          .populate("organizer", "name email");

        return {
          tournament: populatedTournament,
          message: "Tournoi créé avec succès",
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "update_tournament",
    description: "Met à jour un tournoi existant",
    inputSchema: {
      type: "object",
      properties: {
        tournamentId: { type: "string", description: "ID du tournoi" },
        updates: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            maxParticipants: { type: "number" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            format: {
              type: "string",
              enum: ["single_elimination", "double_elimination", "round_robin"],
            },
            entryFee: { type: "number" },
            prizePool: { type: "number" },
            status: {
              type: "string",
              enum: ["registration", "active", "completed", "cancelled"],
            },
          },
        },
      },
      required: ["tournamentId", "updates"],
    },
    handler: async ({ tournamentId, updates }) => {
      try {
        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.endDate) updates.endDate = new Date(updates.endDate);

        const tournament = await Tournament.findByIdAndUpdate(
          tournamentId,
          { $set: updates },
          { new: true, runValidators: true }
        )
          .populate("game", "name slug cover")
          .populate("organizer", "name email");

        if (!tournament) {
          return { error: "Tournoi non trouvé" };
        }

        return { tournament, message: "Tournoi mis à jour avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "delete_tournament",
    description: "Supprime un tournoi et toutes ses données associées",
    inputSchema: {
      type: "object",
      properties: {
        tournamentId: { type: "string", description: "ID du tournoi" },
      },
      required: ["tournamentId"],
    },
    handler: async ({ tournamentId }) => {
      try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          return { error: "Tournoi non trouvé" };
        }

        await Promise.all([
          Tournament.findByIdAndDelete(tournamentId),
          Match.deleteMany({ tournament: tournamentId }),
          Registration.deleteMany({ tournament: tournamentId }),
        ]);

        return {
          message: "Tournoi et toutes ses données supprimés avec succès",
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "list_tournaments",
    description: "Liste tous les tournois avec filtres et pagination",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", default: 1, description: "Numéro de page" },
        limit: {
          type: "number",
          default: 10,
          description: "Nombre de tournois par page",
        },
        status: {
          type: "string",
          enum: ["registration", "active", "completed", "cancelled"],
          description: "Filtrer par statut",
        },
        gameId: { type: "string", description: "Filtrer par jeu" },
        organizerId: {
          type: "string",
          description: "Filtrer par organisateur",
        },
        search: { type: "string", description: "Recherche par nom" },
      },
    },
    handler: async ({
      page = 1,
      limit = 10,
      status,
      gameId,
      organizerId,
      search,
    }) => {
      try {
        const filter = {};

        if (status) filter.status = status;
        if (gameId) filter.game = gameId;
        if (organizerId) filter.organizer = organizerId;
        if (search) filter.name = { $regex: search, $options: "i" };

        const skip = (page - 1) * limit;

        const tournaments = await Tournament.find(filter)
          .populate("game", "name slug cover")
          .populate("organizer", "name email")
          .skip(skip)
          .limit(limit)
          .sort({ startDate: -1 });

        const total = await Tournament.countDocuments(filter);

        return {
          tournaments,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "register_participant",
    description: "Inscrit un participant à un tournoi",
    inputSchema: {
      type: "object",
      properties: {
        tournamentId: { type: "string", description: "ID du tournoi" },
        userId: { type: "string", description: "ID de l'utilisateur" },
      },
      required: ["tournamentId", "userId"],
    },
    handler: async ({ tournamentId, userId }) => {
      try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          return { error: "Tournoi non trouvé" };
        }

        if (tournament.status !== "registration") {
          return {
            error: "Les inscriptions ne sont plus ouvertes pour ce tournoi",
          };
        }

        const existingRegistration = await Registration.findOne({
          tournament: tournamentId,
          participant: userId,
        });

        if (existingRegistration) {
          return { error: "L'utilisateur est déjà inscrit à ce tournoi" };
        }

        const currentParticipants = await Registration.countDocuments({
          tournament: tournamentId,
        });
        if (currentParticipants >= tournament.maxParticipants) {
          return { error: "Le tournoi est complet" };
        }

        const user = await User.findById(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        const registration = new Registration({
          tournament: tournamentId,
          participant: userId,
          registeredAt: new Date(),
        });

        await registration.save();

        return {
          registration,
          message: "Inscription réussie",
          currentParticipants: currentParticipants + 1,
          maxParticipants: tournament.maxParticipants,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "get_tournament_participants",
    description: "Récupère la liste des participants d'un tournoi",
    inputSchema: {
      type: "object",
      properties: {
        tournamentId: { type: "string", description: "ID du tournoi" },
      },
      required: ["tournamentId"],
    },
    handler: async ({ tournamentId }) => {
      try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          return { error: "Tournoi non trouvé" };
        }

        const registrations = await Registration.find({
          tournament: tournamentId,
        })
          .populate("participant", "name email avatarUrl")
          .sort({ registeredAt: 1 });

        const participants = registrations.map((reg) => ({
          ...reg.participant.toObject(),
          registeredAt: reg.registeredAt,
        }));

        return {
          participants,
          total: participants.length,
          maxParticipants: tournament.maxParticipants,
          availableSlots: tournament.maxParticipants - participants.length,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "generate_tournament_bracket",
    description: "Génère le bracket d'un tournoi",
    inputSchema: {
      type: "object",
      properties: {
        tournamentId: { type: "string", description: "ID du tournoi" },
      },
      required: ["tournamentId"],
    },
    handler: async ({ tournamentId }) => {
      try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          return { error: "Tournoi non trouvé" };
        }

        if (tournament.status !== "registration") {
          return {
            error:
              "Le bracket ne peut être généré que pendant la phase d'inscription",
          };
        }

        const registrations = await Registration.find({
          tournament: tournamentId,
        });
        if (registrations.length < 2) {
          return {
            error: "Il faut au moins 2 participants pour générer un bracket",
          };
        }

        const participants = registrations.map((reg) => reg.participant);
        const bracket = generateBracket(participants, tournament.format);

        await Tournament.findByIdAndUpdate(tournamentId, {
          status: "active",
          bracket: bracket,
        });

        return {
          bracket,
          message: "Bracket généré avec succès",
          participants: participants.length,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },
];

function generateBracket(participants, format) {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  if (format === "single_elimination") {
    return generateSingleEliminationBracket(shuffled);
  } else if (format === "double_elimination") {
    return generateDoubleEliminationBracket(shuffled);
  } else {
    return generateRoundRobinBracket(shuffled);
  }
}

function generateSingleEliminationBracket(participants) {
  const rounds = [];
  let currentRound = [...participants];

  while (currentRound.length > 1) {
    const round = [];
    for (let i = 0; i < currentRound.length; i += 2) {
      if (i + 1 < currentRound.length) {
        round.push({
          player1: currentRound[i],
          player2: currentRound[i + 1],
          winner: null,
          score: null,
        });
      } else {
        round.push({
          player1: currentRound[i],
          player2: null,
          winner: currentRound[i],
          score: null,
        });
      }
    }
    rounds.push(round);
    currentRound = round.map((match) => match.winner).filter(Boolean);
  }

  return rounds;
}

function generateDoubleEliminationBracket(participants) {
  return {
    winners: generateSingleEliminationBracket(participants),
    losers: [],
  };
}

function generateRoundRobinBracket(participants) {
  const matches = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      matches.push({
        player1: participants[i],
        player2: participants[j],
        winner: null,
        score: null,
      });
    }
  }
  return matches;
}

module.exports = tournamentTools;
