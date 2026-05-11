-- Game foundation schema: zone progression, bosses, drops, inventory and equipment-ready data.

CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'HELMET', 'BOOTS', 'AMULET', 'MATERIAL', 'CHEST');
CREATE TYPE "ItemRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC');
CREATE TYPE "EquipmentSlot" AS ENUM ('WEAPON', 'ARMOR', 'HELMET', 'BOOTS', 'AMULET');

ALTER TABLE "Character"
  ADD COLUMN "totalKills" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "bossKills" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "maxZoneOrderUnlocked" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "lastActiveAt" TIMESTAMP(3);

ALTER TABLE "Zone"
  ADD COLUMN "orderIndex" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "requiredPower" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "xpMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  ADD COLUMN "goldMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Zone" SET "orderIndex" = 1, "requiredPower" = 0, "xpMultiplier" = 1.0, "goldMultiplier" = 1.0 WHERE "id" = 'crystal_forest';
UPDATE "Zone" SET "orderIndex" = 2, "requiredPower" = 450, "xpMultiplier" = 1.25, "goldMultiplier" = 1.25 WHERE "id" = 'dark_cave';
UPDATE "Zone" SET "orderIndex" = 3, "requiredPower" = 1200, "xpMultiplier" = 1.6, "goldMultiplier" = 1.6 WHERE "id" = 'frozen_ruins';

CREATE UNIQUE INDEX "Zone_orderIndex_key" ON "Zone"("orderIndex");

ALTER TABLE "EnemyType"
  ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "powerRecommended" INTEGER NOT NULL DEFAULT 0;

UPDATE "EnemyType" SET "level" = 1, "sortOrder" = 1, "powerRecommended" = 0 WHERE "id" = 'green_slime';
UPDATE "EnemyType" SET "level" = 3, "sortOrder" = 2, "powerRecommended" = 120 WHERE "id" = 'crystal_wolf';
UPDATE "EnemyType" SET "level" = 5, "sortOrder" = 3, "powerRecommended" = 250 WHERE "id" = 'slime_king';
UPDATE "EnemyType" SET "level" = 6, "sortOrder" = 1, "powerRecommended" = 350 WHERE "id" = 'cave_bat';
UPDATE "EnemyType" SET "level" = 8, "sortOrder" = 2, "powerRecommended" = 500 WHERE "id" = 'goblin_raider';
UPDATE "EnemyType" SET "level" = 10, "sortOrder" = 3, "powerRecommended" = 850 WHERE "id" = 'cave_troll';
UPDATE "EnemyType" SET "level" = 11, "sortOrder" = 1, "powerRecommended" = 1100 WHERE "id" = 'ice_spider';
UPDATE "EnemyType" SET "level" = 13, "sortOrder" = 2, "powerRecommended" = 1450 WHERE "id" = 'frost_wolf';
UPDATE "EnemyType" SET "level" = 15, "sortOrder" = 3, "powerRecommended" = 1800 WHERE "id" = 'ice_golem';

CREATE INDEX "EnemyType_zoneId_isBoss_idx" ON "EnemyType"("zoneId", "isBoss");

CREATE TABLE "ItemDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "ItemType" NOT NULL,
    "rarity" "ItemRarity" NOT NULL DEFAULT 'COMMON',
    "slot" "EquipmentSlot",
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "atk" INTEGER NOT NULL DEFAULT 0,
    "def" INTEGER NOT NULL DEFAULT 0,
    "maxHp" INTEGER NOT NULL DEFAULT 0,
    "critChance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goldBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xpBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autoFarmSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellGold" INTEGER NOT NULL DEFAULT 0,
    "sourceZoneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ItemDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnemyDrop" (
    "id" TEXT NOT NULL,
    "enemyTypeId" TEXT NOT NULL,
    "itemDefinitionId" TEXT NOT NULL,
    "dropChance" DOUBLE PRECISION NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "maxQuantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EnemyDrop_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CharacterInventoryItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemDefinitionId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equippedSlot" "EquipmentSlot",
    "atk" INTEGER NOT NULL DEFAULT 0,
    "def" INTEGER NOT NULL DEFAULT 0,
    "maxHp" INTEGER NOT NULL DEFAULT 0,
    "critChance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goldBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xpBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autoFarmSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CharacterInventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CharacterZoneProgress" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "enemiesKilled" INTEGER NOT NULL DEFAULT 0,
    "bossDefeated" BOOLEAN NOT NULL DEFAULT false,
    "bossKills" INTEGER NOT NULL DEFAULT 0,
    "lastBossDefeatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CharacterZoneProgress_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CombatLog" ADD COLUMN "dropsJson" JSONB;
ALTER TABLE "OfflineReward" ADD COLUMN "dropsJson" JSONB;

CREATE UNIQUE INDEX "EnemyDrop_enemyTypeId_itemDefinitionId_key" ON "EnemyDrop"("enemyTypeId", "itemDefinitionId");
CREATE INDEX "CharacterInventoryItem_characterId_idx" ON "CharacterInventoryItem"("characterId");
CREATE INDEX "CharacterInventoryItem_itemDefinitionId_idx" ON "CharacterInventoryItem"("itemDefinitionId");
CREATE UNIQUE INDEX "CharacterZoneProgress_characterId_zoneId_key" ON "CharacterZoneProgress"("characterId", "zoneId");

ALTER TABLE "ItemDefinition" ADD CONSTRAINT "ItemDefinition_sourceZoneId_fkey" FOREIGN KEY ("sourceZoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EnemyDrop" ADD CONSTRAINT "EnemyDrop_enemyTypeId_fkey" FOREIGN KEY ("enemyTypeId") REFERENCES "EnemyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnemyDrop" ADD CONSTRAINT "EnemyDrop_itemDefinitionId_fkey" FOREIGN KEY ("itemDefinitionId") REFERENCES "ItemDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CharacterInventoryItem" ADD CONSTRAINT "CharacterInventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CharacterInventoryItem" ADD CONSTRAINT "CharacterInventoryItem_itemDefinitionId_fkey" FOREIGN KEY ("itemDefinitionId") REFERENCES "ItemDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CharacterZoneProgress" ADD CONSTRAINT "CharacterZoneProgress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CharacterZoneProgress" ADD CONSTRAINT "CharacterZoneProgress_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "CharacterZoneProgress" ("id", "characterId", "zoneId", "unlocked", "bossDefeated", "createdAt", "updatedAt")
SELECT 'czp_' || c."id" || '_' || z."id", c."id", z."id",
       CASE WHEN z."orderIndex" <= c."maxZoneOrderUnlocked" OR z."id" = c."currentZoneId" OR z."requiredLevel" <= c."level" THEN true ELSE false END,
       false,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM "Character" c
CROSS JOIN "Zone" z
ON CONFLICT ("characterId", "zoneId") DO NOTHING;
