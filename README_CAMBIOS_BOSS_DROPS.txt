CRYSTAL IDLE - CAMBIOS BOSS + DROPS MVP

Este paquete incluye solo archivos para reemplazar.

ARCHIVOS INCLUIDOS
- client/web-prototype/index.html
- client/web-prototype/styles.css
- client/web-prototype/app.js
- server/src/routes/combat.routes.js
- server/src/routes/character.routes.js
- server/src/routes/idle.routes.js

QUE AGREGA
1. Panel de Jefe de Zona en la pantalla de combate.
2. Boton "Desafiar jefe" separado del Auto Farm.
3. Auto Farm ahora farmea enemigos normales, no jefes.
4. Endpoint backend nuevo: POST /combat/challenge-boss.
5. Validacion de poder recomendado para derrotar jefes.
6. Recompensas especiales por jefe: oro x3, XP x2, diamantes y cofre/drop.
7. Drops visuales en combate normal.
8. Drops visuales en recompensas offline.
9. Panel "Drops recientes" en la web.
10. Cambio de zona exige derrotar el jefe de la zona anterior.

IMPORTANTE
- Los drops de este paquete son MVP visual: se muestran en la web, pero todavia NO se guardan en inventario.
- Para inventario persistente, el siguiente paso es agregar tablas Item, InventoryItem y Equipment en Prisma.
- Como el cliente apunta a https://crystal-idle-api.onrender.com, debes subir/redeployar tambien los archivos del backend en Render.

COMO INSTALAR
1. Descomprime este ZIP en la raiz de tu proyecto crystal-idle-mvp.
2. Acepta reemplazar archivos.
3. Sube los cambios a GitHub si Render despliega desde GitHub.
4. En Render, haz redeploy del backend.
5. Abre client/web-prototype/index.html o sirve el cliente con:

   cd client\web-prototype
   npx serve .

SI VAS A PROBAR BACKEND LOCAL
1. En server/.env asegúrate de tener DATABASE_URL y JWT_SECRET.
2. Ejecuta:

   cd server
   npm install
   npm run seed
   npm run dev

3. Si usas backend local, cambia en client/web-prototype/app.js:

   const API_URL = "https://crystal-idle-api.onrender.com";

   por:

   const API_URL = "http://localhost:3000";

