# Crystal Idle MVP - Arquitectura tecnica actual

**Proyecto:** Crystal Idle MVP  
**Tipo:** Juego web online idle RPG  
**Estado:** MVP web funcional con backend Node/Express/Prisma, PostgreSQL en Render y cliente web prototipo redisenado.  
**Objetivo actual:** evolucionar el prototipo hacia un juego web completo con progresion, zonas, jefes, drops, inventario, equipo, recompensas offline y ranking.

---

## 1. Resumen general

Crystal Idle esta estructurado como una aplicacion web cliente-servidor:

```text
Cliente web HTML/CSS/JS
        |
        | HTTP/REST + JSON
        v
Backend Node.js + Express
        |
        | Prisma ORM
        v
PostgreSQL Render
```

La version actual tiene tres capas principales:

1. **Frontend web:** ubicado en `client/web-prototype/`.
2. **Backend API:** ubicado en `server/src/`.
3. **Base de datos:** definida con Prisma en `server/prisma/schema.prisma`.

El backend es la fuente de verdad para autenticacion, personaje, combate, zonas, drops, inventario, upgrades, recompensas offline y ranking.

---

## 2. Estructura principal del proyecto

```text
crystal-idle-mvp/
  client/
    web-prototype/
      index.html
      styles.css
      app.js
      README.md

  docs/
    api.md
    combat.md
    database.md
    game-design.md
    references.md
    roadmap.md

  server/
    package.json
    .env
    prisma/
      schema.prisma
      seed.js
      migrations/
        20260511051307_init_postgres/
        20260511120000_game_foundation_schema/

    src/
      server.js
      utils/
        prisma.js
      middleware/
        auth.middleware.js
      game/
        progression.js
        drops.js
      routes/
        auth.routes.js
        character.routes.js
        combat.routes.js
        idle.routes.js
        inventory.routes.js
        leaderboard.routes.js
        zone.routes.js

  render.yaml
  README.md
```

---

## 3. Stack tecnico

### Backend

```text
Node.js
Express 5
Prisma ORM
PostgreSQL
JWT
bcrypt
cors
dotenv
nodemon
```

Archivo principal:

```text
server/src/server.js
```

Scripts importantes:

```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "prisma:migrate": "prisma migrate dev",
  "prisma:deploy": "prisma migrate deploy",
  "prisma:studio": "prisma studio",
  "seed": "node prisma/seed.js",
  "postinstall": "prisma generate"
}
```

### Frontend

Actualmente el cliente es un prototipo web simple:

```text
HTML
CSS
JavaScript vanilla
Fetch API
LocalStorage para token JWT
```

No usa React todavia. Esto permite iterar rapido, pero a medida que crezca el juego probablemente convendra migrar a React/Vite.

### Base de datos

```text
PostgreSQL en Render
Prisma schema
Migraciones Prisma
Seed con datos iniciales del juego
```

---

## 4. Backend: arquitectura actual

### 4.1 Punto de entrada

Archivo:

```text
server/src/server.js
```

Responsabilidades:

- cargar variables de entorno con `dotenv`;
- inicializar Express;
- habilitar CORS;
- habilitar JSON body parser;
- registrar rutas de API;
- exponer `/` y `/health`;
- iniciar servidor en `process.env.PORT || 3000`.

Rutas montadas actualmente:

```js
app.use("/zones", zoneRoutes);
app.use("/auth", authRoutes);
app.use("/character", characterRoutes);
app.use("/combat", combatRoutes);
app.use("/idle", idleRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/leaderboard", leaderboardRoutes);
```

Endpoints base:

```text
GET /       -> estado basico de la API
GET /health -> health check
```

---

## 5. Rutas del backend

## 5.1 Auth

Archivo:

```text
server/src/routes/auth.routes.js
```

Endpoints:

```text
POST /auth/register
POST /auth/login
```

### POST /auth/register

Crea un usuario, hashea password, crea personaje inicial y genera progreso inicial por zonas.

Body esperado:

```json
{
  "email": "player@example.com",
  "password": "123456",
  "characterName": "ProdHero"
}
```

Responsabilidades:

