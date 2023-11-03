
const crypto = require("crypto");

const crashHash = "";
const salt =
  "d151b7b4a05e7689423d0aa44d47f931767f0b1e6e7952f4bf742386d3a1e800";

function generateHash(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex");
}

function divisible(hash, mod) {
  // We will read in 4 hex at a time, but the first chunk might be a bit smaller
  // So ABCDEFGHIJ should be chunked like  AB CDEF GHIJ
  var val = 0;

  var o = hash.length % 4;
  for (var i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
    val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
  }

  return val === 0;
}

function crashPointFromHash(serverSeed) {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(salt)
    .digest("hex");

  const hs = parseInt(100 / 4);
  if (divisible(hash, hs)) {
    return 1;
  }

  const h = parseInt(hash.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);

  return Math.floor((100 * e - h) / (e - h)) / 100.0;
}

function getPreviousGames() {
  const previousGames = [];
  let gameHash = generateHash(crashHash);

  for (let i = 0; i < 100; i++) {
    const gameResult = crashPointFromHash(gameHash);
    previousGames.push({ gameHash, gameResult });
    gameHash = generateHash(gameHash);
  }

  return previousGames;
}

function verifyCrash() {
  const gameResult = crashPointFromHash(crashHash);
  const previousHundredGames = getPreviousGames();

  return { gameResult, previousHundredGames };
}