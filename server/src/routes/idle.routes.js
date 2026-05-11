const express = require("express");
const prisma = require("../utils/prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { buildCharacterUpdateAfterRewards, getEffectiveStats } = require("../game/progression");
const { rollDrops, grantDrops, summarizeDrops } = require("../game/drops");

const router = express.Router();
const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
const MAX_OFFLINE_DROP_SIM_KILLS = 200;

router.post("/claim-offline", authMiddleware, async (req, res) => {
  try {
    const character = await prisma.character.findUnique({
      where: { userId: req.user.id },
      include: {
        currentZone: {
          include: {
            enemies: {
              where: { isBoss: false },
              orderBy: { sortOrder: "asc" },
              include: { drops: { include: { itemDefinition: true } } },
            },
          },
        },
        inventory: { include: { itemDefinition: true } },
      },
    });

    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    if (!character.lastLogoutAt) {
      const updatedCharacter = await prisma.character.update({
        where: { id: character.id },
        data: { lastLogoutAt: new Date(), lastActiveAt: new Date() },
      });

      return res.json({
        success: true,
        message: "Offline timer started",
        data: {
          secondsOffline: 0,
          kills: 0,
          goldEarned: 0,
          xpEarned: 0,
          drops: [],
          levelsGained: 0,
          character: updatedCharacter,
        },
      });
    }

    const now = new Date();
    const offlineSecondsRaw = Math.floor((now.getTime() - character.lastLogoutAt.getTime()) / 1000);
    const secondsOffline = Math.max(0, Math.min(offlineSecondsRaw, MAX_OFFLINE_SECONDS));

    const enemy = character.currentZone?.enemies?.[0];
    if (!enemy) {
      return res.status(400).json({ success: false, message: "No farmable enemies in current zone" });
    }

    const effective = getEffectiveStats(character);
    const playerDps = Math.max(1, effective.atk * effective.attackSpeed);
    const secondsPerKill = Math.max(1, enemy.maxHp / playerDps);
    const kills = Math.floor(secondsOffline / secondsPerKill);

    const goldEarned = Math.floor(kills * enemy.goldReward * (1 + (effective.goldBonus || 0)));
    const xpEarned = Math.floor(kills * enemy.xpReward * (1 + (effective.xpBonus || 0)));
    const simulatedKillsForDrops = Math.min(kills, MAX_OFFLINE_DROP_SIM_KILLS);
    const dropsToGrant = rollDrops(enemy, simulatedKillsForDrops);
    const { xpResult, data: characterUpdateData } = buildCharacterUpdateAfterRewards(character, xpEarned, goldEarned, {
      lastLogoutAt: now,
      lastActiveAt: now,
      totalKills: character.totalKills + kills,
    });

    const result = await prisma.$transaction(async (tx) => {
      const grantedDrops = await grantDrops(tx, character.id, dropsToGrant);

      const updatedCharacter = await tx.character.update({
        where: { id: character.id },
        data: characterUpdateData,
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
        update: { unlocked: true, enemiesKilled: { increment: kills } },
        create: { characterId: character.id, zoneId: enemy.zoneId, unlocked: true, enemiesKilled: kills },
      });

      const offlineReward = await tx.offlineReward.create({
        data: {
          characterId: character.id,
          secondsOffline,
          kills,
          goldEarned,
          xpEarned,
          dropsJson: grantedDrops,
        },
      });

      return { updatedCharacter, offlineReward, grantedDrops };
    });

    res.json({
      success: true,
      message: "Offline rewards claimed",
      data: {
        enemy: { id: enemy.id, name: enemy.name },
        secondsOffline,
        kills,
        goldEarned,
        xpEarned,
        drops: summarizeDrops(result.grantedDrops),
        levelsGained: xpResult.levelsGained,
        character: result.updatedCharacter,
        offlineReward: result.offlineReward,
      },
    });
  } catch (error) {
    console.error("Claim offline error:", error);
    res.status(500).json({ success: false, message: "Error claiming offline rewards" });
  }
});

module.exports = router;
