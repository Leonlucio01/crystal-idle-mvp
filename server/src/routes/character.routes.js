const express = require("express");
const prisma = require("../utils/prisma");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

function calculatePower(character) {
  return Math.floor(
    character.atk * 5 +
    character.def * 4 +
    character.maxHp +
    character.critChance * 1000
  );
}

function calculateNextCost(baseCost, level) {
  return Math.floor(baseCost * Math.pow(level + 1, 1.3));
}

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

router.post("/upgrade-stat", authMiddleware, async (req, res) => {
  try {
    const { stat } = req.body;

    const validStats = ["ATK", "DEF", "HP", "CRIT"];

    if (!validStats.includes(stat)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stat. Use ATK, DEF, HP or CRIT",
      });
    }

    const character = await prisma.character.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        upgrades: true,
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found",
      });
    }

    const upgrade = character.upgrades.find((item) => item.stat === stat);

    if (!upgrade) {
      return res.status(404).json({
        success: false,
        message: "Upgrade not found",
      });
    }

    if (character.gold < upgrade.currentCost) {
      return res.status(400).json({
        success: false,
        message: "Not enough gold",
        requiredGold: upgrade.currentCost,
        currentGold: character.gold,
      });
    }

    const newUpgradeLevel = upgrade.level + 1;
    const newCost = calculateNextCost(upgrade.baseCost, newUpgradeLevel);

    const characterUpdate = {
      gold: character.gold - upgrade.currentCost,
    };

    if (stat === "ATK") {
      characterUpdate.atk = character.atk + 1;
    }

    if (stat === "DEF") {
      characterUpdate.def = character.def + 1;
    }

    if (stat === "HP") {
      characterUpdate.maxHp = character.maxHp + 10;
      characterUpdate.currentHp = character.currentHp + 10;
    }

    if (stat === "CRIT") {
      characterUpdate.critChance = Number((character.critChance + 0.005).toFixed(4));
    }

    const previewCharacter = {
      ...character,
      ...characterUpdate,
    };

    characterUpdate.power = calculatePower(previewCharacter);

    const result = await prisma.$transaction(async (tx) => {
      const updatedCharacter = await tx.character.update({
        where: {
          id: character.id,
        },
        data: characterUpdate,
      });

      const updatedUpgrade = await tx.statUpgrade.update({
        where: {
          id: upgrade.id,
        },
        data: {
          level: newUpgradeLevel,
          currentCost: newCost,
        },
      });

      return {
        character: updatedCharacter,
        upgrade: updatedUpgrade,
      };
    });

    res.json({
      success: true,
      message: `${stat} upgraded successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Upgrade stat error:", error);

    res.status(500).json({
      success: false,
      message: "Error upgrading stat",
    });
  }
});

module.exports = router;