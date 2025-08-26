const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    cover: String,
    genres: [String],
    rawgId: { type: Number, index: true, unique: true, sparse: true },
    steamAppId: { type: Number, index: true, unique: true, sparse: true },
    cachedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