- validar email, password y nombre de personaje;
- evitar email duplicado;
- buscar primera zona disponible;
- crear usuario;
- crear personaje;
- crear upgrades base;
- crear progreso por zonas;
- devolver token JWT.

### POST /auth/login

Valida credenciales y devuelve token JWT.

Body esperado:

```json
{
  "email": "player@example.com",
  "password": "123456"
}
```

Respuesta incluye:

```text
token
user
character
```

---

## 5.2 Character

Archivo:

```text
server/src/routes/character.routes.js
```

Endpoints principales:

```text
GET  /character/me
POST /character/change-zone
POST /character/upgrade-stat
```

### GET /character/me

Devuelve el personaje autenticado con:

```text
upgrades
zona actual
enemigos de zona actual
inventario
progreso por zonas
```

Tambien asegura que exista progreso por zona para el personaje.

### POST /character/change-zone

Cambia la zona actual del personaje.

Body esperado:

```json
{
  "zoneId": "crystal-forest"
}
```

Validaciones esperadas:

- usuario autenticado;
- personaje existente;
- zona existente;
- zona desbloqueada segun progreso/nivel.

### POST /character/upgrade-stat

Compra una mejora de stat.

Body esperado:

```json
{
  "stat": "ATK"
}
```

Stats soportados por enum:

```text
ATK
DEF
HP
CRIT
```

Responsabilidades:

- validar oro suficiente;
- incrementar stat;
- aumentar nivel de upgrade;
- recalcular costo;
- recalcular poder.

---

## 5.3 Combat

Archivo:

```text
server/src/routes/combat.routes.js
```

Endpoints:

```text
POST /combat/attack
POST /combat/kill
POST /combat/challenge-boss
```

### POST /combat/attack

Combate normal con calculo de dano. Si el dano mata al enemigo, aplica recompensa.

Body esperado:

```json
{
  "enemyTypeId": "enemy-id"
}
```

Flujo:

```text
Validar token
Buscar personaje
Buscar enemigo
Validar que el enemigo esta en la zona actual
Calcular dano y critico
Si no muere: registrar CombatLog sin recompensa
Si muere: oro, XP, drops, CombatLog y actualizacion del personaje
```

### POST /combat/kill

Endpoint MVP para matar enemigo directamente. Es el que usa el frontend actual para el Auto Farm.

Body esperado:

```json
{
  "enemyTypeId": "enemy-id"
}
```

Flujo:

```text
Validar enemigo normal
Aplicar recompensa directa
Generar drops
Guardar drops en inventario
Actualizar personaje
Actualizar progreso de zona
Crear CombatLog
```

### POST /combat/challenge-boss

Endpoint para derrotar jefe de zona.

Body esperado:

```json
{
  "enemyTypeId": "boss-id"
}
```

Validaciones:

```text
El enemigo debe existir
Debe estar en la zona actual
Debe ser jefe
El personaje debe tener poder suficiente
El score estimado del jugador debe superar al score del jefe
```

Si gana:

```text
recibe oro
recibe XP
recibe diamantes
puede recibir drops
incrementa bossKills
desbloquea siguiente zona
actualiza CharacterZoneProgress
crea CombatLog
```

Si pierde:

```text
no desbloquea zona
retorna recomendacion de mejora
```

---

## 5.4 Idle / Offline rewards

Archivo:

```text
server/src/routes/idle.routes.js
```

Endpoint:

```text
POST /idle/claim-offline
```

Responsabilidades:

- calcular segundos offline desde `lastLogoutAt`;
- limitar offline maximo a 8 horas;
- seleccionar enemigo normal de la zona actual;
- calcular kills aproximadas por DPS;
- calcular oro y XP;
- simular drops hasta un maximo de 200 kills para evitar carga excesiva;
- guardar drops en inventario;
- actualizar personaje;
- crear registro en `OfflineReward`;
- actualizar progreso de zona.

Constantes actuales:

```js
MAX_OFFLINE_SECONDS = 8 * 60 * 60;
MAX_OFFLINE_DROP_SIM_KILLS = 200;
```

---

## 5.5 Inventory

Archivo:

```text
server/src/routes/inventory.routes.js
```

Endpoints:

