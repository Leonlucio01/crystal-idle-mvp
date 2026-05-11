function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function serializeDrop(inventoryItem) {
  const item = inventoryItem.itemDefinition || inventoryItem;
  return {
    id: inventoryItem.id,
    itemDefinitionId: item.id || inventoryItem.itemDefinitionId,
    name: item.name,
    type: item.type,
    rarity: item.rarity,
    slot: item.slot || null,
    equippedSlot: inventoryItem.equippedSlot || null,
    quantity: inventoryItem.quantity || 1,
    atk: inventoryItem.atk || item.atk || 0,
    def: inventoryItem.def || item.def || 0,
    maxHp: inventoryItem.maxHp || item.maxHp || 0,
    critChance: inventoryItem.critChance || item.critChance || 0,
    goldBonus: inventoryItem.goldBonus || item.goldBonus || 0,
    xpBonus: inventoryItem.xpBonus || item.xpBonus || 0,
    autoFarmSpeed: inventoryItem.autoFarmSpeed || item.autoFarmSpeed || 0,
  };
}

function rollDrops(enemy, killCount = 1, options = {}) {
  const rolls = Math.max(0, Math.floor(killCount || 0));
  const drops = [];
  const dropDefinitions = enemy.drops || [];

  for (let i = 0; i < rolls; i += 1) {
    for (const drop of dropDefinitions) {
      const chance = options.forceBossDrops && enemy.isBoss ? Math.max(drop.dropChance, 1) : drop.dropChance;
      if (Math.random() <= chance) {
        drops.push({
          itemDefinition: drop.itemDefinition,
          quantity: randomInt(drop.minQuantity, drop.maxQuantity),
        });
      }
    }
  }

  return mergeDrops(drops.map((drop) => ({
    itemDefinitionId: drop.itemDefinition.id,
    itemDefinition: drop.itemDefinition,
    quantity: drop.quantity,
  })));
}

function mergeDrops(drops) {
  const merged = [];

  for (const drop of drops) {
    const item = drop.itemDefinition;
    if (item.stackable) {
      const existing = merged.find((entry) => entry.itemDefinitionId === item.id && entry.itemDefinition.stackable);
      if (existing) {
        existing.quantity += drop.quantity;
        continue;
      }
    }
    merged.push(drop);
  }

  return merged;
}

async function grantDrops(tx, characterId, drops) {
  const granted = [];

  for (const drop of drops) {
    const item = drop.itemDefinition;
    const quantity = Math.max(1, Math.floor(drop.quantity || 1));

    if (item.stackable) {
      const existing = await tx.characterInventoryItem.findFirst({
        where: {
          characterId,
          itemDefinitionId: item.id,
          equippedSlot: null,
        },
        include: { itemDefinition: true },
      });

      if (existing) {
        const updated = await tx.characterInventoryItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
          include: { itemDefinition: true },
        });
        granted.push({ ...serializeDrop(updated), quantity });
        continue;
      }

      const created = await tx.characterInventoryItem.create({
        data: {
          characterId,
          itemDefinitionId: item.id,
          quantity,
          atk: item.atk,
          def: item.def,
          maxHp: item.maxHp,
          critChance: item.critChance,
          goldBonus: item.goldBonus,
          xpBonus: item.xpBonus,
          autoFarmSpeed: item.autoFarmSpeed,
        },
        include: { itemDefinition: true },
      });
      granted.push(serializeDrop(created));
      continue;
    }

    for (let i = 0; i < quantity; i += 1) {
      const created = await tx.characterInventoryItem.create({
        data: {
          characterId,
          itemDefinitionId: item.id,
          quantity: 1,
          atk: item.atk,
          def: item.def,
          maxHp: item.maxHp,
          critChance: item.critChance,
          goldBonus: item.goldBonus,
          xpBonus: item.xpBonus,
          autoFarmSpeed: item.autoFarmSpeed,
        },
        include: { itemDefinition: true },
      });
      granted.push(serializeDrop(created));
    }
  }

  return granted;
}

function summarizeDrops(drops) {
  const map = new Map();
  for (const drop of drops) {
    const key = drop.itemDefinitionId || drop.name;
    const current = map.get(key) || { ...drop, quantity: 0 };
    current.quantity += drop.quantity || 1;
    map.set(key, current);
  }
  return Array.from(map.values());
}

module.exports = {
  rollDrops,
  grantDrops,
  serializeDrop,
  summarizeDrops,
};
