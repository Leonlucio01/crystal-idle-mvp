# Ejecutar este script dentro de la carpeta del repo crystal-idle-mvp

New-Item -ItemType Directory -Force -Path client, server, docs, assets-references | Out-Null

@'
# Crystal Idle MVP

MVP de juego idle RPG online inspirado en juegos de fantasía tipo MU Online, Legend of Angel, Crystal Saga Idle y RPGs idle modernos.

## Objetivo

Crear un juego online donde el jugador controla un avatar que combate automáticamente contra monstruos, gana oro, XP y cristales, mejora sus estadísticas y desbloquea zonas, bosses y sistemas de progresión.

## Stack propuesto

- Cliente: Unity, Godot o WebGL
- Backend: Node.js + Express + Prisma
- Base de datos: PostgreSQL
- Deploy: Render
'@ | Set-Content -Encoding UTF8 README.md
