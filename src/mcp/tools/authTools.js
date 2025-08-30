const User = require("../../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

const authTools = [
  {
    name: "authenticate_user",
    description: "Authentifie un utilisateur avec email et mot de passe",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email de l'utilisateur" },
        password: { type: "string", description: "Mot de passe" },
      },
      required: ["email", "password"],
    },
    handler: async ({ email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return { error: "Email ou mot de passe incorrect" };
        }

        if (!user.passwordHash) {
          return { error: "Ce compte n'a pas de mot de passe configuré" };
        }

        const isValidPassword = await user.verifyPassword(password);
        if (!isValidPassword) {
          return { error: "Email ou mot de passe incorrect" };
        }

        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        return {
          user: userResponse,
          message: "Authentification réussie",
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "change_password",
    description: "Change le mot de passe d'un utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
        currentPassword: { type: "string", description: "Mot de passe actuel" },
        newPassword: { type: "string", description: "Nouveau mot de passe" },
      },
      required: ["userId", "currentPassword", "newPassword"],
    },
    handler: async ({ userId, currentPassword, newPassword }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        if (!user.passwordHash) {
          return { error: "Ce compte n'a pas de mot de passe configuré" };
        }

        const isValidPassword = await user.verifyPassword(currentPassword);
        if (!isValidPassword) {
          return { error: "Mot de passe actuel incorrect" };
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newPasswordHash;
        await user.save();

        return { message: "Mot de passe changé avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "reset_password",
    description:
      "Réinitialise le mot de passe d'un utilisateur (admin seulement)",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
        newPassword: { type: "string", description: "Nouveau mot de passe" },
        adminUserId: {
          type: "string",
          description: "ID de l'administrateur effectuant la réinitialisation",
        },
      },
      required: ["userId", "newPassword", "adminUserId"],
    },
    handler: async ({ userId, newPassword, adminUserId }) => {
      try {
        const adminUser = await User.findById(adminUserId);
        if (!adminUser || adminUser.role !== "admin") {
          return { error: "Accès refusé: droits administrateur requis" };
        }

        const user = await User.findById(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newPasswordHash;
        await user.save();

        return { message: "Mot de passe réinitialisé avec succès" };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "verify_steam_account",
    description: "Vérifie et lie un compte Steam à un utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
        steamId: { type: "string", description: "ID Steam de l'utilisateur" },
      },
      required: ["userId", "steamId"],
    },
    handler: async ({ userId, steamId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        const existingUserWithSteam = await User.findOne({ steamId });
        if (
          existingUserWithSteam &&
          existingUserWithSteam._id.toString() !== userId
        ) {
          return {
            error: "Ce compte Steam est déjà lié à un autre utilisateur",
          };
        }

        user.steamId = steamId;

        const existingSteamLink = user.linkedAccounts.find(
          (account) => account.provider === "steam"
        );

        if (existingSteamLink) {
          existingSteamLink.handle = steamId;
          existingSteamLink.linkedAt = new Date();
        } else {
          user.linkedAccounts.push({
            provider: "steam",
            handle: steamId,
            linkedAt: new Date(),
          });
        }

        await user.save();

        return {
          message: "Compte Steam lié avec succès",
          steamId,
          linkedAccounts: user.linkedAccounts,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "check_permissions",
    description: "Vérifie les permissions d'un utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
        requiredRole: {
          type: "string",
          enum: ["user", "admin"],
          description: "Rôle requis",
        },
        action: { type: "string", description: "Action à effectuer" },
      },
      required: ["userId", "requiredRole", "action"],
    },
    handler: async ({ userId, requiredRole, action }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return {
            hasPermission: false,
            error: "Utilisateur non trouvé",
          };
        }

        const hasPermission =
          user.role === "admin" || user.role === requiredRole;

        return {
          hasPermission,
          userRole: user.role,
          requiredRole,
          action,
          message: hasPermission ? "Permission accordée" : "Permission refusée",
        };
      } catch (error) {
        return {
          hasPermission: false,
          error: error.message,
        };
      }
    },
  },

  {
    name: "get_user_session",
    description: "Récupère les informations de session d'un utilisateur",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID de l'utilisateur" },
      },
      required: ["userId"],
    },
    handler: async ({ userId }) => {
      try {
        const user = await User.findById(userId).select("-passwordHash");
        if (!user) {
          return { error: "Utilisateur non trouvé" };
        }

        const sessionInfo = {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          steamId: user.steamId,
          linkedAccounts: user.linkedAccounts,
          hasSteam: Boolean(user.steamId),
          isAdmin: user.role === "admin",
          createdAt: user.createdAt,
          lastLogin: user.updatedAt,
        };

        return { sessionInfo };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "validate_token",
    description: "Valide un token d'authentification (simulation)",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Token à valider" },
        tokenType: {
          type: "string",
          enum: ["session", "api", "steam"],
          default: "session",
          description: "Type de token",
        },
      },
      required: ["token"],
    },
    handler: async ({ token, tokenType = "session" }) => {
      try {
        if (!token || token.length < 10) {
          return {
            isValid: false,
            error: "Token invalide ou trop court",
          };
        }

        if (tokenType === "steam") {
          return {
            isValid: true,
            tokenType,
            message: "Token Steam valide (simulation)",
            steamId: "STEAM_" + Math.random().toString(36).substr(2, 9),
          };
        }

        return {
          isValid: true,
          tokenType,
          message: "Token valide (simulation)",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
      } catch (error) {
        return {
          isValid: false,
          error: error.message,
        };
      }
    },
  },
];

module.exports = authTools;
