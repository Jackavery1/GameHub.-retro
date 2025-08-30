const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware pour vérifier que l'utilisateur est connecté et admin
const ensureAdmin = (req, res, next) => {
  if (req.session.userId && req.session.role === "admin") {
    return next();
  }
  res.redirect("/auth/join");
};

// Page d'administration principale
router.get("/", ensureAdmin, (req, res) => {
  res.render("admin/dashboard", {
    user: { username: req.session.username || "Admin", role: req.session.role },
    title: "Administration - GameHub Retro",
  });
});

// Page des paramètres MCP
router.get("/mcp-settings", ensureAdmin, (req, res) => {
  res.render("admin/mcp-settings", {
    user: { username: req.session.username || "Admin", role: req.session.role },
    title: "Paramètres MCP - GameHub Retro Admin",
  });
});

// Page de gestion des utilisateurs
router.get("/users", ensureAdmin, (req, res) => {
  res.render("admin/dashboard", {
    user: { username: req.session.username || "Admin", role: req.session.role },
    title: "Gestion des Utilisateurs - GameHub Retro Admin",
  });
});

// Page de gestion des jeux
router.get("/games", ensureAdmin, (req, res) => {
  res.render("admin/dashboard", {
    user: { username: req.session.username || "Admin", role: req.session.role },
    title: "Gestion des Jeux - GameHub Retro Admin",
  });
});

// Page de gestion des tournois
router.get("/tournaments", ensureAdmin, (req, res) => {
  res.render("admin/dashboard", {
    user: { username: req.session.username || "Admin", role: req.session.role },
    title: "Gestion des Tournois - GameHub Retro Admin",
  });
});

// Page des statistiques
router.get("/stats", ensureAdmin, (req, res) => {
  res.render("admin/dashboard", {
    user: { username: req.session.username || "Admin", role: req.session.role },
    title: "Statistiques - GameHub Retro Admin",
  });
});

// Page des logs système
router.get("/logs", ensureAdmin, (req, res) => {
  res.render("admin/dashboard", {
    user: { username: req.session.username || "Admin", role: req.session.role },
    title: "Logs Système - GameHub Retro Admin",
  });
});

// Page de configuration générale
router.get("/config", ensureAdmin, (req, res) => {
  res.render("admin/dashboard", {
    user: { username: req.session.username || "Admin", role: req.session.role },
    title: "Configuration - GameHub Retro Admin",
  });
});

module.exports = router;
