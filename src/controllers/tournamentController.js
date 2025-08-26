const Tournament = require("../models/Tournament");
const Registration = require("../models/Registration");
const Match = require("../models/Match");
const Game = require("../models/Game");
const { seedRoundAndLink } = require("../utils/bracket");
module.exports.index = async (req, res) => {
  const tournaments = await Tournament.find()
    .populate("game")
    .sort({ createdAt: -1 })
    .lean();
  res.render("tournaments/index", { title: "Tournaments", tournaments });
};
module.exports.showCreate = async (req, res) => {
  const games = await Game.find().sort({ name: 1 }).lean();
  res.render("tournaments/create", { title: "Create Tournament", games });
};
module.exports.create = async (req, res) => {
  const { title, gameId, startsAt, maxPlayers } = req.body;
  const t = await Tournament.create({
    title,
    game: gameId,
    startsAt: new Date(startsAt),
    maxPlayers: Number(maxPlayers) || 8,
    createdBy: req.session.userId,
  });
  res.redirect("/tournaments/" + t._id);
};
module.exports.show = async (req, res) => {
  const t = await Tournament.findById(req.params.id).populate("game").lean();
  if (!t) return res.redirect("/tournaments");
  const regs = await Registration.find({ tournament: t._id })
    .populate("user")
    .lean();
  const matches = await Match.find({ tournament: t._id })
    .populate({ path: "playerA playerB winner", populate: { path: "user" } })
    .lean();
  const maxRound = matches.length
    ? Math.max(...matches.map((m) => m.round))
    : 0;
  const rounds = Array.from({ length: maxRound }, (_, i) =>
    matches
      .filter((m) => m.round === i + 1)
      .sort((a, b) => a.position - b.position)
  );
  res.render("tournaments/show", { title: t.title, t, regs, matches, rounds });
};
module.exports.register = async (req, res) => {
  const t = await Tournament.findById(req.params.id);
  if (!t) return res.redirect("/tournaments");
  const count = await Registration.countDocuments({ tournament: t._id });
  if (count >= t.maxPlayers) return res.redirect("/tournaments/" + t._id);
  try {
    await Registration.create({ tournament: t._id, user: req.session.userId });
  } catch (e) {}
  res.redirect("/tournaments/" + t._id);
};
module.exports.seed = async (req, res) => {
  const tId = req.params.id;
  const regs = await Registration.find({ tournament: tId }).sort({
    createdAt: 1,
  });
  await seedRoundAndLink(tId, regs);
  res.redirect("/tournaments/" + tId);
};
module.exports.report = async (req, res) => {
  const matchId = req.params.id;
  const { scoreA, scoreB } = req.body;
  const m = await Match.findById(matchId);
  if (!m) return res.redirect("back");
  m.scoreA = Number(scoreA);
  m.scoreB = Number(scoreB);
  if (m.playerA && m.playerB) {
    m.winner = m.scoreA > m.scoreB ? m.playerA : m.playerB;
  }
  await m.save();
  if (m.nextMatch && m.winner) {
    const next = await Match.findById(m.nextMatch);
    if (next) {
      if (!next.playerA) next.playerA = m.winner;
      else if (!next.playerB) next.playerB = m.winner;
      await next.save();
    }
  }
  res.redirect("back");
};
module.exports._findTournament = (id) => Tournament.findById(id);
