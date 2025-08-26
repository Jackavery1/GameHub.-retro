const User = require("../models/User");
const crypto = require("crypto");

const KNOWN = ["steam", "gog", "epic", "itchio", "amazon"];

// Stockage temporaire des tokens d'accès (en production, utiliser Redis)
const accessTokens = new Map();

// Générer un token d'accès temporaire
module.exports.generateAccess = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).send("Non autorisé");

  // Générer un token unique
  const token = crypto.randomBytes(32).toString("hex");

  // Stocker le token avec l'ID utilisateur et une expiration (5 minutes)
  accessTokens.set(token, {
    userId: userId,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  // Rediriger vers /accounts avec le token
  res.redirect(`/accounts?token=${token}`);
};

module.exports.index = async (req, res) => {
  const userId = req.session.userId;
  const token = req.query.token;

  // Vérifier si un token valide est fourni
  if (!token || !accessTokens.has(token)) {
    return res.status(403).render("403", {
      title: "Accès refusé",
      message: "Cette page n'est accessible que depuis le dashboard.",
    });
  }

  const tokenData = accessTokens.get(token);

  // Vérifier l'expiration
  if (Date.now() > tokenData.expires) {
    accessTokens.delete(token);
    return res.status(403).render("403", {
      title: "Token expiré",
      message: "Le lien d'accès a expiré. Veuillez retourner au dashboard.",
    });
  }

  // Vérifier que le token correspond à l'utilisateur connecté
  if (tokenData.userId !== userId) {
    return res.status(403).render("403", {
      title: "Accès refusé",
      message: "Ce lien ne vous appartient pas.",
    });
  }

  // Supprimer le token après utilisation (usage unique)
  accessTokens.delete(token);

  const user = await User.findById(userId).lean();
  const map = Object.fromEntries(KNOWN.map((k) => [k, null]));

  // Gestion spéciale pour Steam (OAuth)
  if (user.steamId) {
    map.steam = {
      provider: "steam",
      handle: user.name || "Steam User",
      linkedAt: user.createdAt,
      isOAuth: true,
    };
  }

  // Gestion des autres comptes liés manuellement
  (user.linkedAccounts || []).forEach((a) => {
    if (KNOWN.includes(a.provider) && a.provider !== "steam") {
      map[a.provider] = a;
    }
  });

  res.render("accounts/index", {
    title: "Comptes liés",
    page: "accounts",
    accounts: map,
    user,
    hasSteam: Boolean(
      process.env.STEAM_API_KEY &&
        process.env.STEAM_REALM &&
        process.env.STEAM_RETURN_URL
    ),
  });
};

module.exports.link = async (req, res) => {
  const { provider, handle } = req.body;
  if (!KNOWN.includes(provider))
    return res.status(400).send("Provider inconnu");
  const user = await User.findById(req.session.userId);
  const exists = user.linkedAccounts.find((a) => a.provider === provider);
  if (exists) {
    exists.handle = handle || exists.handle;
    exists.linkedAt = new Date();
  } else {
    user.linkedAccounts.push({ provider, handle: handle || "" });
  }
  await user.save();
  res.redirect("/accounts");
};

module.exports.unlink = async (req, res) => {
  const { provider } = req.body;
  if (!KNOWN.includes(provider))
    return res.status(400).send("Provider inconnu");
  const user = await User.findById(req.session.userId);

  if (provider === "steam") {
    // Déconnexion Steam : supprimer steamId et avatarUrl
    user.steamId = undefined;
    user.avatarUrl = undefined;
  } else {
    // Déconnexion des autres comptes
    user.linkedAccounts = (user.linkedAccounts || []).filter(
      (a) => a.provider !== provider
    );
  }

  await user.save();
  res.redirect("/accounts");
};