```text
GET  /inventory
POST /inventory/equip
POST /inventory/sell
```

### GET /inventory

Devuelve:

```text
items
equipped
```

### POST /inventory/equip

Equipa un item.

Body esperado:

```json
{
  "inventoryItemId": "inventory-item-id"
}
```

Flujo:

```text
Validar item
Validar que tenga slot equipable
Desequipar item anterior del mismo slot
Equipar nuevo item
Recalcular poder
Retornar personaje actualizado
```

Slots soportados:

```text
WEAPON
ARMOR
HELMET
BOOTS
AMULET
```

### POST /inventory/sell

Vende item por oro.

Body esperado:

```json
{
  "inventoryItemId": "inventory-item-id",
  "quantity": 1
}
```

Reglas:

- no se puede vender un item equipado;
- si es stackable y queda cantidad, reduce quantity;
- si llega a cero, elimina el registro;
- suma oro al personaje.

---

## 5.6 Zones

Archivo:

```text
server/src/routes/zone.routes.js
```

Endpoint:

```text
GET /zones
```

Devuelve las zonas activas ordenadas por `orderIndex`.

Si se envia token JWT, tambien marca:

```text
unlocked
locked
isCurrent
progress
```

La ruta usa token opcional: puede devolver zonas publicas sin login, pero con login devuelve estado personalizado del jugador.

---

## 5.7 Leaderboard

Archivo:

```text
server/src/routes/leaderboard.routes.js
```

Endpoint:

```text
GET /leaderboard/power
```

Devuelve top 50 jugadores ordenados por:

```text
power desc
level desc
xp desc
```

Campos principales:

```text
rank
name
class
level
xp
gold
atk
def
maxHp
critChance
power
totalKills
bossKills
maxZoneOrderUnlocked
currentZone
updatedAt
```

---

## 6. Middleware y utilidades

### 6.1 Auth middleware

Archivo:

```text
server/src/middleware/auth.middleware.js
```

Responsabilidad:

- leer header `Authorization: Bearer <token>`;
- verificar JWT;
- adjuntar usuario a `req.user`;
- bloquear rutas protegidas si no hay token valido.

### 6.2 Prisma client

Archivo:

```text
server/src/utils/prisma.js
```

Contenido:

```js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = prisma;
```

Centraliza la instancia de Prisma.

---

## 7. Logica de juego

## 7.1 Progression

Archivo:

```text
server/src/game/progression.js
```

Responsabilidades:

- calcular XP requerida por nivel;
- aplicar XP y detectar subidas de nivel;
- aplicar bonos por level up;
- calcular poder total;
- sumar bonos de equipo;
- calcular stats efectivos;
- construir actualizacion del personaje despues de recibir recompensas.

Funciones principales:

```js
getXpRequired(level)
applyXp(character, xpEarned)
getLevelBonuses(levelsGained)
calculatePower(stats)
sumEquipmentBonuses(inventory)
getEffectiveStats(character)
buildCharacterUpdateAfterRewards(character, xpEarned, goldEarned, extra)
```

Formula actual de XP:

```js
Math.floor(100 * Math.pow(level, 1.5))
```

Formula actual de poder:

```js
atk * 5 + def * 4 + maxHp + critChance * 1000
```

Bonos por level up:

```text
+10 HP por nivel
+2 ATK por nivel
+1 DEF por nivel
```

---

## 7.2 Drops

Archivo:

```text
server/src/game/drops.js
```

Responsabilidades:

- tirar probabilidad de drops;
- fusionar drops stackables;
- guardar drops en inventario;
- serializar drops para el frontend;
- resumir drops repetidos.

Funciones principales:

```js
rollDrops(enemy, killCount, options)
grantDrops(tx, characterId, drops)
serializeDrop(inventoryItem)
summarizeDrops(drops)
```

Flujo de drops:

```text
EnemyType tiene EnemyDrop[]
EnemyDrop apunta a ItemDefinition
rollDrops decide que cae
grantDrops crea o actualiza CharacterInventoryItem
summarizeDrops devuelve resumen legible al frontend
```

---

## 8. Base de datos

Archivo principal:

