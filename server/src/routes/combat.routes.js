const express = require("express");
const prisma = require("../utils/prisma");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

function calculateDamage(character, enemy) {
  let damage = Math.max(1, character.atk - enemy.def);
  const isCrit = Math.random() < character.critChance;

  if (isCrit) {
    damage = Math.floor(damage * character.critDamage);
  }

  return {
    damage,
    isCrit,
  };
}

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

function getRecommendedPower(enemy) {
  return Math.max(100, Math.floor(enemy.maxHp * 0.45 + enemy.atk * 12 + enemy.def * 18));
}

function rollDrop(enemy, options = {}) {
  const isBoss = Boolean(options.isBoss || enemy.isBoss);
  const roll = Math.random();

  if (isBoss) {
    if (roll < 0.08) return { name: `Legendary ${enemy.name} Relic`, rarity: "legendary", quantity: 1 };
    if (roll < 0.28) return { name: `Epic ${enemy.name} Chest`, rarity: "epic", quantity: 1 };
    return { name: `${enemy.name} Boss Chest`, rarity: "rare", quantity: 1 };
  }

  if (roll < 0.015) return { name: `Epic Crystal Shard`, rarity: "epic", quantity: 1 };
  if (roll < 0.07) return { name: `${enemy.name} Rare Drop`, rarity: "rare", quantity: 1 };
  if (roll < 0.24) return { name: "Crystal Fragment", rarity: "common", quantity: 1 };
  return null;
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

router.post("/attack", authMiddleware, async (req, res) => {
  try {
    const { enemyTypeId } = req.body;

    if (!enemyTypeId) {
      return res.status(400).json({
        success: false,
        message: "enemyTypeId is required",
      });
    }

    const character = await prisma.character.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        currentZone: true,
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found",
      });
    }

    const enemy = await prisma.enemyType.findUnique({
      where: {
        id: enemyTypeId,
      },
    });

    if (!enemy) {
      return res.status(404).json({
        success: false,
        message: "Enemy not found",
      });
    }

    if (enemy.zoneId !== character.currentZoneId) {
      return res.status(400).json({
        success: false,
        message: "Enemy is not in your current zone",
      });
    }

    const { damage, isCrit } = calculateDamage(character, enemy);

    const enemyKilled = damage >= enemy.maxHp;

    let goldEarned = 0;
    let xpEarned = 0;

    if (enemyKilled) {
      goldEarned = enemy.goldReward;
      xpEarned = enemy.xpReward;
    }

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
        },
      });

      const combatLog = await tx.combatLog.create({
        data: {
          characterId: character.id,
          enemyTypeId: enemy.id,
          damage,
          isCrit,
          enemyKilled,
          goldEarned,
          xpEarned,
        },
      });

      return {
        character: updatedCharacter,
        combatLog,
      };
    });

    res.json({
      success: true,
      data: {
        enemy: {
          id: enemy.id,
          name: enemy.name,
          maxHp: enemy.maxHp,
          isBoss: enemy.isBoss,
        },
        damage,
        isCrit,
        enemyKilled,
        goldEarned,
        xpEarned,
        drop,
        levelsGained: xpResult.levelsGained,
        character: result.character,
      },
    });
  } catch (error) {
    console.error("Combat attack error:", error);

    res.status(500).json({
      success: false,
      message: "Error attacking enemy",
    });
  }
});

router.post("/kill", authMiddleware, async (req, res) => {
  try {
    const { enemyTypeId } = req.body;

    if (!enemyTypeId) {
      return res.status(400).json({
        success: false,
        message: "enemyTypeId is required",
      });
    }

    const character = await prisma.character.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        currentZone: true,
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found",
      });
    }

    const enemy = await prisma.enemyType.findUnique({
      where: {
        id: enemyTypeId,
      },
    });

    if (!enemy) {
      return res.status(404).json({
        success: false,
        message: "Enemy not found",
      });
    }

    if (enemy.zoneId !== character.currentZoneId) {
      return res.status(400).json({
        success: false,
        message: "Enemy is not in your current zone",
      });
    }

    if (enemy.isBoss) {
      return res.status(400).json({
        success: false,
        message: "Bosses must be defeated with /combat/challenge-boss",
      });
    }

    const drop = rollDrop(enemy);
    const goldEarned = enemy.goldReward;
    const xpEarned = enemy.xpReward;

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
        },
      });

      const combatLog = await tx.combatLog.create({
        data: {
          characterId: character.id,
          enemyTypeId: enemy.id,
          damage: enemy.maxHp,
          isCrit: false,
          enemyKilled: true,
          goldEarned,
          xpEarned,
        },
      });

      return {
        character: updatedCharacter,
        combatLog,
      };
    });

    res.json({
      success: true,
      message: `${enemy.name} killed successfully`,
      data: {
        enemy: {
          id: enemy.id,
          name: enemy.name,
          maxHp: enemy.maxHp,
          isBoss: enemy.isBoss,
        },
        goldEarned,
        xpEarned,
        drop,
        levelsGained: xpResult.levelsGained,
        character: result.character,
      },
    });
  } catch (error) {
    console.error("Combat kill error:", error);

    res.status(500).json({
      success: false,
      message: "Error killing enemy",
    });
  }
});


