const axios = require("axios");
const Game = require("../models/Game");

const RAWG_BASE = "https://api.rawg.io/api";

async function searchAndCache(q) {
  const key = process.env.RAWG_KEY || "4cde867900db46ee9dfbe6cd22f4a186";
  if (!key) throw new Error("RAWG_KEY missing");
  const { data } = await axios.get(`${RAWG_BASE}/games`, {
    params: { search: q, key, page_size: 12 },
  });
  const items = data.results || [];
  const docs = [];
  for (const it of items) {
    const genres = (it.genres || []).map((g) => g.name);
    const payload = {
      name: it.name,
      slug: it.slug,
      cover: it.background_image,
      genres,
      rawgId: it.id,
      cachedAt: new Date(),
    };
    const doc = await Game.findOneAndUpdate(
      { $or: [{ rawgId: it.id }, { slug: it.slug }] },
      { $set: payload },
      { new: true, upsert: true }
    );
    docs.push(doc);
  }
  return docs;
}

async function findLocalByQuery(q) {
  return Game.find({ name: new RegExp(q, "i") })
    .sort({ updatedAt: -1 })
    .limit(12)
    .lean();
}

async function getGameDetails(id) {
  const key = process.env.RAWG_KEY || "4cde867900db46ee9dfbe6cd22f4a186";
  if (!key) throw new Error("RAWG_KEY missing");
  const [detailsRes, screenshotsRes] = await Promise.all([
    axios.get(`${RAWG_BASE}/games/${id}`, { params: { key } }),
    axios.get(`${RAWG_BASE}/games/${id}/screenshots`, {
      params: { key, page_size: 8 },
    }),
  ]);
  return {
    details: detailsRes.data,
    screenshots: screenshotsRes.data.results || [],
  };
}

module.exports = { searchAndCache, findLocalByQuery, getGameDetails };
