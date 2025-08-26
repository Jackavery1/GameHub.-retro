require("dotenv").config();
const { connectDB } = require("../src/config/db");
const User = require("../src/models/User");
const Game = require("../src/models/Game");
const Tournament = require("../src/models/Tournament");
const bcrypt = require("bcrypt");
(async () => {
  await connectDB();
  console.log("Seeding…");
  await Promise.all([
    User.deleteMany({}),
    Game.deleteMany({}),
    Tournament.deleteMany({}),
  ]);
  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await User.create({
    name: "Admin",
    email: "admin@example.com",
    passwordHash: adminHash,
    role: "admin",
  });
  const games = await Game.insertMany([
    {
      name: "Super Pixel Bros",
      slug: "super-pixel-bros",
      genres: ["Platformer"],
      cover:
        "https://upload.wikimedia.org/wikipedia/commons/3/31/Pixel-heart_2.png",
    },
    { name: "Neon Racer 2049", slug: "neon-racer-2049", genres: ["Racing"] },
    { name: "Dungeon Quest", slug: "dungeon-quest", genres: ["RPG"] },
  ]);
  await Tournament.create({
    title: "Open — Super Pixel Bros",
    game: games[0]._id,
    startsAt: new Date(Date.now() + 864e5),
    maxPlayers: 8,
    createdBy: admin._id,
  });
  console.log("Done. Login: admin@example.com / admin123");
  process.exit(0);
})();
