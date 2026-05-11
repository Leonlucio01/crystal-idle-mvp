# Crystal Idle Web V3 Fixes

Cliente web standalone para Crystal Idle.

## Cambios

- Corrige el bloqueo falso de zonas cuando el backend devuelve campos con nombres distintos.
- Mantiene el enemigo seleccionado después de atacar; el combo ya no vuelve siempre al primer enemigo.
- Evita mostrar HTML crudo cuando un endpoint de upgrades no existe.
- Upgrades quedan como UI preparada si el backend todavía no tiene una ruta compatible.
- No usa assets pagos ni dependencias externas.

## Cómo usar

Copia `index.html` sobre tu archivo actual:

`client/web-prototype/index.html`

Luego recarga el navegador y prueba login, zonas, enemigos y combate.
