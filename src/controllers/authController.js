const bcrypt = require("bcrypt");
const User = require("../models/User");
module.exports.showLogin = (req, res) =>
  res.render("auth/login", { title: "Login" });
module.exports.showRegister = (req, res) =>
  res.render("auth/register", { title: "Register" });
module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.render("auth/register", {
        title: "Register",
        error: "Email déjà utilisé.",
      });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    res.redirect("/dashboard");
  } catch (e) {
    console.error(e);
    res.render("auth/register", {
      title: "Register",
      error: "Erreur d'inscription.",
    });
  }
};
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.render("auth/login", {
        title: "Login",
        error: "Identifiants invalides.",
      });
    const ok = await user.verifyPassword(password);
    if (!ok)
      return res.render("auth/login", {
        title: "Login",
        error: "Identifiants invalides.",
      });
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    res.redirect("/dashboard");
  } catch (e) {
    console.error(e);
    res.render("auth/login", { title: "Login", error: "Erreur de connexion." });
  }
};
module.exports.logout = (req, res) => {
  req.session.destroy(() => res.render("logout", { title: "Déconnexion" }));
};
