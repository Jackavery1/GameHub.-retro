const path = require("path");
const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
require("dotenv").config();

const { connectDB } = require("./config/db");
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/games");
const tournamentRoutes = require("./routes/tournaments");
require("./services/steam").setupPassport(passport);
const accountsRoutes = require("./routes/accounts");
const adminRoutes = require("./routes/admin");
const mcpRoutes = require("./routes/mcp");

const app = express();

// Timestamp de démarrage du serveur
const SERVER_START_TIME = Date.now();

// Connexion à la base de données et démarrage du serveur
async function startServer() {
  try {
    await connectDB();
    console.log("✅ Base de données connectée");

    // Démarrer le serveur
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () =>
      console.log(`▶ GameHub Retro running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error(
      "❌ Erreur de connexion à la base de données:",
      error.message
    );
    console.log("🔄 Mode test activé - base de données non disponible");

    // Démarrer en mode test sans base de données
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () =>
      console.log(
        `▶ GameHub Retro running in test mode at http://localhost:${PORT}`
      )
    );
  }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(expressLayouts);
app.set("layout", "layout");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Configuration des sessions (sans store MongoDB pour l'instant)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "gamehub-retro-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    // store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // Désactivé temporairement
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de redirection vers la page d'accueil après redémarrage
app.use((req, res, next) => {
  // Vérifier si c'est la première visite depuis le démarrage du serveur
  const lastVisit = req.session.lastVisit;
  const currentTime = Date.now();

  // Si pas de dernière visite OU si la dernière visite était avant le redémarrage du serveur
  if (!lastVisit || lastVisit < SERVER_START_TIME) {
    // Mettre à jour la dernière visite
    req.session.lastVisit = currentTime;

    // Rediriger vers la page d'accueil seulement si ce n'est pas déjà la page d'accueil
    if (req.path !== "/" && req.path !== "/home") {
      console.log(`🏠 Redirection vers la page d'accueil depuis: ${req.path}`);
      return res.redirect("/");
    }
  }

  next();
});

// Expose variables à toutes les vues (dont hasSteam)
app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  res.locals.currentUserRole = req.session.role || "user";
  res.locals.user = {
    id: req.session.userId || null,
    role: req.session.role || "user",
    username: req.session.username || null,
  };
  res.locals.theme = req.cookies?.theme || "neon";
  res.locals.hasSteam = Boolean(
    process.env.STEAM_API_KEY &&
      process.env.STEAM_REALM &&
      process.env.STEAM_RETURN_URL &&
      passport._strategies &&
      passport._strategies.steam
  );
  next();
});

// Sécurise la variable "page" pour toutes les vues (évite les 500 si oubliée)
app.use((req, res, next) => {
  if (typeof res.locals.page === "undefined") res.locals.page = "";
  next();
});

/* PATCH_UI_EMU_V1_PAGE */
app.use((req, res, next) => {
  if (!res.locals) res.locals = {};
  if (!res.locals.page || typeof res.locals.page === "undefined") {
    if (req.path === "/") res.locals.page = "home";
    else if (req.path.startsWith("/dashboard")) res.locals.page = "dashboard";
    else if (req.path.startsWith("/info")) res.locals.page = "info";
    else if (req.path.startsWith("/tournaments"))
      res.locals.page = "tournaments";
    else if (req.path.startsWith("/arcade")) res.locals.page = "arcade";
    else if (req.path.startsWith("/auth")) res.locals.page = "auth";
    else res.locals.page = "";
  }
  next();
});

app.use("/", indexRoutes);
app.use("/auth", authRoutes(passport));
app.use("/info", gameRoutes);
app.use("/tournaments", tournamentRoutes);
app.use("/accounts", accountsRoutes);
app.use("/admin", adminRoutes);
app.use("/api/mcp", mcpRoutes);
app.use("/api/analytics", require("./routes/analytics"));

// Routes spécifiques Auth Join (doivent être avant le 404)
/* PATCH_UI_EMU_V1_AUTHJOIN */
app.get("/auth/join", (req, res) =>
  res.render("auth/join", { title: "Join", page: "auth" })
);
app.get("/auth/login", (req, res) => res.redirect("/auth/join"));
app.get("/auth/register", (req, res) => res.redirect("/auth/join"));

// 404 en dernier

app.use("/api/ai", require("./routes/ai"));

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

// Démarrer le serveur
startServer();
