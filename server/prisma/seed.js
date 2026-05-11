const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial game data...");

  await prisma.zone.upsert({
    where: { id: "crystal_forest" },
    update: {},
    create: {
      id: "crystal_forest",
      name: "Crystal Forest",
      description: "A magical forest corrupted by green crystals.",
      requiredLevel: 1,
    },
  });

  await prisma.enemyType.upsert({
    where: { id: "green_slime" },
    update: {},
    create: {
      id: "green_slime",
      zoneId: "crystal_forest",
      name: "Green Slime",
      maxHp: 30,
      atk: 4,
      def: 0,
      xpReward: 10,
      goldReward: 3,
      isBoss: false,
    },
  });

  await prisma.enemyType.upsert({
    where: { id: "crystal_wolf" },
    update: {},
    create: {
      id: "crystal_wolf",
      zoneId: "crystal_forest",
      name: "Crystal Wolf",
      maxHp: 80,
      atk: 8,
      def: 1,
      xpReward: 25,
      goldReward: 8,
      isBoss: false,
    },
  });

  await prisma.enemyType.upsert({
    where: { id: "slime_king" },
    update: {},
    create: {
      id: "slime_king",
      zoneId: "crystal_forest",
      name: "Slime King",
      maxHp: 500,
      atk: 15,
      def: 3,
      xpReward: 150,
      goldReward: 60,
      isBoss: true,
    },
  });

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