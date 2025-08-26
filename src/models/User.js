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

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: String,
    avatarUrl: String,
    steamId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    linkedAccounts: [linkedAccountSchema], // 👈 nouveau
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function (p) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(p, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
