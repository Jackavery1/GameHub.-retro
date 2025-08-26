const mongoose = require("mongoose");
const s = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    seed: Number,
  },
  { timestamps: true }
);
s.index({ user: 1, tournament: 1 }, { unique: true });
module.exports = mongoose.model("Registration", s);
