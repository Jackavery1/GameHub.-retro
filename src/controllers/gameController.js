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

  // Vérifier si RAWG_KEY est configuré
  const rawgKey = process.env.RAWG_KEY || "4cde867900db46ee9dfbe6cd22f4a186";
  if (!rawgKey) {
    const games = await findLocalByQuery(q);
    return res.render("games/index", {
      title: "Info — " + q,
      page: "info",
      games,
      q,
      error: "Clé API RAWG non configurée. Résultats locaux uniquement.",
    });
  }

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
    console.error("Erreur RAWG:", e.message);
    const games = await findLocalByQuery(q);
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
  try {
    const slug = req.params.slug;

    // Trouver le jeu par slug
    const game = await Game.findOne({ slug }).lean();
    if (!game) {
      return res.status(404).json({ error: "Jeu non trouvé" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect("/auth/join");

    const idx = user.favorites.findIndex(
      (g) => g.toString() === game._id.toString()
    );
    if (idx >= 0) {
      user.favorites.splice(idx, 1);
    } else {
      user.favorites.push(game._id);
    }

    await user.save();

    if (req.get("X-Requested-With") === "fetch" || req.accepts("json")) {
      return res.json({ ok: true, favorite: idx < 0 });
    }
    res.redirect("back");
  } catch (error) {
    console.error("Erreur toggleFavorite:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports.show = async (req, res) => {
  try {
    const slug = req.params.slug;
    const game = await Game.findOne({ slug }).lean();

    if (!game) {
      return res.status(404).render("404", { title: "Jeu non trouvé" });
    }

    // Récupération des détails RAWG
    let rawg = null;
    try {
      if (game.rawgId) {
        rawg = await getGameDetails(game.rawgId);
      }
    } catch (e) {
      console.error("Erreur RAWG:", e.message);
    }

    // Vérification de l'authentification et des favoris
    const isAuthenticated = req.session && req.session.userId;
    let isFavorite = false;

    if (isAuthenticated) {
      try {
        const user = await User.findById(req.session.userId);
        isFavorite =
          user &&
          user.favorites &&
          user.favorites.some((fav) => fav.toString() === game._id.toString());
      } catch (e) {
        console.error("Erreur vérification favoris:", e.message);
      }
    }

    res.render("games/show", {
      title: game.name,
      page: "info",
      game,
      rawg,
      isAuthenticated,
      isFavorite,
    });
  } catch (error) {
    console.error("Erreur dans show:", error);
    res.status(500).render("404", { title: "Erreur serveur" });
  }
};