```text
server/prisma/schema.prisma
```

Datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Enums actuales:

```text
CharacterClass
UpgradeStat
ItemType
ItemRarity
EquipmentSlot
```

### 8.1 User

Representa la cuenta del jugador.

Campos clave:

```text
id
email
passwordHash
character
createdAt
updatedAt
```

Relacion:

```text
User 1 -> 0/1 Character
```

---

### 8.2 Character

Representa el personaje jugable.

Campos clave:

```text
userId
name
class
level
xp
gold
diamonds
atk
def
maxHp
currentHp
critChance
critDamage
attackSpeed
power
totalKills
bossKills
maxZoneOrderUnlocked
currentZoneId
lastLogoutAt
lastActiveAt
```

Relaciones:

```text
Character -> User
Character -> Zone actual
Character -> StatUpgrade[]
Character -> CombatLog[]
Character -> OfflineReward[]
Character -> CharacterInventoryItem[]
Character -> CharacterZoneProgress[]
```

---

### 8.3 Zone

Define una zona del juego.

Campos clave:

```text
id
name
description
orderIndex
requiredLevel
requiredPower
xpMultiplier
goldMultiplier
isActive
```

Relaciones:

```text
Zone -> EnemyType[]
Zone -> ItemDefinition[]
Zone -> CharacterZoneProgress[]
```

Uso actual:

- ordenar progresion del juego;
- contener enemigos normales y jefe;
- controlar requisitos de desbloqueo;
- relacionar drops con zona origen.

---

### 8.4 EnemyType

Define enemigos normales y jefes.

Campos clave:

```text
zoneId
name
level
sortOrder
maxHp
atk
def
xpReward
goldReward
isBoss
powerRecommended
```

Relaciones:

```text
EnemyType -> Zone
EnemyType -> EnemyDrop[]
EnemyType -> CombatLog[]
```

Uso actual:

- enemigos normales para Auto Farm;
- jefes para desbloquear zonas;
- fuente de recompensas y drops.

---

### 8.5 ItemDefinition

Catalogo maestro de items.

Campos clave:

```text
id
name
description
type
rarity
slot
stackable
atk
def
maxHp
critChance
goldBonus
xpBonus
autoFarmSpeed
sellGold
sourceZoneId
```

Tipos soportados:

```text
WEAPON
ARMOR
HELMET
BOOTS
AMULET
MATERIAL
CHEST
```

Rarezas:

```text
COMMON
RARE
EPIC
LEGENDARY
MYTHIC
```

---

### 8.6 EnemyDrop

Relacion entre enemigo e item que puede caer.

Campos clave:

```text
enemyTypeId
itemDefinitionId
dropChance
minQuantity
maxQuantity
```

Uso:

```text
Cada enemigo tiene una tabla de loot.
Cada item puede tener probabilidad y cantidad minima/maxima.
```

---

### 8.7 CharacterInventoryItem

Inventario real del jugador.

Campos clave:

```text
characterId
itemDefinitionId
quantity
equippedSlot
atk
def
maxHp
critChance
goldBonus
xpBonus
autoFarmSpeed
acquiredAt
updatedAt
```

Nota importante:

Los stats del item se copian al inventario cuando cae. Esto permite que en el futuro un mismo `ItemDefinition` pueda generar variaciones individuales si se desea.

---

### 8.8 CharacterZoneProgress

Progreso de un personaje por zona.

Campos clave:

```text
characterId
zoneId
unlocked
enemiesKilled
bossDefeated
bossKills
lastBossDefeatedAt
```

Uso:

- saber que zonas estan desbloqueadas;
- contar enemigos derrotados por zona;
- saber si el jefe fue derrotado;
- desbloquear siguiente zona.

---

### 8.9 StatUpgrade

Mejoras comprables con oro.

Campos clave:

```text
characterId
stat
level
baseCost
currentCost
```

Stats:

```text
ATK
DEF
HP
CRIT
```

---

### 8.10 CombatLog

Historial de acciones de combate.

Campos clave:

```text
characterId
enemyTypeId
damage
isCrit
enemyKilled
goldEarned
xpEarned
dropsJson
createdAt
```

Uso:

