const express = require("express");
const router = express.Router();
const { ensureAuth, ensureOwnerOrAdmin } = require("../middleware/auth");
const ctrl = require("../controllers/tournamentController");
router.get("/", ctrl.index);
router.get("/new", ensureAuth, ctrl.showCreate);
router.post("/", ensureAuth, ctrl.create);
router.get("/:id", ctrl.show);
router.post("/:id/register", ensureAuth, ctrl.register);
router.post(
  "/:id/seed",
  ensureAuth,
  ensureOwnerOrAdmin(ctrl._findTournament),
  ctrl.seed
);
router.post(
  "/matches/:id/report",
  ensureAuth,
  async (req, res, next) => {
    const Match = require("../models/Match");
    const Tournament = require("../models/Tournament");
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).send("Not found");
    const t = await Tournament.findById(match.tournament);
    const isOwner =
      t && req.session.userId && t.createdBy?.toString() === req.session.userId;
    const isAdmin = req.session.role === "admin";
    if (isOwner || isAdmin) return next();
    return res.status(403).send("Forbidden");
  },
  ctrl.report
);
module.exports = router;
