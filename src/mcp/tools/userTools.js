const User = require("../../models/User");
const bcrypt = require("bcrypt");

const userTools = [
  {
    name: "get_user",
    description: "Récupère un utilisateur par son ID ou email",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
        email: { type: "string", description: "Email de l'utilisateur" },
      },
      oneOf: [{ required: ["userId"] }, { required: ["email"] }],
    },
    handler: async ({ userId, email }) => {
      try {
        let user;
        if (userId) {
          user = await User.findById(userId).select("-passwordHash");
        } else if (email) {
          user = await User.findOne({ email }).select("-passwordHash");
        }

        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        return { user };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "create_user",
    description: "Crée un nouvel utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nom de l'utilisateur" },
        email: { type: "string", description: "Email de l'utilisateur" },
        password: { type: "string", description: "Mot de passe" },
        role: { type: "string", enum: ["user", "admin"], default: "user" },
      },
      required: ["name", "email", "password"],
    },
    handler: async ({ name, email, password, role = "user" }) => {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return { error: "Un utilisateur avec cet email existe déjà" };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
          name,
          email,
          passwordHash,
          role,
        });

        await user.save();
        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        return { user: userResponse, message: "Utilisateur créé avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "update_user",
    description: "Met à jour un utilisateur existant",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
        updates: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            avatarUrl: { type: "string" },
          },
        },
      },
      required: ["userId", "updates"],
    },
    handler: async ({ userId, updates }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { $set: updates },
          { new: true, runValidators: true }
        ).select("-passwordHash");

        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        return { user, message: "Utilisateur mis à jour avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "delete_user",
    description: "Supprime un utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
      },
      required: ["userId"],
    },
    handler: async ({ userId }) => {
      try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        return { message: "Utilisateur supprimé avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "list_users",
    description: "Liste tous les utilisateurs avec pagination",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", default: 1, description: "Numéro de page" },
        limit: {
          type: "number",
          default: 10,
          description: "Nombre d'utilisateurs par page",
        },
        role: {
          type: "string",
          enum: ["user", "admin"],
          description: "Filtrer par rôle",
        },
      },
    },
    handler: async ({ page = 1, limit = 10, role }) => {
      try {
        const filter = role ? { role } : {};
        const skip = (page - 1) * limit;

        const users = await User.find(filter)
          .select("-passwordHash")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        return {
          users,
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
    name: "link_account",
    description: "Lie un compte externe à un utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
        provider: {
          type: "string",
          enum: ["steam", "gog", "epic", "itchio", "amazon"],
          description: "Fournisseur du compte",
        },
        handle: { type: "string", description: "Identifiant public du compte" },
      },
      required: ["userId", "provider", "handle"],
    },
    handler: async ({ userId, provider, handle }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        const existingLink = user.linkedAccounts.find(
          (account) => account.provider === provider
        );

        if (existingLink) {
          existingLink.handle = handle;
          existingLink.linkedAt = new Date();
        } else {
          user.linkedAccounts.push({ provider, handle });
        }

        await user.save();
        return {
          message: `Compte ${provider} lié avec succès`,
          linkedAccounts: user.linkedAccounts,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },
];

module.exports = userTools;
