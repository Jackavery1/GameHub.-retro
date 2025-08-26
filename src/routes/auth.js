const express = require("express");
const ctrl = require("../controllers/authController");
module.exports = function (passport) {
  const router = express.Router();
  router.get("/login", ctrl.showLogin);
  router.post("/login", ctrl.login);
  router.get("/register", ctrl.showRegister);
  router.post("/register", ctrl.register);
  router.post("/logout", ctrl.logout);
  if (passport && passport._strategies && passport._strategies.steam) {
    router.get("/steam", passport.authenticate("steam", { session: true }));
    router.get(
      "/steam/return",
      passport.authenticate("steam", {
        session: true,
        failureRedirect: "/auth/login",
      }),
      (req, res) => {
        req.session.userId = req.user._id.toString();
        req.session.role = req.user.role;
        res.redirect("/dashboard");
      }
    );
  }
  return router;
};