- auditar combate;
- guardar recompensa obtenida;
- posible historial futuro en UI.

---

### 8.11 OfflineReward

Historial de recompensas offline reclamadas.

Campos clave:

```text
characterId
secondsOffline
kills
goldEarned
xpEarned
dropsJson
claimedAt
```

Uso:

- guardar sesiones offline;
- auditar recompensas;
- mostrar historial futuro.

---

## 9. Frontend actual

Ruta:

```text
client/web-prototype/
```

Archivos:

```text
index.html
styles.css
app.js
```

### 9.1 index.html

Define la estructura visual del juego:

```text
Topbar con recursos
Panel de cuenta/login
Panel de personaje
Panel de combate
Panel de jefe
Panel de actividad
Panel de zonas
Panel de upgrades
Panel de drops recientes
Panel de ranking
Modal de recompensas offline
```

### 9.2 styles.css

Define el rediseño visual:

```text
tema oscuro RPG
cards/panels
barras de HP y XP
botones de accion
layout responsive base
modal offline
drops por rareza
registro de actividad
```

### 9.3 app.js

Controla la interaccion con la API.

Estado global actual:

```js
let token = localStorage.getItem("crystal_idle_token") || "";
let character = null;
let selectedEnemy = null;
let zones = [];
let recentDrops = [];
let autoFarmEnabled = false;
```

Funciones principales:

```text
api()
login()
register()
loadCharacter()
loadZones()
renderCharacter()
renderZones()
killEnemy()
challengeBoss()
toggleAutoFarm()
claimOffline()
upgrade()
loadLeaderboard()
```

### 9.4 API URL actual

Actualmente `app.js` tiene:

```js
const API_URL = "https://crystal-idle-api.onrender.com";
```

Esto significa que el frontend apunta por defecto a Render, no a localhost. Para pruebas locales del backend, se debe cambiar temporalmente a:

```js
const API_URL = "http://localhost:3000";
```

Recomendacion: agregar deteccion automatica:

```js
const API_URL = location.protocol === "file:"
  ? "http://localhost:3000"
  : "https://crystal-idle-api.onrender.com";
```

O usar un archivo de configuracion separado para dev/prod.

---

## 10. Flujo principal del juego

### 10.1 Login

```text
Jugador ingresa email/password
Frontend llama POST /auth/login
Backend valida bcrypt
Backend genera JWT
Frontend guarda token en localStorage
Frontend carga /character/me
```

### 10.2 Registro

```text
Jugador ingresa email/password/nombre
Frontend llama POST /auth/register
Backend crea User + Character + upgrades + progreso de zonas
Backend devuelve token
Frontend guarda token
Frontend carga personaje
```

### 10.3 Combate normal

```text
Jugador selecciona enemigo normal
Frontend llama POST /combat/kill
Backend valida zona actual
Backend calcula recompensa
Backend tira drops
Backend guarda drops en inventario
Backend actualiza XP/oro/nivel/stats/poder
Frontend actualiza personaje, log y drops recientes
```

### 10.4 Auto Farm

```text
Jugador activa Auto Farm
Frontend ejecuta un ciclo cada 2 segundos
Cada ciclo llama POST /combat/kill
Se actualizan recompensas y personaje
```

Nota: el Auto Farm actual vive en el frontend. Si el usuario cierra la pagina, el progreso continuo se maneja por el sistema offline.

### 10.5 Jefe de zona

```text
Jugador presiona Desafiar jefe
Frontend llama POST /combat/challenge-boss
Backend valida poder y score
Si gana: recompensa, drops, diamantes, bossKills y desbloqueo de zona
Frontend recarga personaje y ranking
```

### 10.6 Offline rewards

```text
Jugador presiona Reclamar offline
Frontend llama POST /idle/claim-offline
Backend calcula tiempo desde lastLogoutAt
Backend calcula kills/oro/XP/drops
Backend guarda recompensa e inventario
Frontend muestra modal offline
```

### 10.7 Inventario/equipo

Backend ya expone inventario y equipamiento:

```text
GET /inventory
POST /inventory/equip
POST /inventory/sell
```

