# API Design

## Base URL

Local:

```txt
http://localhost:3000
```

Render:

```txt
https://your-service-name.onrender.com
```

## Auth

La API usará JWT.

Header:

```txt
Authorization: Bearer TOKEN
```

## Endpoints

## Auth

### POST /auth/register

Crea una cuenta.

Body:

```json
{
  "email": "player@example.com",
  "password": "123456",
  "characterName": "Hero"
}
```

Response:

```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "player@example.com"
  },
  "character": {
    "id": "uuid",
    "name": "Hero"
  }
}
```

### POST /auth/login

Inicia sesión.

Body:

```json
{
  "email": "player@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "jwt_token"
}
```

## Character

### GET /character/me

Obtiene el personaje del usuario autenticado.

Response:

```json
{
  "id": "uuid",
  "name": "Hero",
  "level": 1,
  "xp": 0,
  "gold": 0,
  "atk": 10,
  "def": 3,
  "maxHp": 100,
  "currentHp": 100,
  "critChance": 0.05,
  "critDamage": 1.5,
  "power": 100
}
```

### POST /character/upgrade-stat

Mejora un stat.

Body:

```json
{
  "stat": "ATK"
}
```

Stats válidos:

```txt
ATK
DEF
HP
CRIT
```

Response:

```json
{
  "success": true,
  "stat": "ATK",
  "newValue": 11,
  "gold": 90,
  "nextCost": 13
}
```

## Combat

### POST /combat/attack

Ataca un enemigo de la zona actual.

Body:

```json
{
  "enemyTypeId": "green_slime"
}
```

Response:

```json
{
  "damage": 10,
  "isCrit": false,
  "enemyKilled": true,
  "goldEarned": 3,
  "xpEarned": 10,
  "character": {
    "level": 1,
    "xp": 10,
    "gold": 3
  }
}
```

### POST /combat/boss

Ataca o resuelve combate contra boss.

Body:

```json
{
  "bossId": "slime_king"
}
```

Response:

```json
{
  "success": true,
  "bossKilled": true,
  "goldEarned": 60,
  "xpEarned": 150
}
```

## Idle

### POST /idle/claim-offline

Reclama recompensas offline.

Response:

```json
{
  "secondsOffline": 3600,
  "kills": 120,
  "goldEarned": 360,
  "xpEarned": 1200
}
```

## Zones

### GET /zones

Lista zonas.

Response:

```json
[
  {
    "id": "crystal_forest",
    "name": "Crystal Forest",
    "requiredLevel": 1
  }
]
```

### POST /zones/change

Cambia de zona.

Body:

```json
{
  "zoneId": "crystal_forest"
}
```

Response:

```json
{
  "success": true,
  "currentZoneId": "crystal_forest"
}
```

## Leaderboard

### GET /leaderboard/power

Ranking por poder.

Response:

```json
[
  {
    "rank": 1,
    "name": "Hero",
    "level": 10,
    "power": 1500
  }
]
```
