# Crystal Idle Web V2

Cliente web standalone para Crystal Idle.

## Contenido

- `index.html`: app completa en un solo archivo.
- Se conecta a la API online: `https://crystal-idle-api.onrender.com`.
- No usa dependencias externas.
- No usa assets pagos.

## Como usar

Puedes abrir `index.html` directamente en el navegador.

Recomendado:
- Copiar esta carpeta a `client/web-app/` o reemplazar tu `client/web-prototype/`.
- Abrir con Live Server o doble clic.

## Funcionalidad incluida

- Login
- Register
- Token en localStorage
- Carga de personaje
- Zonas
- Cambio de zona
- Enemigos por zona
- Ataque / kill
- Auto Farm simple desde frontend
- Upgrades con deteccion flexible de endpoints
- Ranking con deteccion flexible de endpoints
- Diseno responsive estilo idle RPG

## Nota sobre upgrades/ranking

El frontend intenta varios endpoints posibles para upgrades/ranking. Si tu backend tiene rutas diferentes, ajusta las funciones `upgrade()` y `loadRanking()` dentro de `index.html`.
