const prisma = require("../src/utils/prisma");

async function main() {
  console.log("Seeding Crystal Idle game foundation data...");

  const zones = [
    {
      id: "crystal_forest",
      name: "Crystal Forest",
      description: "A magical forest corrupted by green crystals.",
      orderIndex: 1,
      requiredLevel: 1,
      requiredPower: 0,
      xpMultiplier: 1.0,
      goldMultiplier: 1.0,
      enemies: [
        { id: "green_slime", name: "Green Slime", level: 1, sortOrder: 1, maxHp: 30, atk: 4, def: 0, xpReward: 10, goldReward: 3, isBoss: false, powerRecommended: 0 },
        { id: "crystal_wolf", name: "Crystal Wolf", level: 3, sortOrder: 2, maxHp: 80, atk: 8, def: 1, xpReward: 25, goldReward: 8, isBoss: false, powerRecommended: 120 },
        { id: "slime_king", name: "Slime King", level: 5, sortOrder: 3, maxHp: 500, atk: 15, def: 3, xpReward: 150, goldReward: 60, isBoss: true, powerRecommended: 250 },
      ],
    },
    {
      id: "dark_cave",
      name: "Dark Cave",
      description: "A dangerous cave full of bats, goblins and hidden monsters.",
      orderIndex: 2,
      requiredLevel: 5,
      requiredPower: 450,
      xpMultiplier: 1.25,
      goldMultiplier: 1.25,
      enemies: [
        { id: "cave_bat", name: "Cave Bat", level: 6, sortOrder: 1, maxHp: 120, atk: 12, def: 2, xpReward: 40, goldReward: 14, isBoss: false, powerRecommended: 350 },
        { id: "goblin_raider", name: "Goblin Raider", level: 8, sortOrder: 2, maxHp: 220, atk: 18, def: 5, xpReward: 75, goldReward: 28, isBoss: false, powerRecommended: 500 },
        { id: "cave_troll", name: "Cave Troll", level: 10, sortOrder: 3, maxHp: 1200, atk: 35, def: 12, xpReward: 450, goldReward: 180, isBoss: true, powerRecommended: 850 },
      ],
    },
    {
      id: "frozen_ruins",
      name: "Frozen Ruins",
      description: "Ancient ruins covered by ice and guarded by frozen beasts.",
      orderIndex: 3,
      requiredLevel: 10,
      requiredPower: 1200,
      xpMultiplier: 1.6,
      goldMultiplier: 1.6,
      enemies: [
        { id: "ice_spider", name: "Ice Spider", level: 11, sortOrder: 1, maxHp: 350, atk: 28, def: 8, xpReward: 120, goldReward: 45, isBoss: false, powerRecommended: 1100 },
        { id: "frost_wolf", name: "Frost Wolf", level: 13, sortOrder: 2, maxHp: 550, atk: 42, def: 14, xpReward: 190, goldReward: 75, isBoss: false, powerRecommended: 1450 },
        { id: "ice_golem", name: "Ice Golem", level: 15, sortOrder: 3, maxHp: 2600, atk: 75, def: 30, xpReward: 1200, goldReward: 520, isBoss: true, powerRecommended: 1800 },
      ],
    },
  ];

  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { id: zone.id },
      update: {
        name: zone.name,
        description: zone.description,
        orderIndex: zone.orderIndex,
        requiredLevel: zone.requiredLevel,
        requiredPower: zone.requiredPower,
        xpMultiplier: zone.xpMultiplier,
        goldMultiplier: zone.goldMultiplier,
        isActive: true,
      },
      create: {
        id: zone.id,
        name: zone.name,
        description: zone.description,
        orderIndex: zone.orderIndex,
        requiredLevel: zone.requiredLevel,
        requiredPower: zone.requiredPower,
        xpMultiplier: zone.xpMultiplier,
        goldMultiplier: zone.goldMultiplier,
        isActive: true,
      },
    });

    for (const enemy of zone.enemies) {
      await prisma.enemyType.upsert({
        where: { id: enemy.id },
        update: { ...enemy, zoneId: zone.id },
        create: { ...enemy, zoneId: zone.id },
      });
    }
  }

  const items = [
    {
      id: "crystal_shard_green",
      name: "Green Crystal Shard",
      description: "Material from Crystal Forest enemies. Used later for crafting and upgrades.",
      type: "MATERIAL",
      rarity: "COMMON",
      stackable: true,
      sellGold: 2,
      sourceZoneId: "crystal_forest",
    },
    {
      id: "forest_wooden_sword",
      name: "Forest Wooden Sword",
      description: "A basic weapon charged with weak crystal energy.",
      type: "WEAPON",
      rarity: "COMMON",
      slot: "WEAPON",
      atk: 4,
      sellGold: 20,
      sourceZoneId: "crystal_forest",
    },
    {
      id: "slime_king_blade",
      name: "Slime King Blade",
      description: "A rare blade dropped by the first zone boss.",
      type: "WEAPON",
      rarity: "RARE",
      slot: "WEAPON",
      atk: 16,
      critChance: 0.02,
      sellGold: 120,
      sourceZoneId: "crystal_forest",
    },
    {
      id: "dark_ore",
      name: "Dark Ore",
      description: "Material from Dark Cave. Used later to upgrade equipment.",
      type: "MATERIAL",
      rarity: "COMMON",
      stackable: true,
      sellGold: 5,
      sourceZoneId: "dark_cave",
    },
    {
      id: "goblin_raider_armor",
      name: "Goblin Raider Armor",
      description: "Light armor stolen from cave raiders.",
      type: "ARMOR",
      rarity: "RARE",
      slot: "ARMOR",
      def: 10,
      maxHp: 40,
      sellGold: 160,
      sourceZoneId: "dark_cave",
    },
    {
      id: "cave_troll_amulet",
      name: "Cave Troll Amulet",
      description: "Boss amulet that improves gold farming.",
      type: "AMULET",
      rarity: "EPIC",
      slot: "AMULET",
      def: 8,
      maxHp: 80,
      goldBonus: 0.05,
      sellGold: 350,
      sourceZoneId: "dark_cave",
    },
    {
      id: "frost_crystal",
      name: "Frost Crystal",
      description: "Material from Frozen Ruins. Cold but valuable.",
      type: "MATERIAL",
      rarity: "COMMON",
      stackable: true,
      sellGold: 10,
      sourceZoneId: "frozen_ruins",
    },
    {
      id: "frost_wolf_boots",
      name: "Frost Wolf Boots",
      description: "Boots that help you farm faster in dangerous zones.",
      type: "BOOTS",
      rarity: "RARE",
      slot: "BOOTS",
      def: 6,
      maxHp: 30,
      autoFarmSpeed: 0.03,
      sellGold: 260,
      sourceZoneId: "frozen_ruins",
    },
    {
      id: "ice_golem_core",
      name: "Ice Golem Core",
      description: "Epic boss item from Frozen Ruins.",
      type: "AMULET",
      rarity: "EPIC",
      slot: "AMULET",
      atk: 18,
      def: 18,
      maxHp: 120,
      xpBonus: 0.06,
      sellGold: 600,
      sourceZoneId: "frozen_ruins",
    },
    {
      id: "ice_golem_greatsword",
      name: "Ice Golem Greatsword",
      description: "A frozen weapon carved from the Ice Golem arm.",
      type: "WEAPON",
      rarity: "EPIC",
      slot: "WEAPON",
      atk: 28,
      critChance: 0.025,
      sellGold: 650,
      sourceZoneId: "frozen_ruins",
    },
    {
      id: "ice_golem_plate",
      name: "Ice Golem Plate",
      description: "Heavy armor made of enchanted frost plates.",
      type: "ARMOR",
      rarity: "EPIC",
      slot: "ARMOR",
      def: 24,
      maxHp: 160,
      sellGold: 650,
      sourceZoneId: "frozen_ruins",
    },
    {
      id: "frost_crown",
      name: "Frost Crown",
      description: "A rare helmet from the Frozen Ruins boss pool.",
      type: "HELMET",
      rarity: "RARE",
      slot: "HELMET",
      def: 12,
      maxHp: 70,
      xpBonus: 0.03,
      sellGold: 360,
      sourceZoneId: "frozen_ruins",
    },
    {
      id: "common_zone_chest",
      name: "Common Zone Chest",
      description: "A simple chest with future rewards.",
      type: "CHEST",
      rarity: "COMMON",
      stackable: true,
      sellGold: 25,
    },
    {
      id: "boss_chest",
      name: "Boss Chest",
      description: "A chest rewarded by defeating zone bosses.",
      type: "CHEST",
      rarity: "RARE",
      stackable: true,
      sellGold: 100,
    },
  ];

  for (const item of items) {
    await prisma.itemDefinition.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  const drops = [
    ["green_slime", "crystal_shard_green", 0.25, 1, 2],
    ["green_slime", "forest_wooden_sword", 0.03, 1, 1],
    ["crystal_wolf", "crystal_shard_green", 0.35, 1, 3],
    ["crystal_wolf", "forest_wooden_sword", 0.08, 1, 1],
    ["slime_king", "boss_chest", 1.0, 1, 1],
    ["slime_king", "slime_king_blade", 0.25, 1, 1],

    ["cave_bat", "dark_ore", 0.25, 1, 2],
    ["goblin_raider", "dark_ore", 0.4, 1, 3],
    ["goblin_raider", "goblin_raider_armor", 0.08, 1, 1],
    ["cave_troll", "boss_chest", 1.0, 1, 1],
    ["cave_troll", "cave_troll_amulet", 0.18, 1, 1],

    ["ice_spider", "frost_crystal", 0.3, 1, 2],
    ["frost_wolf", "frost_crystal", 0.45, 1, 3],
    ["frost_wolf", "frost_wolf_boots", 0.08, 1, 1],
    ["ice_golem", "boss_chest", 1.0, 1, 1],
    ["ice_golem", "ice_golem_core", 0.16, 1, 1],
    ["ice_golem", "ice_golem_greatsword", 0.14, 1, 1],
    ["ice_golem", "ice_golem_plate", 0.14, 1, 1],
    ["ice_golem", "frost_crown", 0.20, 1, 1],
  ];

  for (const [enemyTypeId, itemDefinitionId, dropChance, minQuantity, maxQuantity] of drops) {
    await prisma.enemyDrop.upsert({
      where: {
        enemyTypeId_itemDefinitionId: {
          enemyTypeId,
          itemDefinitionId,
        },
      },
      update: { dropChance, minQuantity, maxQuantity },
      create: { enemyTypeId, itemDefinitionId, dropChance, minQuantity, maxQuantity },
    });
  }

  const characters = await prisma.character.findMany({ select: { id: true, currentZoneId: true, level: true, maxZoneOrderUnlocked: true } });
  const allZones = await prisma.zone.findMany({ select: { id: true, orderIndex: true, requiredLevel: true } });

  for (const character of characters) {
    for (const zone of allZones) {
      const unlocked = zone.orderIndex <= character.maxZoneOrderUnlocked || zone.id === character.currentZoneId || zone.requiredLevel <= character.level;
      await prisma.characterZoneProgress.upsert({
        where: {
          characterId_zoneId: {
            characterId: character.id,
            zoneId: zone.id,
          },
        },
        update: { unlocked },
        create: {
          characterId: character.id,
          zoneId: zone.id,
          unlocked,
        },
      });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
