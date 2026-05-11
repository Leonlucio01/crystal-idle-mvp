Crystal Idle MVP - Backend Fase 2
=================================

Este paquete incluye SOLO archivos de backend para reemplazar/agregar.
Antes de usarlo, confirma que ya aplicaste la Fase 1 de base de datos:

  cd server
  npx prisma migrate dev
  npx prisma generate
  npm run seed

Archivos incluidos:

  server/src/server.js
  server/src/routes/auth.routes.js
  server/src/routes/character.routes.js
  server/src/routes/combat.routes.js
  server/src/routes/idle.routes.js
  server/src/routes/inventory.routes.js
  server/src/routes/leaderboard.routes.js
  server/src/routes/zone.routes.js
  server/src/game/progression.js
  server/src/game/drops.js

Qué agrega:

  1. Endpoint /health para probar el servidor.
  2. Combate normal con drops reales guardados en inventario.
  3. Challenge de jefe por zona:
     POST /combat/challenge-boss
  4. Desbloqueo de la siguiente zona al derrotar el jefe.
  5. Inventario básico:
     GET /inventory
     POST /inventory/equip
     POST /inventory/sell
  6. Offline rewards con drops guardados en inventario.
  7. Zonas con estado unlocked/locked/isCurrent cuando mandas token.
  8. Register/Login ya devuelven inventario y progreso de zonas.

Instalación local:

  1. Descomprime este ZIP en la raíz del proyecto crystal-idle-mvp.
  2. Acepta reemplazar archivos.
  3. Ejecuta:

     cd server
     npx prisma generate
     npm run dev

Pruebas rápidas desde PowerShell:

  Invoke-RestMethod http://localhost:3000/health

  $login = Invoke-RestMethod -Uri http://localhost:3000/auth/login -Method POST -ContentType "application/json" -Body '{"email":"prodtest@example.com","password":"123456"}'
  $token = $login.token

  Invoke-RestMethod -Uri http://localhost:3000/character/me -Headers @{ Authorization = "Bearer $token" }

  Invoke-RestMethod -Uri http://localhost:3000/zones -Headers @{ Authorization = "Bearer $token" }

  Invoke-RestMethod -Uri http://localhost:3000/inventory -Headers @{ Authorization = "Bearer $token" }

Para probar combate normal necesitas un enemyTypeId de la zona actual. Por ejemplo:

  Invoke-RestMethod -Uri http://localhost:3000/combat/kill -Method POST -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"enemyTypeId":"ice_spider"}'

Para jefe:

  Invoke-RestMethod -Uri http://localhost:3000/combat/challenge-boss -Method POST -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"enemyTypeId":"ice_golem"}'

Notas importantes:

  - Si desafiar jefe devuelve power bajo, no es error: el jugador debe mejorar stats/equipo.
  - Los drops ahora se guardan en CharacterInventoryItem.
  - El frontend actual seguirá funcionando con /combat/kill, /idle/claim-offline, /zones, /character/me.
  - La próxima fase será actualizar el frontend para mostrar inventario/equipamiento.

Para producción Render:

  git add .
  git commit -m "Add backend boss drops inventory phase"
  git push

Render debería ejecutar npm install/postinstall. Si no aplica migraciones automáticamente, ejecuta en Render Shell:

  npx prisma migrate deploy
  npm run seed
