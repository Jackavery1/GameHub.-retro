const express = require("express");
const path = require("path");
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
router.get("/arcade/nes-functional", (req, res) =>
  res.render("arcade-nes-functional", {
    title: "NES Fonctionnel",
    page: "arcade",
  })
);
router.get("/arcade/flash", (req, res) =>
  res.render("arcade-flash", { title: "Flash", page: "arcade" })
);
router.get("/arcade/dos", (req, res) =>
  res.render("arcade-dos", { title: "MS-DOS", page: "arcade" })
);
router.get("/arcade/dos-crt", (req, res) =>
  res.render("arcade-dos-crt", { title: "MS-DOS CRT", page: "arcade" })
);
router.get("/arcade/snes", (req, res) =>
  res.render("arcade-snes", { title: "SNES", page: "arcade" })
);
router.get("/arcade/snes-functional", (req, res) =>
  res.render("arcade-snes-functional", {
    title: "SNES Fonctionnel",
    page: "arcade",
  })
);
router.get("/arcade/gb", (req, res) =>
  res.render("arcade-gb", { title: "Game Boy", page: "arcade" })
);
router.get("/arcade/gb-functional", (req, res) =>
  res.render("arcade-gb-functional", {
    title: "Game Boy Fonctionnel",
    page: "arcade",
  })
);
router.get("/arcade/genesis", (req, res) =>
  res.render("arcade-genesis", { title: "Sega Genesis", page: "arcade" })
);
router.get("/arcade/arcade", (req, res) =>
  res.render("arcade-arcade", { title: "Arcade", page: "arcade" })
);
router.get("/arcade/multi", (req, res) =>
  res.render("arcade-multi", { title: "Multi-Émulateur", page: "arcade" })
);
router.get("/retroarch-info", (req, res) =>
  res.render("retroarch-info", {
    title: "RetroArch & Émulateurs",
    page: "arcade",
  })
);

// Routes pour les pages de test HTML
router.get("/test-emulator.html", (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/test-emulator.html"))
);
router.get("/test-all-emulators.html", (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/test-all-emulators.html"))
);

router.get("/test-settings-route.html", (req, res) =>
  res.sendFile(path.join(__dirname, "../../test-settings-route.html"))
);

module.exports = router;
