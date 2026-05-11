# Client Web Prototype - Upgrade Costs Fixed

Esta versión corrige el bloqueo de upgrades después de matar enemigos o subir stats.

## Corrección importante

Algunos endpoints como `/combat/kill` y `/character/upgrade-stat` devuelven el personaje actualizado, pero no siempre devuelven la lista `upgrades`.  
Por eso el cliente ahora vuelve a consultar `/character/me` después de acciones importantes.

## Funciones

- Registro
- Login
- Ver personaje
- Matar enemigo
- Auto Farm
- Barra de HP del enemigo
- Daño flotante
- Recompensa flotante
- Mostrar costo de upgrades
- Desactivar upgrades si no hay oro suficiente
- Reclamar offline
- Ranking
