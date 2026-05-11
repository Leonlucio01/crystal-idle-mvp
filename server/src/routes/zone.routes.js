const express = require("express");
const prisma = require("../utils/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const zones = await prisma.zone.findMany({
      orderBy: {
        requiredLevel: "asc",
      },
      include: {
        enemies: true,
      },
    });

    res.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    console.error("Error fetching zones:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching zones",
    });
  }
});

module.exports = router;