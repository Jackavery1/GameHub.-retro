const mongoose = require("mongoose");
const s = new mongoose.Schema(
  {
    title: { type: String, required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    startsAt: { type: Date, required: true },
    maxPlayers: { type: Number, default: 8 },
    status: {
      type: String,
      enum: ["draft", "open", "running", "finished"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Tournament", s);