La UI de inventario debe consolidarse en la siguiente iteracion si todavia no esta integrada completamente en el HTML actual.

---

## 11. Seed y datos iniciales

Archivo:

```text
server/prisma/seed.js
```

Responsabilidades esperadas:

- crear zonas;
- crear enemigos normales;
- crear jefes;
- crear items;
- crear tablas de drops;
- dejar datos base para probar progresion.

Comando:

```cmd
cd server
npm run seed
```

---

## 12. Migraciones

Migraciones actuales:

```text
server/prisma/migrations/20260511051307_init_postgres/
server/prisma/migrations/20260511120000_game_foundation_schema/
```

Comandos utiles:

### Desarrollo local

```cmd
cd server
npx prisma migrate dev
npx prisma generate
npm run seed
npm run dev
```

### Produccion Render

```cmd
cd server
npx prisma migrate deploy
npx prisma generate
npm run seed
npm start
```

Nota: en produccion se recomienda usar `prisma migrate deploy`, no `migrate dev`.

---

## 13. Variables de entorno

Archivo local:

```text
server/.env
```

Variables necesarias:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
PORT=3000
```

Recomendaciones:

- no subir `.env` real a GitHub;
- configurar `DATABASE_URL` y `JWT_SECRET` en Render;
- usar secretos fuertes para JWT;
- mantener base de datos dev y prod separadas cuando el proyecto crezca.

---

## 14. Deployment actual

Backend desplegado en Render:

```text
https://crystal-idle-api.onrender.com
```

Base de datos:

```text
PostgreSQL en Render
Schema: game
```

Frontend actual:

```text
client/web-prototype/index.html
```

Puede abrirse como archivo local o servirse con un servidor estatico.

Para servirlo localmente:

```cmd
cd client\web-prototype
npx serve .
```

---

## 15. Estado actual funcional

Funciones ya presentes o preparadas:

```text
Login
Registro
Carga de personaje
Zonas
Cambio de zona
Combate normal
Auto Farm frontend
Reclamar offline
Upgrades
Ranking por poder
Jefes por zona
Desbloqueo de zonas
Drops reales en backend
Inventario backend
Equipar items backend
Vender items backend
```

---

## 16. Puntos tecnicos importantes

### 16.1 Backend es la fuente de verdad

La logica importante debe vivir en backend:

```text
recompensas
XP
level up
drops
equipamiento
poder
desbloqueo de zonas
ranking
```

El frontend solo debe mostrar y solicitar acciones.

### 16.2 Drops ya son persistentes

Los drops no deberian quedarse solo como log visual. La arquitectura actual ya permite guardarlos en:

```text
CharacterInventoryItem
```

### 16.3 Equipo afecta poder

Cuando se equipa un item, el backend recalcula `power` usando stats base + stats de equipo.

### 16.4 Offline limitado

El offline esta limitado a 8 horas para evitar abuso y mantener balance.

### 16.5 Auto Farm actual es frontend-driven

El Auto Farm actual depende de timers del navegador. Esto esta bien para MVP, pero a futuro se puede mover a un modelo mas robusto usando timestamps y calculos server-side.

---

## 17. Riesgos y mejoras tecnicas pendientes

### 17.1 API URL hardcodeada

Problema:

```js
const API_URL = "https://crystal-idle-api.onrender.com";
```

Riesgo:

- dificulta probar backend local;
- puede mezclar datos locales y produccion.

Solucion recomendada:

```js
const API_URL = window.CRYSTAL_IDLE_API_URL || "http://localhost:3000";
```

O migrar a Vite con `.env`:

```text
VITE_API_URL=http://localhost:3000
```

### 17.2 Frontend vanilla crecera demasiado

El archivo `app.js` ya concentra muchas responsabilidades:

```text
estado global
llamadas API
render UI
combate
autofarm
zonas
ranking
offline
```

Recomendacion futura:

```text
Migrar a React + Vite
Separar componentes
Separar cliente API
Separar estado del juego
```

### 17.3 Balance todavia esta embebido

Parte del balance vive en rutas y funciones JS.

Recomendacion:

```text
server/src/game/balance.js
```

Centralizar:

```text
formula XP
formula poder
costos upgrades
offline cap
drop tuning
boss score
```

### 17.4 Falta sistema de sesiones/logout

El offline usa `lastLogoutAt`, pero actualmente no hay endpoint claro de logout o heartbeat.

Recomendacion:

```text
POST /auth/logout
POST /character/heartbeat
```

Asi se puede calcular offline de forma mas precisa.

### 17.5 Inventario frontend debe reforzarse

Backend ya tiene inventario, equipar y vender. El frontend debe mostrar:

```text
lista de items
filtros por tipo/rareza
slots equipados
comparacion de stats
botones equipar/vender
```

---

## 18. Roadmap tecnico recomendado

### Fase 3.1 - Frontend de inventario completo

```text
Mostrar inventario persistente
Mostrar equipo equipado
Equipar item desde UI
Vender item desde UI
Actualizar poder en vivo
Mostrar rarezas visuales
```

### Fase 3.2 - Mejoras de zonas y jefes

```text
Mostrar zonas bloqueadas segun backend
Mostrar requisito de poder real
Mostrar bossDefeated
Mostrar recompensa posible por zona
Mostrar drops posibles por zona
```

### Fase 3.3 - Mejorar offline

```text
Crear endpoint de logout/heartbeat
Actualizar lastActiveAt periodicamente
Mostrar drops offline persistentes
Mostrar historial de offline rewards
```

### Fase 3.4 - Misiones y logros

Tablas futuras sugeridas:

```text
MissionDefinition
CharacterMissionProgress
AchievementDefinition
CharacterAchievementProgress
```

### Fase 3.5 - Migracion frontend profesional

```text
React + Vite
Componentes
Rutas internas
Estado centralizado
Cliente API separado
Build deployable
```

---

## 19. Arquitectura futura sugerida

### Backend futuro

```text
server/src/
  app.js
  server.js
  config/
    env.js
  middleware/
    auth.middleware.js
    error.middleware.js
  modules/
    auth/
      auth.routes.js
      auth.service.js
    character/
      character.routes.js
      character.service.js
    combat/
      combat.routes.js
      combat.service.js
    inventory/
      inventory.routes.js
      inventory.service.js
    zones/
      zone.routes.js
      zone.service.js
    idle/
      idle.routes.js
      idle.service.js
  game/
    balance.js
    formulas.js
    drops.js
    progression.js
