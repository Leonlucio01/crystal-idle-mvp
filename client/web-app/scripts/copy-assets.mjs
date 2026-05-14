import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const source = path.resolve(appRoot, '../web-prototype/assets');
const target = path.resolve(appRoot, 'public/assets');

if (!fs.existsSync(source)) {
  console.error(`[copy-assets] No encontré assets en: ${source}`);
  console.error('Copia manualmente tu carpeta assets a client/web-app/public/assets');
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log(`[copy-assets] Assets copiados a ${target}`);
