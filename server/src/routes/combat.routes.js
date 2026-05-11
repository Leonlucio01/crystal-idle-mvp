const express = require("express");
const prisma = require("../utils/prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { buildCharacterUpdateAfterRewards, getEffectiveStats } = require("../game/progression");
const { rollDrops, grantDrops, summarizeDrops } = require("../game/drops");

const router = express.Router();

function calculateDamage(character, enemy) {
  let damage = Math.max(1, character.atk - enemy.def);
  const isCrit = Math.random() < character.critChance;

  if (isCrit) {
    damage = Math.floor(damage * character.critDamage);
  }

  return { damage, isCrit };
}

function applyRewardBonuses(character, enemy) {
  const effective = getEffectiveStats(character);
  const goldEarned = Math.floor(enemy.goldReward * (1 + (effective.goldBonus || 0)));
  const xpEarned = Math.floor(enemy.xpReward * (1 + (effective.xpBonus || 0)));
  return { effective, goldEarned, xpEarned };
}

async function getCharacter(userId) {
  return prisma.character.findUnique({
    where: { userId },
    include: {
      currentZone: true,
      inventory: { include: { itemDefinition: true } },
    },
  });
}

async function getEnemy(enemyTypeId) {
  return prisma.enemyType.findUnique({
    where: { id: enemyTypeId },
    include: {
      zone: true,
      drops: { include: { itemDefinition: true } },
    },
  });
}

function validateEnemyInCurrentZone(res, character, enemy) {
  if (!enemy) {
    res.status(404).json({ success: false, message: "Enemy not found" });
    return false;
  }

  if (enemy.zoneId !== character.currentZoneId) {
    res.status(400).json({ success: false, message: "Enemy is not in your current zone" });
    return false;
  }

  return true;
}

async function resolveKill(character, enemy, options = {}) {
  const { effective, goldEarned, xpEarned } = applyRewardBonuses(character, enemy);
  const dropsToGrant = rollDrops(enemy, 1);
  const { xpResult, data: characterUpdateData } = buildCharacterUpdateAfterRewards(character, xpEarned, goldEarned);

  const result = await prisma.$transaction(async (tx) => {
    const grantedDrops = await grantDrops(tx, character.id, dropsToGrant);

    const extraCharacterData = {
      ...characterUpdateData,
      totalKills: character.totalKills + 1,
    };
    if (options.isBoss) {
      extraCharacterData.diamonds = character.diamonds + (options.diamondsEarned || 0);
      extraCharacterData.bossKills = character.bossKills + 1;
      extraCharacterData.maxZoneOrderUnlocked = Math.max(
        character.maxZoneOrderUnlocked,
        enemy.zone.orderIndex + 1
      );
    }

    const updatedCharacter = await tx.character.update({
      where: { id: character.id },
      data: extraCharacterData,
      include: {
        upgrades: true,
        currentZone: { include: { enemies: { orderBy: { sortOrder: "asc" } } } },
        inventory: { include: { itemDefinition: true } },
      },
    });

    await tx.characterZoneProgress.upsert({
      where: {
        characterId_zoneId: {
          characterId: character.id,
          zoneId: enemy.zoneId,
        },
      },
      update: {
        unlocked: true,
        enemiesKilled: { increment: options.isBoss ? 0 : 1 },
        bossDefeated: options.isBoss ? true : undefined,
        bossKills: options.isBoss ? { increment: 1 } : undefined,
        lastBossDefeatedAt: options.isBoss ? new Date() : undefined,
      },
      create: {
        characterId: character.id,
        zoneId: enemy.zoneId,
        unlocked: true,
        enemiesKilled: options.isBoss ? 0 : 1,
        bossDefeated: Boolean(options.isBoss),
        bossKills: options.isBoss ? 1 : 0,
        lastBossDefeatedAt: options.isBoss ? new Date() : null,
      },
    });

    if (options.nextZone) {
      await tx.characterZoneProgress.upsert({
        where: {
          characterId_zoneId: {
            characterId: character.id,
            zoneId: options.nextZone.id,
          },
        },
        update: { unlocked: true },
        create: { characterId: character.id, zoneId: options.nextZone.id, unlocked: true },
      });
    }

    const combatLog = await tx.combatLog.create({
      data: {
        characterId: character.id,
        enemyTypeId: enemy.id,
        damage: enemy.maxHp,
        isCrit: false,
        enemyKilled: true,
        goldEarned,
        xpEarned,
        dropsJson: grantedDrops,
      },
    });

    return { updatedCharacter, combatLog, grantedDrops };
  });

  return {
    effective,
    goldEarned,
    xpEarned,
    xpResult,
    drops: summarizeDrops(result.grantedDrops),
    character: result.updatedCharacter,
    combatLog: result.combatLog,
  };
}

router.post("/attack", authMiddleware, async (req, res) => {
  try {
    const { enemyTypeId } = req.body;

    if (!enemyTypeId) {
      return res.status(400).json({ success: false, message: "enemyTypeId is required" });
    }

    const character = await getCharacter(req.user.id);
    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    const enemy = await getEnemy(enemyTypeId);
    if (!validateEnemyInCurrentZone(res, character, enemy)) return;

    if (enemy.isBoss) {
      return res.status(400).json({
        success: false,
        message: "Bosses must be defeated with /combat/challenge-boss",
      });
    }

    const effective = getEffectiveStats(character);
    const { damage, isCrit } = calculateDamage(effective, enemy);
    const enemyKilled = damage >= enemy.maxHp;

    if (!enemyKilled) {
      const combatLog = await prisma.combatLog.create({
        data: {
          characterId: character.id,
          enemyTypeId: enemy.id,
          damage,
          isCrit,
          enemyKilled: false,
          goldEarned: 0,
          xpEarned: 0,
        },
      });

      return res.json({
        success: true,
        data: {
          enemy: { id: enemy.id, name: enemy.name, maxHp: enemy.maxHp, isBoss: enemy.isBoss },
          damage,
          isCrit,
          enemyKilled,
          goldEarned: 0,
          xpEarned: 0,
          drops: [],
          drop: null,
          levelsGained: 0,
          character,
          combatLog,
        },
      });
    }

    const result = await resolveKill(character, enemy);

    res.json({
      success: true,
      message: `${enemy.name} defeated`,
      data: {
        enemy: { id: enemy.id, name: enemy.name, maxHp: enemy.maxHp, isBoss: enemy.isBoss },
        damage,
        isCrit,
        enemyKilled: true,
        goldEarned: result.goldEarned,
        xpEarned: result.xpEarned,
        drops: result.drops,
        drop: result.drops[0] || null,
        levelsGained: result.xpResult.levelsGained,
        character: result.character,
      },
    });
  } catch (error) {
    console.error("Combat attack error:", error);
    res.status(500).json({ success: false, message: "Error attacking enemy" });
  }
});

router.post("/kill", authMiddleware, async (req, res) => {
  try {
    const { enemyTypeId } = req.body;

    if (!enemyTypeId) {
      return res.status(400).json({ success: false, message: "enemyTypeId is required" });
    }

    const character = await getCharacter(req.user.id);
    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    const enemy = await getEnemy(enemyTypeId);
    if (!validateEnemyInCurrentZone(res, character, enemy)) return;

    if (enemy.isBoss) {
      return res.status(400).json({
        success: false,
        message: "Bosses must be defeated with /combat/challenge-boss",
      });
    }

    const result = await resolveKill(character, enemy);

    res.json({
      success: true,
      message: `${enemy.name} killed successfully`,
      data: {
        enemy: { id: enemy.id, name: enemy.name, maxHp: enemy.maxHp, isBoss: enemy.isBoss },
        goldEarned: result.goldEarned,
        xpEarned: result.xpEarned,
        drops: result.drops,
        drop: result.drops[0] || null,
        levelsGained: result.xpResult.levelsGained,
        character: result.character,
      },
    });
  } catch (error) {
    console.error("Combat kill error:", error);
    res.status(500).json({ success: false, message: "Error killing enemy" });
  }
});

router.post("/challenge-boss", authMiddleware, async (req, res) => {
  try {
    const { enemyTypeId } = req.body;

    if (!enemyTypeId) {
      return res.status(400).json({ success: false, message: "enemyTypeId is required" });
    }

    const character = await getCharacter(req.user.id);
    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    const enemy = await getEnemy(enemyTypeId);
    if (!validateEnemyInCurrentZone(res, character, enemy)) return;

    if (!enemy.isBoss) {
      return res.status(400).json({ success: false, message: "This enemy is not a boss" });
    }

    const effective = getEffectiveStats(character);
    const requiredPower = enemy.powerRecommended || enemy.zone.requiredPower || 0;

    if (character.power < requiredPower) {
      return res.status(403).json({
        success: false,
        message: `Your power is too low to defeat ${enemy.name}. Improve ATK, DEF, HP or equipment.`,
        requiredPower,
        currentPower: character.power,
      });
    }

    const estimatedPlayerScore = effective.atk * 14 + effective.def * 9 + effective.maxHp * 0.55;
    const estimatedBossScore = enemy.maxHp * 0.32 + enemy.atk * 15 + enemy.def * 18;

    if (estimatedPlayerScore < estimatedBossScore) {
      return res.status(400).json({
        success: false,
        message: `${enemy.name} defeated you. Upgrade your stats and try again.`,
        requiredPower,
        currentPower: character.power,
        recommendation: "Upgrade ATK for more damage, DEF/HP for survival, or equip better items.",
      });
    }

    const nextZone = await prisma.zone.findFirst({
      where: { orderIndex: enemy.zone.orderIndex + 1, isActive: true },
    });

    const diamondsEarned = Math.max(1, Math.floor(enemy.level / 5));
    const result = await resolveKill(character, enemy, { isBoss: true, diamondsEarned, nextZone });

    res.json({
      success: true,
      message: `${enemy.name} defeated. ${nextZone ? `${nextZone.name} unlocked.` : "No more zones to unlock yet."}`,
      data: {
        enemy: { id: enemy.id, name: enemy.name, maxHp: enemy.maxHp, isBoss: true },
        goldEarned: result.goldEarned,
        xpEarned: result.xpEarned,
        diamondsEarned,
        drops: result.drops,
        drop: result.drops[0] || null,
        levelsGained: result.xpResult.levelsGained,
        unlockedZone: nextZone || null,
        character: result.character,
      },
    });
  } catch (error) {
    console.error("Challenge boss error:", error);
    res.status(500).json({ success: false, message: "Error challenging boss" });
  }
});

module.exports = router;
