const express = require("express");
const prisma = require("../utils/prisma");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const character = await prisma.character.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        upgrades: true,
        currentZone: {
          include: {
            enemies: true,
          },
        },
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found",
      });
    }

    res.json({
      success: true,
      data: character,
    });
  } catch (error) {
    console.error("Character me error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching character",
    });
  }
});

module.exports = router;