const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const linkedAccountSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["steam", "gog", "epic", "itchio", "amazon"],
      required: true,
    },
    handle: { type: String }, // pseudo / id public
    linkedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const authTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    type: {
      type: String,
      enum: ["session", "mcp_access", "api"],
      default: "session",
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    lastUsed: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: String,
    avatarUrl: String,
    steamId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    linkedAccounts: [linkedAccountSchema],
    authTokens: [authTokenSchema], // Tokens d'authentification
    lastLogin: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function (p) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(p, this.passwordHash);
};

// Méthode pour nettoyer les tokens expirés
userSchema.methods.cleanupExpiredTokens = function () {
  const now = new Date();
  this.authTokens = this.authTokens.filter((token) => token.expiresAt > now);
  return this.save();
};

// Méthode pour ajouter un token
userSchema.methods.addAuthToken = function (tokenData) {
  this.authTokens.push(tokenData);
  return this.save();
};

// Méthode pour révoquer un token
userSchema.methods.revokeToken = function (token) {
  this.authTokens = this.authTokens.filter((t) => t.token !== token);
  return this.save();
};

// Méthode pour vérifier si l'utilisateur a un token MCP valide
userSchema.methods.hasValidMCPToken = function () {
  const now = new Date();
  return this.authTokens.some(
    (token) => token.type === "mcp_access" && token.expiresAt > now
  );
};

// Index pour optimiser les recherches de tokens
userSchema.index({ "authTokens.token": 1 });
userSchema.index({ "authTokens.expiresAt": 1 });
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model("User", userSchema);
