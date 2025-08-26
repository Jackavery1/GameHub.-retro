// src/middleware/auth.js
function ensureAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect("/auth/login");
}

function ensureOwnerOrAdmin(getTournamentById) {
  return async (req, res, next) => {
    try {
      const t = await getTournamentById(req.params.id);
      const isOwner =
        t &&
        req.session.userId &&
        t.createdBy?.toString() === req.session.userId;
      const isAdmin = req.session.role === "admin";
      if (isOwner || isAdmin) return next();
      return res.status(403).send("Forbidden");
    } catch {
      return res.status(403).send("Forbidden");
    }
  };
}

module.exports = { ensureAuth, ensureOwnerOrAdmin };
