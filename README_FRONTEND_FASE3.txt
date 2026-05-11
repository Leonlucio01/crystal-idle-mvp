# Crystal Idle MVP - Fase 3 Frontend

Este paquete integra el cliente web con el backend de Fase 2.

## Archivos incluidos

- client/web-prototype/index.html
- client/web-prototype/styles.css
- client/web-prototype/app.js
- server/src/game/drops.js

Incluye una corrección pequeña en `server/src/game/drops.js` para que el backend devuelva `equippedSlot` al frontend. Sin eso, el cliente no puede saber qué items están equipados.

## Qué agrega esta fase

- Panel de inventario real.
- Panel de equipo con slots: arma, armadura, casco, botas y amuleto.
- Filtros de inventario: todo, armas, armadura, materiales y cofres.
- Botones para equipar items.
- Botones para vender items no equipados.
- Drops de combate conectados al inventario real.
- Drops offline visibles y guardados.
- Zonas usando el estado `locked/unlocked` del backend.
- Mejor compatibilidad para probar localmente.

## Importante sobre la API

Si abres `client/web-prototype/index.html` como archivo local, el frontend usará automáticamente:

http://localhost:3000

Si lo sirves desde web o después lo subes a producción, usará por defecto:

https://crystal-idle-api.onrender.com

Puedes cambiar la API manualmente desde la consola del navegador:

localStorage.setItem("crystal_idle_api_url", "http://localhost:3000")

Para volver al valor automático:

localStorage.removeItem("crystal_idle_api_url")

## Instalación

1. Descomprime este ZIP en la raíz del proyecto `crystal-idle-mvp`.
2. Acepta reemplazar archivos.
3. En una terminal:

cd server
npx prisma generate
npm run dev

4. Abre:

client/web-prototype/index.html

5. Inicia sesión y prueba:

- atacar enemigos;
- conseguir drops;
- ver inventario;
- equipar items;
- vender items;
- reclamar offline;
- desafiar jefe.

## Para subir a Render

Después de probar local:

git add .
git commit -m "Add frontend inventory and equipment phase 3"
git push

Luego espera el redeploy de Render.