router.post("/challenge-boss", authMiddleware, async (req, res) => {
  try {
    const { enemyTypeId } = req.body;

    if (!enemyTypeId) {
      return res.status(400).json({
        success: false,
        message: "enemyTypeId is required",
      });
    }

    const character = await prisma.character.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        currentZone: true,
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found",
      });
    }

    const enemy = await prisma.enemyType.findUnique({
      where: {
        id: enemyTypeId,
      },
      include: {
        zone: true,
      },
    });

    if (!enemy) {
      return res.status(404).json({
        success: false,
        message: "Enemy not found",
      });
    }

    if (!enemy.isBoss) {
      return res.status(400).json({
        success: false,
        message: "This enemy is not a boss",
      });
    }

    if (enemy.zoneId !== character.currentZoneId) {
      return res.status(400).json({
        success: false,
        message: "Boss is not in your current zone",
      });
    }

    const recommendedPower = getRecommendedPower(enemy);

    if (character.power < recommendedPower) {
      return res.status(403).json({
        success: false,
        message: `Recommended power for ${enemy.name} is ${recommendedPower}`,
        recommendedPower,
        currentPower: character.power,
      });
    }

    const previousBossKills = await prisma.combatLog.count({
      where: {
        characterId: character.id,
        enemyTypeId: enemy.id,
        enemyKilled: true,
      },
    });

    const firstKill = previousBossKills === 0;
    const goldEarned = enemy.goldReward * 3;
    const xpEarned = enemy.xpReward * 2;
    const diamondsEarned = firstKill ? 5 : 1;
    const drop = rollDrop(enemy, { isBoss: true });

    const xpResult = applyXp(character, xpEarned);

    const hpBonusFromLevel = xpResult.levelsGained * 10;
    const atkBonusFromLevel = xpResult.levelsGained * 2;
    const defBonusFromLevel = xpResult.levelsGained * 1;

    const updatedStatsPreview = {
      ...character,
      level: xpResult.level,
      xp: xpResult.xp,
      gold: character.gold + goldEarned,
      diamonds: character.diamonds + diamondsEarned,
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
          diamonds: character.diamonds + diamondsEarned,
          maxHp: character.maxHp + hpBonusFromLevel,
          currentHp: character.currentHp + hpBonusFromLevel,
          atk: character.atk + atkBonusFromLevel,
          def: character.def + defBonusFromLevel,
          power: newPower,
        },
      });

      const combatLog = await tx.combatLog.create({
        data: {
          characterId: character.id,
          enemyTypeId: enemy.id,
          damage: enemy.maxHp,
          isCrit: false,
          enemyKilled: true,
          goldEarned,
          xpEarned,
        },
      });

      return {
        character: updatedCharacter,
        combatLog,
      };
    });

    const zones = await prisma.zone.findMany({
      orderBy: {
        requiredLevel: "asc",
      },
      select: {
        id: true,
        name: true,
        requiredLevel: true,
      },
    });

    const currentZoneIndex = zones.findIndex((zone) => zone.id === enemy.zoneId);
    const nextZone = currentZoneIndex >= 0 ? zones[currentZoneIndex + 1] : null;

    res.json({
      success: true,
      message: `${enemy.name} defeated successfully`,
      data: {
        enemy: {
          id: enemy.id,
          name: enemy.name,
          maxHp: enemy.maxHp,
          isBoss: enemy.isBoss,
        },
        recommendedPower,
        firstKill,
        goldEarned,
        xpEarned,
        diamondsEarned,
        drop,
        nextZone,
        levelsGained: xpResult.levelsGained,
        character: result.character,
      },
    });
  } catch (error) {
    console.error("Challenge boss error:", error);

    res.status(500).json({
      success: false,
      message: "Error challenging boss",
    });
  }
});

module.exports = router;