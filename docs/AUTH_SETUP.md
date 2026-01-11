# Configuración de Autenticación con Better Auth, Prisma y Neon

Esta guía explica cómo está configurado el sistema de autenticación en Cursumi usando Better Auth, Prisma ORM y Neon PostgreSQL.

## 📋 Stack Tecnológico

- **Better Auth**: Sistema de autenticación moderno y type-safe
- **Prisma ORM**: ORM para TypeScript con soporte para PostgreSQL
- **Neon**: Base de datos PostgreSQL serverless
- **Next.js 16**: Framework React con App Router

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
# Base de datos Neon
DATABASE_URL="postgresql://<user>:<password>@<endpoint_hostname>.neon.tech:<port>/<dbname>?sslmode=require&channel_binding=require"

# URL de la aplicación (para Better Auth)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Resend - Email (para verificación de correo)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="Cursumi <[email protected]>"

# Google OAuth (para autenticación con Google)
GOOGLE_CLIENT_ID="tu_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"
```

**Para obtener tu API Key de Resend:**
1. Regístrate en [Resend](https://resend.com/)
2. Ve a la sección "API Keys" en el dashboard
3. Crea una nueva API Key
4. Copia la clave y agrégala a `.env.local`

**Para configurar el email remitente:**
- En desarrollo, puedes usar `onboarding@resend.dev` (solo para pruebas)
- En producción, debes verificar tu dominio en Resend y usar un email de tu dominio

**Para obtener las credenciales de Google OAuth:**
1. Ve a la [Consola de Desarrolladores de Google](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ (si no está habilitada)
4. Ve a "Credenciales" > "Crear credenciales" > "ID de cliente de OAuth 2.0"
5. Configura la pantalla de consentimiento de OAuth:
   - Tipo de aplicación: Web
   - Nombre: Cursumi (o el nombre de tu app)
   - Email de soporte: tu email
   - Dominios autorizados: tu dominio (ej: `cursumi.com`)
6. Configura los URIs de redirección autorizados:
   - Desarrollo: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://tu-dominio.com/api/auth/callback/google`
7. Copia el **ID de cliente** y el **Secreto de cliente**
8. Agrégales a `.env.local` como `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`

### 2. Generar Prisma Client

Después de configurar el schema de Prisma, genera el cliente:

```bash
pnpm db:generate
```

### 3. Ejecutar Migraciones

Crea las tablas en la base de datos:

```bash
pnpm db:migrate
```

O si prefieres hacer push directo (solo para desarrollo):

```bash
pnpm db:push
```

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── auth.ts           # Configuración de Better Auth
│   ├── auth-client.ts    # Cliente de Better Auth para React
│   └── prisma.ts         # Instancia de Prisma Client con adapter de Neon
├── app/
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts  # API route para Better Auth
├── components/
│   └── auth/
│       ├── login-form.tsx    # Formulario de inicio de sesión
│       └── register-form.tsx # Formulario de registro
└── proxy.ts              # Proxy para protección de rutas (Next.js 16+)

prisma/
├── schema.prisma         # Schema de Prisma con modelos de Better Auth
└── migrations/           # Migraciones de la base de datos
```

## ✉️ Verificación de Correo Electrónico

El sistema está configurado para requerir verificación de correo electrónico usando Resend.

### Flujo de Verificación

1. **Registro**: Cuando un usuario se registra, Better Auth automáticamente:
   - Crea la cuenta con `emailVerified: false`
   - Genera un token de verificación
   - Llama a `sendVerificationEmail` con Resend
   - Redirige al usuario a `/verify-email-sent`

2. **Email de Verificación**: El usuario recibe un email con un enlace que apunta a:
   ```
   /verify-email?token=<token>
   ```

3. **Verificación**: Cuando el usuario hace clic en el enlace:
   - La página `/verify-email` verifica el token con Better Auth
   - Si es válido, actualiza `emailVerified: true` en la base de datos
   - Redirige al usuario al login

4. **Login**: Los usuarios solo pueden iniciar sesión si su correo está verificado

### Páginas Relacionadas

- `/verify-email-sent`: Muestra mensaje de confirmación después del registro
- `/verify-email?token=xxx`: Página que procesa la verificación del token

## 🔐 Uso en el Código

### Registro de Usuario

El formulario de registro (`src/components/auth/register-form.tsx`) usa Better Auth:

```tsx
import { signUp } from "@/lib/auth-client";

const result = await signUp.email({
  email: "usuario@ejemplo.com",
  password: "contraseña123",
  name: "Nombre Usuario",
});
```

### Inicio de Sesión

El formulario de inicio de sesión (`src/components/auth/login-form.tsx`):

```tsx
import { signIn } from "@/lib/auth-client";

const result = await signIn.email({
  email: "usuario@ejemplo.com",
  password: "contraseña123",
});
```

### Obtener Sesión en Server Components

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <div>Bienvenido {session.user.name}</div>;
}
```

### Obtener Sesión en Server Actions

```tsx
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function protectedAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("No autenticado");
  }

  // Tu lógica aquí
}
```

### Usar Sesión en Cliente (React)

```tsx
"use client";

import { useSession } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Cargando...</div>;
  if (!session) return <div>No autenticado</div>;

  return <div>Hola {session.user.name}</div>;
}
```

### Cerrar Sesión

```tsx
"use client";

import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut();
    // Redirigir al login
  };

  return <button onClick={handleLogout}>Cerrar sesión</button>;
}
```

## 🛡️ Protección de Rutas

### Proxy (Next.js 16+)

El archivo `src/proxy.ts` protege rutas automáticamente verificando la existencia de cookies de sesión.

**⚠️ Importante**: El proxy solo verifica la existencia de la cookie, NO valida la sesión. Siempre valida la sesión en cada página protegida usando `auth.api.getSession()`.

### Protección Manual en Páginas

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <div>Contenido protegido</div>;
}
```

## 📊 Modelos de Base de Datos

Better Auth requiere estos modelos en Prisma:

- **User**: Información del usuario
- **Account**: Cuentas vinculadas (email/password, OAuth, etc.)
- **Session**: Sesiones activas
- **Verification**: Tokens de verificación de email

Ver `prisma/schema.prisma` para la estructura completa.

## 🔄 Scripts Disponibles

```bash
# Generar Prisma Client
pnpm db:generate

# Crear y aplicar migraciones
pnpm db:migrate

# Hacer push del schema (solo desarrollo)
pnpm db:push

# Abrir Prisma Studio (GUI para la base de datos)
pnpm db:studio
```

## 🐛 Solución de Problemas

### Error: "DATABASE_URL no está definida"

- Verifica que el archivo `.env.local` existe
- Asegúrate de que la variable se llama exactamente `DATABASE_URL`
- Reinicia el servidor de desarrollo

### Error: "Prisma Client not generated"

Ejecuta:
```bash
pnpm db:generate
```

### Error: "Table does not exist"

Ejecuta las migraciones:
```bash
pnpm db:migrate
```

### Error de autenticación

- Verifica que la API route `/api/auth/[...all]` esté funcionando
- Revisa la consola del navegador para errores
- Verifica que `NEXT_PUBLIC_APP_URL` esté configurado correctamente

## 📖 Recursos

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Next.js Auth Guide](https://nextjs.org/docs/app/building-your-application/authentication)

