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

const app = express();
connectDB();

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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Expose variables à toutes les vues (dont hasSteam)
app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  res.locals.currentUserRole = req.session.role || "user";
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
    else if (req.path.startsWith("/games")) res.locals.page = "info";
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
app.use("/games", gameRoutes);
app.use("/tournaments", tournamentRoutes);
app.use("/accounts", accountsRoutes);

// Routes spécifiques Auth Join (doivent être avant le 404)
/* PATCH_UI_EMU_V1_AUTHJOIN */
app.get("/auth/join", (req, res) =>
  res.render("auth/join", { title: "Join", page: "auth" })
);
app.get("/auth/login", (req, res) => res.redirect("/auth/join"));
app.get("/auth/register", (req, res) => res.redirect("/auth/join"));

// 404 en dernier
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`▶ GameHub Retro running at http://localhost:${PORT}`)
);
