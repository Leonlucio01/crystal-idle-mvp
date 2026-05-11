const express = require("express");
const prisma = require("../utils/prisma");

const router = express.Router();

router.get("/power", async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      orderBy: [{ power: "desc" }, { level: "desc" }, { xp: "desc" }],
      take: 50,
      select: {
        id: true,
        name: true,
        class: true,
        level: true,
        xp: true,
        gold: true,
        atk: true,
        def: true,
        maxHp: true,
        critChance: true,
        power: true,
        totalKills: true,
        bossKills: true,
        maxZoneOrderUnlocked: true,
        currentZone: { select: { id: true, name: true } },
        updatedAt: true,
      },
    });

    const leaderboard = characters.map((character, index) => ({ rank: index + 1, ...character }));
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error("Leaderboard power error:", error);
    res.status(500).json({ success: false, message: "Error fetching power leaderboard" });
  }
});

module.exports = router;
