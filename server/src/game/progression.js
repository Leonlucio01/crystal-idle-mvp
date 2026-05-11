function getXpRequired(level) {
  return Math.floor(100 * Math.pow(Math.max(1, level), 1.5));
}

function applyXp(character, xpEarned) {
  let newLevel = character.level;
  let newXp = character.xp + Math.max(0, Math.floor(xpEarned || 0));
  let xpRequired = getXpRequired(newLevel);

  while (newXp >= xpRequired) {
    newXp -= xpRequired;
    newLevel += 1;
    xpRequired = getXpRequired(newLevel);
  }

  return {
    level: newLevel,
    xp: newXp,
    levelsGained: newLevel - character.level,
  };
}

function getLevelBonuses(levelsGained) {
  return {
    hp: levelsGained * 10,
    atk: levelsGained * 2,
    def: levelsGained * 1,
  };
}

function calculatePower(stats) {
  return Math.floor(
    (stats.atk || 0) * 5 +
    (stats.def || 0) * 4 +
    (stats.maxHp || 0) +
    (stats.critChance || 0) * 1000
  );
}

function sumEquipmentBonuses(inventory = []) {
  return inventory
    .filter((item) => item.equippedSlot)
    .reduce(
      (acc, item) => {
        acc.atk += item.atk || 0;
        acc.def += item.def || 0;
        acc.maxHp += item.maxHp || 0;
        acc.critChance += item.critChance || 0;
        acc.goldBonus += item.goldBonus || 0;
        acc.xpBonus += item.xpBonus || 0;
        acc.autoFarmSpeed += item.autoFarmSpeed || 0;
        return acc;
      },
      { atk: 0, def: 0, maxHp: 0, critChance: 0, goldBonus: 0, xpBonus: 0, autoFarmSpeed: 0 }
    );
}

function getEffectiveStats(character) {
  const equipment = sumEquipmentBonuses(character.inventory || []);

  return {
    ...character,
    baseAtk: character.atk,
    baseDef: character.def,
    baseMaxHp: character.maxHp,
    atk: character.atk + equipment.atk,
    def: character.def + equipment.def,
    maxHp: character.maxHp + equipment.maxHp,
    currentHp: Math.min(character.currentHp + equipment.maxHp, character.maxHp + equipment.maxHp),
    critChance: Number((character.critChance + equipment.critChance).toFixed(4)),
    goldBonus: equipment.goldBonus,
    xpBonus: equipment.xpBonus,
    attackSpeed: Number((character.attackSpeed + equipment.autoFarmSpeed).toFixed(4)),
  };
}

function buildCharacterUpdateAfterRewards(character, xpEarned, goldEarned, extra = {}) {
  const xpResult = applyXp(character, xpEarned);
  const bonuses = getLevelBonuses(xpResult.levelsGained);

  const preview = {
    ...character,
    level: xpResult.level,
    xp: xpResult.xp,
    gold: character.gold + goldEarned,
    maxHp: character.maxHp + bonuses.hp,
    currentHp: character.currentHp + bonuses.hp,
    atk: character.atk + bonuses.atk,
    def: character.def + bonuses.def,
  };

  return {
    xpResult,
    data: {
      level: preview.level,
      xp: preview.xp,
      gold: preview.gold,
      maxHp: preview.maxHp,
      currentHp: preview.currentHp,
      atk: preview.atk,
      def: preview.def,
      power: calculatePower(preview),
      ...extra,
    },
  };
}

module.exports = {
  getXpRequired,
  applyXp,
  getLevelBonuses,
  calculatePower,
  sumEquipmentBonuses,
  getEffectiveStats,
  buildCharacterUpdateAfterRewards,
};
