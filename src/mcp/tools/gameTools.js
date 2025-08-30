const Game = require("../../models/Game");

const gameTools = [
  {
    name: "get_game",
    description: "Récupère un jeu par son ID, slug ou nom",
    inputSchema: {
      type: "object",
      properties: {
        gameId: { type: "string", description: "ID du jeu" },
        slug: { type: "string", description: "Slug du jeu" },
        name: { type: "string", description: "Nom du jeu" },
      },
      oneOf: [
        { required: ["gameId"] },
        { required: ["slug"] },
        { required: ["name"] },
      ],
    },
    handler: async ({ gameId, slug, name }) => {
      try {
        let game;
        if (gameId) {
          game = await Game.findById(gameId);
        } else if (slug) {
          game = await Game.findOne({ slug });
        } else if (name) {
          game = await Game.findOne({ name: { $regex: name, $options: "i" } });
        }

        if (!game) {
          return { error: "Jeu non trouvé" };
        }

        return { game };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "create_game",
    description: "Crée un nouveau jeu",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nom du jeu" },
        slug: { type: "string", description: "Slug unique du jeu" },
        cover: { type: "string", description: "URL de la couverture" },
        genres: {
          type: "array",
          items: { type: "string" },
          description: "Genres du jeu",
        },
        rawgId: { type: "number", description: "ID RAWG" },
        steamAppId: { type: "number", description: "ID Steam" },
      },
      required: ["name", "slug"],
    },
    handler: async ({ name, slug, cover, genres, rawgId, steamAppId }) => {
      try {
        const existingGame = await Game.findOne({
          $or: [{ slug }, { name: { $regex: name, $options: "i" } }],
        });

        if (existingGame) {
          return { error: "Un jeu avec ce nom ou slug existe déjà" };
        }

        const game = new Game({
          name,
          slug,
          cover,
          genres: genres || [],
          rawgId,
          steamAppId,
          cachedAt: new Date(),
        });

        await game.save();
        return { game, message: "Jeu créé avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "update_game",
    description: "Met à jour un jeu existant",
    inputSchema: {
      type: "object",
      properties: {
        gameId: { type: "string", description: "ID du jeu" },
        updates: {
          type: "object",
          properties: {
            name: { type: "string" },
            slug: { type: "string" },
            cover: { type: "string" },
            genres: { type: "array", items: { type: "string" } },
            rawgId: { type: "number" },
            steamAppId: { type: "number" },
          },
        },
      },
      required: ["gameId", "updates"],
    },
    handler: async ({ gameId, updates }) => {
      try {
        const game = await Game.findByIdAndUpdate(
          gameId,
          { $set: { ...updates, cachedAt: new Date() } },
          { new: true, runValidators: true }
        );

        if (!game) {
          return { error: "Jeu non trouvé" };
        }

        return { game, message: "Jeu mis à jour avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "delete_game",
    description: "Supprime un jeu",
    inputSchema: {
      type: "object",
      properties: {
        gameId: { type: "string", description: "ID du jeu" },
      },
      required: ["gameId"],
    },
    handler: async ({ gameId }) => {
      try {
        const game = await Game.findByIdAndDelete(gameId);
        if (!game) {
          return { error: "Jeu non trouvé" };
        }

        return { message: "Jeu supprimé avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "list_games",
    description: "Liste tous les jeux avec filtres et pagination",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", default: 1, description: "Numéro de page" },
        limit: {
          type: "number",
          default: 20,
          description: "Nombre de jeux par page",
        },
        genre: { type: "string", description: "Filtrer par genre" },
        search: { type: "string", description: "Recherche par nom" },
        sortBy: {
          type: "string",
          enum: ["name", "createdAt", "updatedAt"],
          default: "name",
          description: "Critère de tri",
        },
        sortOrder: {
          type: "string",
          enum: ["asc", "desc"],
          default: "asc",
          description: "Ordre de tri",
        },
      },
    },
    handler: async ({
      page = 1,
      limit = 20,
      genre,
      search,
      sortBy = "name",
      sortOrder = "asc",
    }) => {
      try {
        const filter = {};

        if (genre) {
          filter.genres = { $in: [genre] };
        }

        if (search) {
          filter.name = { $regex: search, $options: "i" };
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const games = await Game.find(filter)
          .skip(skip)
          .limit(limit)
          .sort(sort);

        const total = await Game.countDocuments(filter);

        return {
          games,
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
    name: "search_games",
    description: "Recherche avancée de jeux",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Terme de recherche" },
        genres: {
          type: "array",
          items: { type: "string" },
          description: "Genres à inclure",
        },
        excludeGenres: {
          type: "array",
          items: { type: "string" },
          description: "Genres à exclure",
        },
        hasCover: {
          type: "boolean",
          description: "Jeux avec couverture uniquement",
        },
        limit: {
          type: "number",
          default: 50,
          description: "Nombre maximum de résultats",
        },
      },
      required: ["query"],
    },
    handler: async ({ query, genres, excludeGenres, hasCover, limit = 50 }) => {
      try {
        const filter = {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { slug: { $regex: query, $options: "i" } },
          ],
        };

        if (genres && genres.length > 0) {
          filter.genres = { $in: genres };
        }

        if (excludeGenres && excludeGenres.length > 0) {
          filter.genres = { ...filter.genres, $nin: excludeGenres };
        }

        if (hasCover) {
          filter.cover = { $exists: true, $ne: null, $ne: "" };
        }

        const games = await Game.find(filter).limit(limit).sort({ name: 1 });

        return {
          games,
          total: games.length,
          query,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "get_game_stats",
    description: "Récupère les statistiques des jeux",
    inputSchema: {
      type: "object",
      properties: {
        includeGenres: {
          type: "boolean",
          default: true,
          description: "Inclure les statistiques par genre",
        },
      },
    },
    handler: async ({ includeGenres = true }) => {
      try {
        const totalGames = await Game.countDocuments();
        const gamesWithCover = await Game.countDocuments({
          cover: { $exists: true, $ne: null, $ne: "" },
        });
        const gamesWithSteam = await Game.countDocuments({
          steamAppId: { $exists: true },
        });
        const gamesWithRawg = await Game.countDocuments({
          rawgId: { $exists: true },
        });

        let genreStats = null;
        if (includeGenres) {
          const genreAggregation = await Game.aggregate([
            { $unwind: "$genres" },
            { $group: { _id: "$genres", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]);
          genreStats = genreAggregation;
        }

        return {
          totalGames,
          gamesWithCover,
          gamesWithSteam,
          gamesWithRawg,
          genreStats,
          coverPercentage: Math.round((gamesWithCover / totalGames) * 100),
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },
];

module.exports = gameTools;
