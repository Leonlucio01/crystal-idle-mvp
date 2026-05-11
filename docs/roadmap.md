# Roadmap

## Phase 0 - Project Setup

Objetivo: preparar repo, documentos y estructura.

Tareas:

- Crear repositorio en GitHub
- Crear carpetas base
- Crear documentación inicial
- Elegir motor del cliente
- Elegir stack del backend
- Definir MVP

Resultado:

```txt
Repo organizado y listo para iniciar desarrollo.
```

## Phase 1 - Backend MVP

Objetivo: crear API básica para guardar progreso.

Tareas:

- Crear proyecto Node.js
- Instalar Express
- Instalar Prisma
- Configurar PostgreSQL
- Crear modelo User
- Crear modelo Character
- Crear login/register
- Crear endpoint para ver personaje
- Crear endpoint para mejorar stats
- Crear endpoint para ranking

Resultado:

```txt
Backend funcional con autenticación y personaje guardado en base de datos.
```

## Phase 2 - Combat MVP

Objetivo: crear lógica de combate idle en backend.

Tareas:

- Crear enemy types
- Crear fórmula de daño
- Crear endpoint /combat/attack
- Crear recompensas de XP y oro
- Crear level up
- Crear boss básico
- Registrar logs básicos

Resultado:

```txt
El jugador puede atacar enemigos y recibir recompensas validadas por servidor.
```

## Phase 3 - Offline Rewards

Objetivo: calcular recompensas cuando el jugador vuelve al juego.

Tareas:

- Guardar lastLogoutAt
- Calcular tiempo offline
- Limitar máximo offline a 8 horas
- Calcular kills estimadas
- Entregar XP y oro
- Guardar historial de recompensas

Resultado:

```txt
Sistema idle real funcionando desde el backend.
```

## Phase 4 - Client Prototype

Objetivo: conectar cliente visual al backend.

Tareas:

- Crear escena inicial
- Crear avatar
- Crear enemigo
- Crear UI de stats
- Conectar login
- Conectar personaje
- Conectar ataque
- Mostrar daño y recompensas
- Botones de upgrade

Resultado:

```txt
Primera versión jugable.
```

## Phase 5 - Render Deployment

Objetivo: subir backend y base de datos a Render.

Tareas:

- Crear PostgreSQL en Render
- Crear Web Service en Render
- Configurar variables de entorno
- Ejecutar migraciones Prisma
- Probar API pública
- Conectar cliente a API pública

Resultado:

```txt
Backend online accesible para el cliente.
```

## Phase 6 - Online Features

Objetivo: agregar sensación online.

Tareas:

- Ranking global
- Presencia simple
- Chat opcional
- Boss diario
- Eventos básicos

Resultado:

```txt
El juego empieza a sentirse online.
```

## Future Phases

- Inventario
- Equipo
- Rarezas
- Drops
- Mascotas
- Monturas
- Alas
- Dungeons
- Guilds
- PvP asíncrono
- Rebirth / Ascension
- Tienda
