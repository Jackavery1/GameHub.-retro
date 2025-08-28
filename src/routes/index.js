const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const User = require("../models/User");
const Registration = require("../models/Registration");
const { getOwnedGames } = require("../services/steam");

router.get("/", (req, res) =>
  res.render("home", { title: "GameHub Retro", page: "home", layout: false })
);

// src/routes/index.js
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .populate("favorites")
      .lean();

    // Utilisateur introuvable (session obsolète) → on réinitialise
    if (!user) {
      req.session.destroy(() => res.redirect("/auth/login"));
      return;
    }

    const regs = await Registration.find({ user: user._id })
      .populate({ path: "tournament", populate: { path: "game" } })
      .lean();

    const upcoming = regs.filter(
      (r) =>
        r.tournament &&
        r.tournament.startsAt &&
        new Date(r.tournament.startsAt) > new Date()
    );

    let steamGames = [];
    if (user.steamId) {
      steamGames = await getOwnedGames(user.steamId);
      steamGames = steamGames.slice(0, 6);
    }

    res.render("dashboard", {
      title: "Dashboard",
      page: "dashboard",
      user,
      upcoming,
      steamGames,
    });
  } catch (err) {
    console.error("❌ Erreur dashboard:", err);
    res.redirect("/auth/login");
  }
});

router.post("/theme", (req, res) => {
  const theme = (
    req.body && req.body.theme ? req.body.theme : "neon"
  ).toLowerCase();
  res.cookie("theme", theme, { httpOnly: false, maxAge: 31536000000 });
  res.json({ ok: true });
});

router.get("/arcade", (req, res) => {
  res.render("arcade", { title: "Games", page: "arcade" });
});

router.get("/arcade/nes", (req, res) =>
  res.render("arcade-nes", { title: "NES", page: "arcade" })
);
router.get("/arcade/flash", (req, res) =>
  res.render("arcade-flash", { title: "Flash", page: "arcade" })
);
router.get("/arcade/dos", (req, res) =>
  res.render("arcade-dos", { title: "MS-DOS", page: "arcade" })
);

module.exports = router;
