const { Strategy } = require("passport-steam");
const axios = require("axios");
const User = require("../models/User");
function setupPassport(passport) {
  const key = process.env.STEAM_API_KEY;
  const realm = process.env.STEAM_REALM;
  const returnURL = process.env.STEAM_RETURN_URL;
  if (!key || !realm || !returnURL) {
    return;
  }
  passport.serializeUser((u, d) => d(null, u.id));
  passport.deserializeUser(async (id, d) => {
    try {
      const u = await User.findById(id);
      d(null, u);
    } catch (e) {
      d(e);
    }
  });
  passport.use(
    new Strategy(
      { returnURL, realm, apiKey: key },
      async (id, profile, done) => {
        try {
          const steamId = profile.id;
          const avatarUrl =
            profile.photos?.[2]?.value || profile.photos?.[0]?.value;
          let user = await User.findOne({ steamId });
          if (!user) {
            user = await User.create({
              name: profile.displayName || "Player",
              email: steamId + "@steam.local",
              steamId,
              avatarUrl,
            });
          } else if (avatarUrl && user.avatarUrl !== avatarUrl) {
            user.avatarUrl = avatarUrl;
            await user.save();
          }
          return done(null, user);
        } catch (e) {
          return done(e);
        }
      }
    )
  );
}
async function getOwnedGames(steamId) {
  const key = process.env.STEAM_API_KEY;
  if (!key) return [];
  try {
    const url =
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";
    const { data } = await axios.get(url, {
      params: { key, steamid: steamId, include_appinfo: 1, format: "json" },
    });
    return data?.response?.games || [];
  } catch {
    return [];
  }
}
module.exports = { setupPassport, getOwnedGames };
