const express = require("express");
const cors = require("cors");
require("dotenv").config();

const zoneRoutes = require("./routes/zone.routes");
const authRoutes = require("./routes/auth.routes");
const characterRoutes = require("./routes/character.routes");
const combatRoutes = require("./routes/combat.routes");
const idleRoutes = require("./routes/idle.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Crystal Idle MVP API is running",
    version: "0.1.0",
  });
});

app.use("/zones", zoneRoutes);
app.use("/auth", authRoutes);
app.use("/character", characterRoutes);
app.use("/combat", combatRoutes);
app.use("/idle", idleRoutes);
app.use("/leaderboard", leaderboardRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});