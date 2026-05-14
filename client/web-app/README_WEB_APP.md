# Crystal Idle - Nuevo frontend React + PixiJS

Este frontend nuevo vive en:

```txt
client/web-app/
```

El prototipo viejo en `client/web-prototype/` no se borra. Queda como respaldo.

## Instalación

Desde la raíz del proyecto:

```cmd
cd client\web-app
npm install
npm run copy-assets
npm run dev
```

Luego abre:

```txt
http://localhost:5173
```

## API

Por defecto apunta a:

```txt
http://localhost:3000
```

Si quieres apuntar a Render, crea `client/web-app/.env`:

```txt
VITE_API_URL=https://crystal-idle-api.onrender.com
```

## Assets

El comando `npm run copy-assets` copia:

```txt
client/web-prototype/assets
```

a:

```txt
client/web-app/public/assets
```

Si no los tienes en `web-prototype/assets`, copia tu carpeta `assets` manualmente dentro de `client/web-app/public/assets`.
