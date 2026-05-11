-- CreateEnum
CREATE TYPE "CharacterClass" AS ENUM ('WARRIOR', 'MAGE', 'RANGER', 'PALADIN', 'ASSASSIN');

-- CreateEnum
CREATE TYPE "UpgradeStat" AS ENUM ('ATK', 'DEF', 'HP', 'CRIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "CharacterClass" NOT NULL DEFAULT 'WARRIOR',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "diamonds" INTEGER NOT NULL DEFAULT 0,
    "atk" INTEGER NOT NULL DEFAULT 10,
    "def" INTEGER NOT NULL DEFAULT 3,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "currentHp" INTEGER NOT NULL DEFAULT 100,
    "critChance" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "critDamage" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "attackSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "power" INTEGER NOT NULL DEFAULT 100,
    "currentZoneId" TEXT,
    "lastLogoutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnemyType" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "atk" INTEGER NOT NULL,
    "def" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "goldReward" INTEGER NOT NULL,
    "isBoss" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnemyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatUpgrade" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "stat" "UpgradeStat" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "baseCost" INTEGER NOT NULL,
    "currentCost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CombatLog" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "enemyTypeId" TEXT NOT NULL,
    "damage" INTEGER NOT NULL,
    "isCrit" BOOLEAN NOT NULL DEFAULT false,
    "enemyKilled" BOOLEAN NOT NULL DEFAULT false,
    "goldEarned" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CombatLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineReward" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "secondsOffline" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "goldEarned" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfflineReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StatUpgrade_characterId_stat_key" ON "StatUpgrade"("characterId", "stat");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_currentZoneId_fkey" FOREIGN KEY ("currentZoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnemyType" ADD CONSTRAINT "EnemyType_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatUpgrade" ADD CONSTRAINT "StatUpgrade_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombatLog" ADD CONSTRAINT "CombatLog_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombatLog" ADD CONSTRAINT "CombatLog_enemyTypeId_fkey" FOREIGN KEY ("enemyTypeId") REFERENCES "EnemyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflineReward" ADD CONSTRAINT "OfflineReward_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
