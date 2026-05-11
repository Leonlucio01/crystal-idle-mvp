# Client Web Prototype - Kill Visual

Esta versión cambia el popup visual de daño numérico (`-68`) por `KILL`.

## Por qué

El endpoint usado actualmente es:

```txt
POST /combat/kill
```

Ese endpoint representa una pelea completa y mata el enemigo en una llamada.  
Por eso era confuso mostrar daño parcial. Ahora el cliente muestra `KILL`.

## Incluye

- Selector de zonas
- Auto Farm
- Barra de vida de enemigo
- Popup `KILL`
- Recompensas flotantes
- Upgrades con costos
- Ranking
