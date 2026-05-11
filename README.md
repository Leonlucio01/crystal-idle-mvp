# Crystal Idle MVP

MVP de juego idle RPG online inspirado en juegos de fantasía tipo MU Online, Legend of Angel, Crystal Saga Idle y RPGs idle modernos.

## Objetivo

Crear un juego online donde el jugador controla un avatar que combate automáticamente contra monstruos, gana oro, XP y cristales, mejora sus estadísticas y desbloquea zonas, bosses y sistemas de progresión.

## Stack propuesto

### Cliente

- Unity, Godot o WebGL
- Estilo visual: fantasy stylized 3D
- Auto-combate visual
- UI de stats, oro, XP, upgrades y recompensas

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT para autenticación
- Deploy en Render

### Base de datos

- Render PostgreSQL para el MVP

## Estructura

```txt
crystal-idle-mvp/
  client/
  server/
  docs/
  assets-references/
```

## Primer objetivo jugable

El MVP debe incluir:

- Login
- Creación de personaje
- Una zona inicial
- Tres enemigos
- Un boss
- Auto-combate
- Oro
- XP
- Level up
- Upgrades de ATK, DEF, HP y CRIT
- Recompensas offline
- Ranking de poder
