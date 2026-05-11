# Crystal Idle Web V5

Corrección directa:

- La función `upgrade()` ya no llama a ningún endpoint.
- Los botones de upgrades solo muestran mensaje "Backend pendiente".
- Ya no debería aparecer `Cannot POST /upgrades/...`.
- Agrega marcador visible `v5` debajo del título.

Uso:
1. Reemplaza `client/web-prototype/index.html`.
2. Cierra completamente la pestaña anterior.
3. Abre de nuevo el archivo.
4. Confirma que diga `Online Idle RPG conectado a tu API · v5`.
