const Game = require("../models/Game");
const User = require("../models/User");
const {
  searchAndCache,
  findLocalByQuery,
  getGameDetails,
} = require("../services/rawg");

module.exports.list = async (req, res) => {
  const q = (req.query.q || "").trim();
  const filter = q ? { name: new RegExp(q, "i") } : {};
  const games = await Game.find(filter).sort({ name: 1 }).lean();
  res.render("games/index", {
    title: "Info",
    page: "info",
    games,
    q,
  });
};

module.exports.searchRAWG = async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.redirect("/info");
  try {
    await searchAndCache(q);
    const games = await findLocalByQuery(q);
    res.render("games/index", {
      title: "Info — " + q,
      page: "info",
      games,
      q,
    });
  } catch (e) {
    console.error(e.message);
    const games = await findLocalByQuery(q);
    // ✅ ici on enlève le “,;”
    res.render("games/index", {
      title: "Info — " + q,
      page: "info",
      games,
      q,
      error: "RAWG indisponible, résultats locaux.",
    });
  }
};

module.exports.toggleFavorite = async (req, res) => {
  const gameId = req.params.id;

  // Vérifier que l'ID est un ObjectId valide
  if (!gameId || gameId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(gameId)) {
    return res.status(400).json({ error: "ID de jeu invalide" });
  }

  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect("/auth/join");
  const idx = user.favorites.findIndex((g) => g.toString() === gameId);
  if (idx >= 0) user.favorites.splice(idx, 1);
  else user.favorites.push(gameId);
  await user.save();
  if (req.get("X-Requested-With") === "fetch" || req.accepts("json")) {
    return res.json({ ok: true, favorite: idx < 0 });
  }
  res.redirect("back");
};

module.exports.show = async (req, res) => {
  const slug = req.params.slug;
  const game = await Game.findOne({ slug }).lean();
  if (!game) return res.redirect("/info");
  let rawg = null;
  try {
    if (game.rawgId) {
      rawg = await getGameDetails(game.rawgId);
    }
  } catch (e) {
    /* silencieux */
  }
  res.render("games/show", {
    title: game.name,
    page: "info",
    game,
    rawg,
  });
};
