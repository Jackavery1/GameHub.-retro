const Match = require("../models/Match");
async function seedRoundAndLink(tournamentId, registrations) {
  await Match.deleteMany({ tournament: tournamentId });
  const N = registrations.length;
  const pow2 = 1 << Math.ceil(Math.log2(Math.max(1, N)));
  const seeds = registrations.map((r, i) => ({ reg: r, seed: i + 1 }));
  const r1 = [];
  for (let i = 0; i < pow2 / 2; i++) {
    const sA = i + 1;
    const sB = pow2 - i;
    const playerA = seeds.find((s) => s.seed === sA)?.reg || null;
    const playerB = seeds.find((s) => s.seed === sB)?.reg || null;
    r1.push({ round: 1, position: i + 1, playerA, playerB });
  }
  const createdR1 = await Match.insertMany(
    r1.map((m) => ({
      tournament: tournamentId,
      round: 1,
      position: m.position,
      playerA: m.playerA?._id,
      playerB: m.playerB?._id,
    }))
  );
  let prevRound = createdR1;
  let round = 2;
  let size = pow2 / 4;
  while (size >= 1) {
    const created = await Match.insertMany(
      Array.from({ length: size }).map((_, i) => ({
        tournament: tournamentId,
        round,
        position: i + 1,
      }))
    );
    for (let i = 0; i < prevRound.length; i += 2) {
      const next = created[i / 2];
      prevRound[i].nextMatch = next._id;
      prevRound[i + 1].nextMatch = next._id;
    }
    await Promise.all(prevRound.map((m) => m.save()));
    prevRound = created;
    round += 1;
    size = size / 2;
  }
  const firstRound = await Match.find({ tournament: tournamentId, round: 1 });
  for (const m of firstRound) {
    if (m.playerA && !m.playerB) {
      m.winner = m.playerA;
      await m.save();
      if (m.nextMatch) {
        const nx = await Match.findById(m.nextMatch);
        if (nx) {
          if (!nx.playerA) nx.playerA = m.winner;
          else if (!nx.playerB) nx.playerB = m.winner;
          await nx.save();
        }
      }
    } else if (m.playerB && !m.playerA) {
      m.winner = m.playerB;
      await m.save();
      if (m.nextMatch) {
        const nx = await Match.findById(m.nextMatch);
        if (nx) {
          if (!nx.playerA) nx.playerA = m.winner;
          else if (!nx.playerB) nx.playerB = m.winner;
          await nx.save();
        }
      }
    }
  }
}
module.exports = { seedRoundAndLink };
