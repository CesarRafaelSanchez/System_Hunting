# Stage 1: Build NestJS
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Image
FROM node:20-bookworm-slim
WORKDIR /app

# Dependencias Python OS
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

# Librería de Excel
RUN pip3 install openpyxl pillow --break-system-packages

COPY package*.json ./
RUN npm install --omit=dev

# Copiar el código transpilado
COPY --from=builder /app/dist ./dist
# Copiar el worker de Python (requerido por el procesador)
COPY --from=builder /app/workers ./workers
# Copiar las plantillas corporativas
COPY --from=builder /app/templates ./templates

# Agregar el script de entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
