const express = require("express");
const prisma = require("../utils/prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { calculatePower } = require("../game/progression");

const router = express.Router();

function calculateNextCost(baseCost, level) {
  return Math.floor(baseCost * Math.pow(level + 1, 1.3));
}

async function ensureZoneProgress(characterId, maxZoneOrderUnlocked = 1) {
  const zones = await prisma.zone.findMany({ orderBy: { orderIndex: "asc" } });

  for (const zone of zones) {
    await prisma.characterZoneProgress.upsert({
      where: {
        characterId_zoneId: {
          characterId,
          zoneId: zone.id,
        },
      },
      update: {
        unlocked: zone.orderIndex <= maxZoneOrderUnlocked,
      },
      create: {
        characterId,
        zoneId: zone.id,
        unlocked: zone.orderIndex <= maxZoneOrderUnlocked,
      },
    });
  }
}

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const character = await prisma.character.findUnique({
      where: { userId: req.user.id },
      include: {
        upgrades: true,
        currentZone: {
          include: {
            enemies: { orderBy: { sortOrder: "asc" } },
          },
        },
        inventory: { include: { itemDefinition: true } },
        zoneProgress: { include: { zone: true } },
      },
    });

    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    await ensureZoneProgress(character.id, character.maxZoneOrderUnlocked);

    const refreshed = await prisma.character.findUnique({
      where: { id: character.id },
      include: {
        upgrades: true,
        currentZone: {
          include: {
            enemies: { orderBy: { sortOrder: "asc" } },
          },
        },
        inventory: { include: { itemDefinition: true } },
        zoneProgress: { include: { zone: true } },
      },
    });

    res.json({ success: true, data: refreshed });
  } catch (error) {
    console.error("Character me error:", error);
    res.status(500).json({ success: false, message: "Error fetching character" });
  }
});

router.post("/upgrade-stat", authMiddleware, async (req, res) => {
  try {
    const { stat } = req.body;
    const validStats = ["ATK", "DEF", "HP", "CRIT"];

    if (!validStats.includes(stat)) {
      return res.status(400).json({ success: false, message: "Invalid stat. Use ATK, DEF, HP or CRIT" });
    }

    const character = await prisma.character.findUnique({
      where: { userId: req.user.id },
      include: { upgrades: true, inventory: { include: { itemDefinition: true } } },
    });

    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    const upgrade = character.upgrades.find((item) => item.stat === stat);
    if (!upgrade) {
      return res.status(404).json({ success: false, message: "Upgrade not found" });
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

    const characterUpdate = { gold: character.gold - upgrade.currentCost };

    if (stat === "ATK") characterUpdate.atk = character.atk + 1;
    if (stat === "DEF") characterUpdate.def = character.def + 1;
    if (stat === "HP") {
      characterUpdate.maxHp = character.maxHp + 10;
      characterUpdate.currentHp = character.currentHp + 10;
    }
    if (stat === "CRIT") characterUpdate.critChance = Number((character.critChance + 0.005).toFixed(4));

    const equipmentStats = character.inventory
      .filter((item) => item.equippedSlot)
      .reduce(
        (acc, item) => {
          acc.atk += item.atk || 0;
          acc.def += item.def || 0;
          acc.maxHp += item.maxHp || 0;
          acc.critChance += item.critChance || 0;
          return acc;
        },
        { atk: 0, def: 0, maxHp: 0, critChance: 0 }
      );

    const previewCharacter = { ...character, ...characterUpdate };
    characterUpdate.power = calculatePower({
      atk: previewCharacter.atk + equipmentStats.atk,
      def: previewCharacter.def + equipmentStats.def,
      maxHp: previewCharacter.maxHp + equipmentStats.maxHp,
      critChance: previewCharacter.critChance + equipmentStats.critChance,
    });

    const result = await prisma.$transaction(async (tx) => {
      const updatedCharacter = await tx.character.update({
        where: { id: character.id },
        data: characterUpdate,
        include: {
          upgrades: true,
          currentZone: { include: { enemies: { orderBy: { sortOrder: "asc" } } } },
          inventory: { include: { itemDefinition: true } },
          zoneProgress: { include: { zone: true } },
        },
      });

      const updatedUpgrade = await tx.statUpgrade.update({
        where: { id: upgrade.id },
        data: { level: newUpgradeLevel, currentCost: newCost },
      });

      return { character: updatedCharacter, upgrade: updatedUpgrade };
    });

    res.json({ success: true, message: `${stat} upgraded successfully`, data: result });
  } catch (error) {
    console.error("Upgrade stat error:", error);
    res.status(500).json({ success: false, message: "Error upgrading stat" });
  }
});

router.post("/change-zone", authMiddleware, async (req, res) => {
  try {
    const { zoneId } = req.body;

    if (!zoneId) {
      return res.status(400).json({ success: false, message: "zoneId is required" });
    }

    const character = await prisma.character.findUnique({
      where: { userId: req.user.id },
      include: { zoneProgress: true },
    });

    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: { enemies: { orderBy: { sortOrder: "asc" } } },
    });

    if (!zone) {
      return res.status(404).json({ success: false, message: "Zone not found" });
    }

    const progress = await prisma.characterZoneProgress.findUnique({
      where: {
        characterId_zoneId: {
          characterId: character.id,
          zoneId: zone.id,
        },
      },
    });

    const unlocked = zone.orderIndex <= character.maxZoneOrderUnlocked || progress?.unlocked;

    if (!unlocked) {
      return res.status(403).json({
        success: false,
        message: `Defeat the previous zone boss before entering ${zone.name}`,
        requiredPower: zone.requiredPower,
        requiredLevel: zone.requiredLevel,
      });
    }

    if (character.level < zone.requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `You need level ${zone.requiredLevel} to enter ${zone.name}`,
        requiredLevel: zone.requiredLevel,
        currentLevel: character.level,
      });
    }

    if (character.power < zone.requiredPower) {
      return res.status(403).json({
        success: false,
        message: `You need ${zone.requiredPower} power to enter ${zone.name}`,
        requiredPower: zone.requiredPower,
        currentPower: character.power,
      });
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: { currentZoneId: zone.id },
      include: {
        currentZone: { include: { enemies: { orderBy: { sortOrder: "asc" } } } },
        upgrades: true,
        inventory: { include: { itemDefinition: true } },
        zoneProgress: { include: { zone: true } },
      },
    });

    res.json({ success: true, message: `Moved to ${zone.name}`, data: updatedCharacter });
  } catch (error) {
    console.error("Change zone error:", error);
    res.status(500).json({ success: false, message: "Error changing zone" });
  }
});

module.exports = router;
