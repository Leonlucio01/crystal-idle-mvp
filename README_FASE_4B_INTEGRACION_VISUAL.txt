FASE 4B - Integracion visual frontend + clases iniciales

Archivos incluidos para reemplazar:

1) client/web-prototype/index.html
2) client/web-prototype/styles.css
3) client/web-prototype/app.js
4) server/src/routes/auth.routes.js

Que incluye:
- Logo real en header.
- Botones con iconos.
- Seleccion de clase inicial al registrar: Warrior, Mage, Ranger, Assassin.
- Backend de registro acepta characterClass.
- Stats iniciales diferentes por clase.
- Avatar del personaje segun clase.
- Fondo visual segun zona actual.
- Enemy sprite segun enemigo seleccionado.
- Boss art en panel de jefe.
- Iconos reales para inventario, equipo, drops y recompensas offline.
- Uso de paneles decorativos en UI.

Importante:
- No requiere migracion de base de datos porque Character.class ya existe y el enum ya contiene WARRIOR, MAGE, RANGER y ASSASSIN.
- Si ya tienes usuarios creados, esos personajes siguen con su clase actual.
- La seleccion de clase aplica para usuarios nuevos cuando se registran desde el frontend.

Pasos:
1) Copia/reemplaza los archivos en sus mismas rutas.
2) En server ejecuta:
   npm run dev
3) Abre client/web-prototype/index.html.
4) Registra un usuario nuevo y elige una clase para probar la nueva pantalla de seleccion.

Nota:
Si tu API de Render aun no tiene estos cambios del backend, el frontend local enviara characterClass pero Render lo ignorara hasta que subas el backend actualizado.
