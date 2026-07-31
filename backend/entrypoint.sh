#!/bin/sh
set -e

echo "[Entrypoint] Inicializando Semillas de Base de Datos..."
node dist/src/database/seeds/init.seed.js

echo "[Entrypoint] Iniciando aplicación en producción..."
exec npm run start:prod
