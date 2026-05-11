Crystal Idle MVP - Fase 1: estructura de base de datos

Este paquete modifica SOLO la base de datos/Prisma. No cambia backend ni frontend todavia.

Archivos incluidos para reemplazar/agregar:

server/prisma/schema.prisma
server/prisma/seed.js
server/prisma/migrations/20260511120000_game_foundation_schema/migration.sql

Que agrega:

1. Progreso real por zona
- CharacterZoneProgress
- zonas desbloqueadas por personaje
- boss derrotado por zona
- kills por zona
- boss kills por zona

2. Preparacion para jefes y desbloqueo de zonas
- Character.totalKills
- Character.bossKills
- Character.maxZoneOrderUnlocked
- Character.lastActiveAt
- Zone.orderIndex
- Zone.requiredPower
- Zone.xpMultiplier
- Zone.goldMultiplier
- EnemyType.level
- EnemyType.sortOrder
- EnemyType.powerRecommended

3. Sistema base de items, drops, inventario y equipo
- ItemDefinition
- EnemyDrop
- CharacterInventoryItem
- enums ItemType, ItemRarity, EquipmentSlot

4. Drops en logs y offline
- CombatLog.dropsJson
- OfflineReward.dropsJson

Instalacion local:

1. Haz backup o commit antes de reemplazar archivos.
2. Descomprime este ZIP en la raiz del proyecto crystal-idle-mvp.
3. En CMD:

cd server
npx prisma migrate dev
npx prisma generate
npm run seed

Produccion en Render:

Despues de hacer commit y push, en Render debe ejecutarse:

npx prisma migrate deploy
npm run seed

Si Render no ejecuta seed automaticamente, puedes correrlo desde Shell/Job manual o agregar temporalmente un comando de deploy.

Importante:

- Esta fase no cambia endpoints todavia.
- El juego deberia seguir funcionando como antes, pero la base queda lista para implementar Boss System, Drops reales, Inventario y Equipo.
- El siguiente paso recomendado es backend: actualizar combat.routes.js, zone.routes.js, character.routes.js y crear endpoints de inventory.
