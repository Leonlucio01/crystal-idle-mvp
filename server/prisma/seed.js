const prisma = require("../src/utils/prisma");

async function main() {
  console.log("Seeding initial game data...");

  const zones = [
    {
      id: "crystal_forest",
      name: "Crystal Forest",
      description: "A magical forest corrupted by green crystals.",
      requiredLevel: 1,
      enemies: [
        {
          id: "green_slime",
          name: "Green Slime",
          maxHp: 30,
          atk: 4,
          def: 0,
          xpReward: 10,
          goldReward: 3,
          isBoss: false,
        },
        {
          id: "crystal_wolf",
          name: "Crystal Wolf",
          maxHp: 80,
          atk: 8,
          def: 1,
          xpReward: 25,
          goldReward: 8,
          isBoss: false,
        },
        {
          id: "slime_king",
          name: "Slime King",
          maxHp: 500,
          atk: 15,
          def: 3,
          xpReward: 150,
          goldReward: 60,
          isBoss: true,
        },
      ],
    },
    {
      id: "dark_cave",
      name: "Dark Cave",
      description: "A dangerous cave full of bats, goblins and hidden monsters.",
      requiredLevel: 5,
      enemies: [
        {
          id: "cave_bat",
          name: "Cave Bat",
          maxHp: 120,
          atk: 12,
          def: 2,
          xpReward: 40,
          goldReward: 14,
          isBoss: false,
        },
        {
          id: "goblin_raider",
          name: "Goblin Raider",
          maxHp: 220,
          atk: 18,
          def: 5,
          xpReward: 75,
          goldReward: 28,
          isBoss: false,
        },
        {
          id: "cave_troll",
          name: "Cave Troll",
          maxHp: 1200,
          atk: 35,
          def: 12,
          xpReward: 450,
          goldReward: 180,
          isBoss: true,
        },
      ],
    },
    {
      id: "frozen_ruins",
      name: "Frozen Ruins",
      description: "Ancient ruins covered by ice and guarded by frozen beasts.",
      requiredLevel: 10,
      enemies: [
        {
          id: "ice_spider",
          name: "Ice Spider",
          maxHp: 350,
          atk: 28,
          def: 8,
          xpReward: 120,
          goldReward: 45,
          isBoss: false,
        },
        {
          id: "frost_wolf",
          name: "Frost Wolf",
          maxHp: 550,
          atk: 42,
          def: 14,
          xpReward: 190,
          goldReward: 75,
          isBoss: false,
        },
        {
          id: "ice_golem",
          name: "Ice Golem",
          maxHp: 2600,
          atk: 75,
          def: 30,
          xpReward: 1200,
          goldReward: 520,
          isBoss: true,
        },
      ],
    },
  ];

  for (const zone of zones) {
    await prisma.zone.upsert({
      where: {
        id: zone.id,
      },
      update: {
        name: zone.name,
        description: zone.description,
        requiredLevel: zone.requiredLevel,
      },
      create: {
        id: zone.id,
        name: zone.name,
        description: zone.description,
        requiredLevel: zone.requiredLevel,
      },
    });

    for (const enemy of zone.enemies) {
      await prisma.enemyType.upsert({
        where: {
          id: enemy.id,
        },
        update: {
          zoneId: zone.id,
          name: enemy.name,
          maxHp: enemy.maxHp,
          atk: enemy.atk,
          def: enemy.def,
          xpReward: enemy.xpReward,
          goldReward: enemy.goldReward,
          isBoss: enemy.isBoss,
        },
        create: {
          id: enemy.id,
          zoneId: zone.id,
          name: enemy.name,
          maxHp: enemy.maxHp,
          atk: enemy.atk,
          def: enemy.def,
          xpReward: enemy.xpReward,
          goldReward: enemy.goldReward,
          isBoss: enemy.isBoss,
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