const express = require("express");
const prisma = require("../utils/prisma");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

function getXpRequired(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function calculatePower(character) {
  return Math.floor(
    character.atk * 5 +
    character.def * 4 +
    character.maxHp +
    character.critChance * 1000
  );
}

function applyXp(character, xpEarned) {
  let newLevel = character.level;
  let newXp = character.xp + xpEarned;

  let xpRequired = getXpRequired(newLevel);

  while (newXp >= xpRequired) {
    newXp -= xpRequired;
    newLevel += 1;
    xpRequired = getXpRequired(newLevel);
  }

  const levelsGained = newLevel - character.level;

  return {
    level: newLevel,
    xp: newXp,
    levelsGained,
  };
}

router.post("/claim-offline", authMiddleware, async (req, res) => {
  try {
    const character = await prisma.character.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
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

    if (!character.lastLogoutAt) {
      const updatedCharacter = await prisma.character.update({
        where: {
          id: character.id,
        },
        data: {
          lastLogoutAt: new Date(),
        },
      });

      return res.json({
        success: true,
        message: "Offline timer started",
        data: {
          secondsOffline: 0,
          kills: 0,
          goldEarned: 0,
          xpEarned: 0,
          levelsGained: 0,
          character: updatedCharacter,
        },
      });
    }

    const now = new Date();
    const offlineSecondsRaw = Math.floor(
      (now.getTime() - character.lastLogoutAt.getTime()) / 1000
    );

    const secondsOffline = Math.max(
      0,
      Math.min(offlineSecondsRaw, MAX_OFFLINE_SECONDS)
    );

    const normalEnemies = character.currentZone.enemies.filter(
      (enemy) => !enemy.isBoss
    );

    if (normalEnemies.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No farmable enemies in current zone",
      });
    }

    const enemy = normalEnemies[0];

    const playerDps = Math.max(1, character.atk * character.attackSpeed);
    const secondsPerKill = Math.max(1, enemy.maxHp / playerDps);
    const kills = Math.floor(secondsOffline / secondsPerKill);

    const goldEarned = kills * enemy.goldReward;
    const xpEarned = kills * enemy.xpReward;

    const xpResult = applyXp(character, xpEarned);

    const hpBonusFromLevel = xpResult.levelsGained * 10;
    const atkBonusFromLevel = xpResult.levelsGained * 2;
    const defBonusFromLevel = xpResult.levelsGained * 1;

    const updatedStatsPreview = {
      ...character,
      level: xpResult.level,
      xp: xpResult.xp,
      gold: character.gold + goldEarned,
      maxHp: character.maxHp + hpBonusFromLevel,
      currentHp: character.currentHp + hpBonusFromLevel,
      atk: character.atk + atkBonusFromLevel,
      def: character.def + defBonusFromLevel,
    };

    const newPower = calculatePower(updatedStatsPreview);

    const result = await prisma.$transaction(async (tx) => {
      const updatedCharacter = await tx.character.update({
        where: {
          id: character.id,
        },
        data: {
          level: xpResult.level,
          xp: xpResult.xp,
          gold: character.gold + goldEarned,
          maxHp: character.maxHp + hpBonusFromLevel,
          currentHp: character.currentHp + hpBonusFromLevel,
          atk: character.atk + atkBonusFromLevel,
          def: character.def + defBonusFromLevel,
          power: newPower,
          lastLogoutAt: now,
        },
      });

      const offlineReward = await tx.offlineReward.create({
        data: {
          characterId: character.id,
          secondsOffline,
          kills,
          goldEarned,
          xpEarned,
        },
      });

      return {
        character: updatedCharacter,
        offlineReward,
      };
    });

    res.json({
      success: true,
      message: "Offline rewards claimed",
      data: {
        enemy: {
          id: enemy.id,
          name: enemy.name,
        },
        secondsOffline,
        kills,
        goldEarned,
        xpEarned,
        levelsGained: xpResult.levelsGained,
        character: result.character,
        offlineReward: result.offlineReward,
      },
    });
  } catch (error) {
    console.error("Claim offline error:", error);

    res.status(500).json({
      success: false,
      message: "Error claiming offline rewards",
    });
  }
});

module.exports = router;