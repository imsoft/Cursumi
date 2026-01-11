# Configuración de Neon Database

Esta guía explica cómo configurar Neon PostgreSQL en el proyecto Cursumi.

## 📋 Requisitos previos

1. Una cuenta en [Neon](https://neon.tech/)
2. Un proyecto Neon creado
3. La connection string de tu base de datos

## 🔧 Pasos de configuración

### 1. Instalar dependencias

Las dependencias ya están instaladas en el proyecto:
- `@neondatabase/serverless` ✅

### 2. Obtener la connection string

1. Ve a [Neon Console](https://console.neon.tech/)
2. Selecciona tu proyecto
3. Haz clic en el botón **"Connect"**
4. Copia la connection string que aparece en el modal

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
DATABASE_URL="postgresql://<user>:<password>@<endpoint_hostname>.neon.tech:<port>/<dbname>?sslmode=require&channel_binding=require"
```

**⚠️ Importante:** 
- Reemplaza los valores `<user>`, `<password>`, `<endpoint_hostname>`, `<port>`, y `<dbname>` con los valores reales de tu connection string
- El archivo `.env.local` está en `.gitignore` y no se subirá al repositorio
- Nunca compartas tu connection string públicamente

### 4. Probar la conexión

1. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

2. Visita la página de prueba:
   ```
   http://localhost:3000/test-db
   ```

3. Haz clic en "Obtener versión PostgreSQL" para verificar la conexión

## 📚 Uso en el código

### Server Components

```tsx
import { getDb } from "@/lib/db";

export default async function MyPage() {
  const sql = getDb();
  const result = await sql`SELECT * FROM users LIMIT 10`;
  
  return (
    <div>
      {result.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Server Actions

```tsx
"use server";

import { getDb } from "@/lib/db";

export async function createUser(name: string, email: string) {
  const sql = getDb();
  const result = await sql`
    INSERT INTO users (name, email) 
    VALUES (${name}, ${email})
    RETURNING id, name, email
  `;
  return result[0];
}
```

## 🔒 Seguridad

- ✅ Usa template literals (tagged templates) para prevenir SQL injection
- ✅ Nunca uses concatenación de strings para construir queries SQL
- ✅ Mantén tu `DATABASE_URL` en `.env.local` y nunca la subas a Git
- ✅ Usa variables de entorno diferentes para desarrollo y producción

## 📖 Recursos

- [Documentación oficial de Neon](https://neon.com/docs)
- [Guía de Next.js + Neon](https://neon.com/docs/guides/nextjs)
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver)

## 🐛 Solución de problemas

### Error: "DATABASE_URL no está definida"

- Verifica que el archivo `.env.local` existe en la raíz del proyecto
- Asegúrate de que la variable se llama exactamente `DATABASE_URL`
- Reinicia el servidor de desarrollo después de crear/modificar `.env.local`

### Error de conexión

- Verifica que tu connection string sea correcta
- Asegúrate de que tu proyecto Neon esté activo
- Verifica que no haya restricciones de firewall bloqueando la conexión

### Error de SSL

- Asegúrate de que tu connection string incluya `?sslmode=require`
- En algunos casos, puede ser necesario usar `sslmode=prefer`

