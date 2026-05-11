const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const router = express.Router();

async function getOptionalUser(req) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return prisma.user.findUnique({ where: { id: decoded.userId }, include: { character: true } });
  } catch (_) {
    return null;
  }
}

router.get("/", async (req, res) => {
  try {
    const user = await getOptionalUser(req);
    const character = user?.character || null;

    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      include: {
        enemies: { orderBy: { sortOrder: "asc" } },
        ...(character ? { progress: { where: { characterId: character.id } } } : {}),
      },
    });

    const data = zones.map((zone) => {
      const progress = Array.isArray(zone.progress) ? zone.progress[0] : null;
      const unlocked = character
        ? Boolean(progress?.unlocked || zone.orderIndex <= character.maxZoneOrderUnlocked)
        : zone.orderIndex === 1;

      return {
        ...zone,
        progress: progress || null,
        unlocked,
        locked: !unlocked,
        isCurrent: character ? character.currentZoneId === zone.id : false,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching zones:", error);
    res.status(500).json({ success: false, message: "Error fetching zones" });
  }
});

module.exports = router;