```

### Frontend futuro

```text
client/web/
  src/
    api/
      client.js
      authApi.js
      characterApi.js
      combatApi.js
      inventoryApi.js
    components/
      CharacterPanel.jsx
      CombatPanel.jsx
      BossPanel.jsx
      InventoryPanel.jsx
      EquipmentPanel.jsx
      ZoneList.jsx
      UpgradePanel.jsx
      RankingTable.jsx
      OfflineModal.jsx
    pages/
      LoginPage.jsx
      GamePage.jsx
    state/
      gameStore.js
    styles/
      theme.css
```

---

## 20. Comandos rapidos

### Instalar dependencias

```cmd
cd server
npm install
```

### Generar Prisma Client

```cmd
npx prisma generate
```

### Aplicar migraciones en desarrollo

```cmd
npx prisma migrate dev
```

### Ejecutar seed

```cmd
npm run seed
```

### Levantar backend local

```cmd
npm run dev
```

### Probar health

```powershell
Invoke-RestMethod http://localhost:3000/health
```

### Probar login

```powershell
Invoke-RestMethod -Uri http://localhost:3000/auth/login -Method POST -ContentType "application/json" -Body '{"email":"prodtest@example.com","password":"123456"}'
```

---

## 21. Conclusion tecnica

La arquitectura actual ya paso de prototipo basico a una base razonable para un idle RPG web:

```text
Base de datos preparada para progresion RPG
Backend modular por rutas
Sistema de drops persistente
Inventario y equipo en backend
Zonas y jefes modelados
Offline rewards con recompensas
Ranking por poder
Frontend visual tipo juego
```

El siguiente paso mas importante es consolidar el frontend de inventario/equipo y ajustar la configuracion de API local/produccion. Despues conviene agregar misiones diarias, logros y un sistema mas robusto de actividad/offline.
