const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const ctrl = require("../controllers/gameController");

// CSV / fake steam (si présents)
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const path = require("path");
const Game = require("../models/Game");

router.get("/", ensureAuth, ctrl.list); // Info (listing)
router.get("/search", ensureAuth, ctrl.searchRAWG); // Recherche RAWG -> cache
router.get("/:slug", ensureAuth, ctrl.show); // Fiche jeu
router.post("/:id/favorite", ensureAuth, ctrl.toggleFavorite);

// Import CSV local
router.post(
  "/import/csv",
  ensureAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).send("CSV manquant.");
      const raw = fs.readFileSync(req.file.path, "utf8");
      fs.unlink(req.file.path, () => {});
      const lines = raw.split(/\r?\n/).filter((l) => l.trim().length);
      if (lines[0] && /(^|[,;])\s*name\s*([,;]|$)/i.test(lines[0]))
        lines.shift();
      for (const line of lines) {
        const parts = line.split(/;|,/).map((s) => s.trim());
        const [name, slug, genres, cover] = parts;
        if (!name) continue;
        const doc = {
          name,
          slug: (slug || name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          cover: cover || "",
          genres: genres
            ? genres
                .split("|")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          cachedAt: new Date(),
        };
        await Game.findOneAndUpdate(
          { slug: doc.slug },
          { $set: doc },
          { upsert: true, new: true }
        );
      }
      res.redirect("/games");
    } catch (e) {
      console.error(e);
      res.status(500).send("Import CSV impossible.");
    }
  }
);

// Import "fake Steam" depuis data/steam-owned.json
router.post("/import/steam-fake", ensureAuth, async (req, res) => {
  try {
    const fpath = path.join(process.cwd(), "data", "steam-owned.json");
    if (!fs.existsSync(fpath))
      return res.status(400).send("Fichier data/steam-owned.json introuvable.");
    const owned = JSON.parse(fs.readFileSync(fpath, "utf8"));
    const coverOf = (appid) =>
      `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`;
    for (const g of owned) {
      const slug = `steam-${g.appid}`;
      await Game.findOneAndUpdate(
        { slug },
        {
          $set: {
            name: g.name || `Steam App ${g.appid}`,
            slug,
            cover: coverOf(g.appid),
            genres: [],
            cachedAt: new Date(),
            steamAppId: g.appid,
          },
        },
        { upsert: true, new: true }
      );
    }
    res.redirect("/games?q=steam-");
  } catch (e) {
    console.error(e);
    res.status(500).send("Import Steam fake impossible.");
  }
});

module.exports = router;
