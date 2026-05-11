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

module.exports = router;