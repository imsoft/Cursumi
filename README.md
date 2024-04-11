# Descripción

## Correr en dev

1. Clonar repositorio
2. Crear una copia del ```.env.template``` y renombrearlo a ```.env``` y cambiar las variables de entorno
3. Instalar dependencias ```npm install```
4. Levantar la base de datos ```docker compose up -d```
5. Correr las migraciones de Prisma ```npx prisma migrate dev```
6. Ejecutar seed ```npm run seed```
7. Correr el proyecto ```npm run dev```

## Correr en prod

## Update NextJs

If you want to update NextJs you must run this command:

```bash
npm i next@latest react@latest react-dom@latest eslint-config-next@latest
# or
yarn add next@latest react@latest react-dom@latest eslint-config-next@latest typescript@latest
```