const mongoose = require("mongoose");
const s = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    round: { type: Number, required: true },
    position: { type: Number, required: true },
    playerA: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
    playerB: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
    scoreA: Number,
    scoreB: Number,
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
    nextMatch: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  },
  { timestamps: true }
);
s.index({ tournament: 1, round: 1, position: 1 }, { unique: true });
module.exports = mongoose.model("Match", s);
