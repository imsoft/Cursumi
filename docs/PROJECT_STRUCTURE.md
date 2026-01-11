# Estructura del Proyecto Cursumi

Este documento describe la estructura y organización del proyecto.

## 📁 Estructura de Carpetas

```
cursumi/
├── src/                   # ⭐ Código fuente del proyecto
│   ├── app/              # Rutas y páginas (Next.js App Router)
│   │   ├── (admin)/      # Grupo de rutas de administrador
│   │   │   └── admin/
│   │   │       ├── layout.tsx    # Layout con sidebar de admin
│   │   │       └── page.tsx      # Dashboard de admin
│   │   │
│   │   ├── (instructor)/ # Grupo de rutas de instructor
│   │   │   └── instructor/
│   │   │       ├── layout.tsx    # Layout con sidebar de instructor
│   │   │       ├── page.tsx      # Dashboard de instructor
│   │   │       ├── courses/      # Gestión de cursos
│   │   │       └── profile/      # Perfil del instructor
│   │   │
│   │   ├── (marketing)/  # Grupo de rutas públicas/marketing
│   │   │   ├── courses/         # Catálogo de cursos
│   │   │   ├── how-it-works/    # Cómo funciona
│   │   │   ├── instructors/     # Página para instructores
│   │   │   ├── contact/         # Contacto
│   │   │   ├── login/           # Iniciar sesión
│   │   │   └── signup/          # Registro
│   │   │
│   │   ├── (student)/    # Grupo de rutas de estudiante
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx    # Layout con sidebar de estudiante
│   │   │       ├── page.tsx      # Dashboard principal
│   │   │       └── my-courses/   # Mis cursos
│   │   │
│   │   ├── actions/      # Server Actions
│   │   ├── layout.tsx    # Layout raíz
│   │   ├── page.tsx     # Home page
│   │   └── globals.css  # Estilos globales
│   │
│   ├── components/       # Componentes React
│   │   ├── shared/       # ⭐ Componentes reutilizables
│   │   │   ├── stats-card.tsx   # Tarjetas de estadísticas
│   │   │   ├── empty-state.tsx  # Estados vacíos
│   │   │   ├── page-header.tsx  # Headers de página
│   │   │   ├── types.ts         # Tipos compartidos
│   │   │   └── index.ts         # Exportaciones
│   │   │
│   │   ├── ui/           # Componentes de shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── dashboard/    # Componentes de dashboard
│   │   │   ├── dashboard-header.tsx
│   │   │   └── sidebar-nav.tsx
│   │   │
│   │   ├── auth/         # Componentes de autenticación
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   │
│   │   ├── student/      # Componentes específicos de estudiante
│   │   │   ├── student-course-card.tsx
│   │   │   ├── student-stats-cards.tsx
│   │   │   └── ...
│   │   │
│   │   ├── instructor/    # Componentes específicos de instructor
│   │   │   ├── instructor-stats-cards.tsx
│   │   │   ├── course-list.tsx
│   │   │   └── ...
│   │   │
│   │   └── courses/      # Componentes de cursos (público)
│   │       ├── course-card.tsx
│   │       ├── filters-bar.tsx
│   │       └── ...
│   │
│   ├── lib/              # Utilidades y helpers
│   │   ├── utils.ts      # Utilidades generales
│   │   ├── db.ts         # Configuración de base de datos (Neon)
│   │   └── stripe-calculator.ts
│   │
│   └── hooks/            # Custom React hooks
│       └── use-mobile.ts
│
├── public/               # Archivos estáticos
│   ├── logos/
│   └── ...
│
├── docs/                 # Documentación del proyecto
│   ├── PROJECT_STRUCTURE.md
│   ├── NEON_SETUP.md
│   └── README.md
│
├── .env.local            # Variables de entorno (no se sube a Git)
├── next.config.ts       # Configuración de Next.js
├── tsconfig.json         # Configuración de TypeScript
├── components.json       # Configuración de shadcn/ui
└── package.json          # Dependencias del proyecto
```

## 🎯 Principios de Organización

### 1. Componentes Compartidos (`components/shared/`)
**Usa estos componentes para evitar duplicación:**

- ✅ `StatsCard` / `StatsGrid` - Para mostrar estadísticas
- ✅ `EmptyState` - Para estados vacíos
- ✅ `PageHeader` - Para headers de página consistentes

**Ejemplo:**
```tsx
// ❌ Antes (duplicado)
<Card><CardHeader>...</CardHeader></Card>

// ✅ Ahora (reutilizable)
import { StatsGrid } from "@/components/shared/stats-card";
<StatsGrid stats={stats} columns={4} />
```

### 2. Grupos de Rutas
Los grupos de rutas (carpetas entre paréntesis) organizan las rutas sin afectar las URLs:
- `(admin)` - Rutas administrativas
- `(instructor)` - Rutas de instructor
- `(marketing)` - Rutas públicas
- `(student)` - Rutas de estudiante

### 3. Componentes por Funcionalidad
Los componentes están organizados por dominio:
- `auth/` - Autenticación
- `student/` - Funcionalidades de estudiante
- `instructor/` - Funcionalidades de instructor
- `courses/` - Catálogo público de cursos

## 📦 Componentes Reutilizables

### StatsCard / StatsGrid
Usa para mostrar estadísticas en dashboards:

```tsx
import { StatsGrid, StatItem } from "@/components/shared/stats-card";

const stats: StatItem[] = [
  {
    title: "Total",
    value: "100",
    description: "Descripción",
    icon: Users,
    iconColor: "text-blue-600",
  },
];

<StatsGrid stats={stats} columns={4} />
```

### EmptyState
Usa cuando no hay datos para mostrar:

```tsx
import { EmptyState } from "@/components/shared/empty-state";

<EmptyState
  title="No hay cursos"
  description="Descripción opcional"
  action={{ label: "Crear", href: "/new" }}
  secondaryAction={{ label: "Limpiar", onClick: handleClear }}
/>
```

### PageHeader
Usa para headers consistentes:

```tsx
import { PageHeader } from "@/components/shared/page-header";

<PageHeader
  title="Mi Página"
  description="Descripción"
  action={{ label: "Acción", href: "/action" }}
/>
```

## 🔄 Refactorización Realizada

### Antes (Duplicado):
- `InstructorStatsCards` - Componente específico
- `StudentStatsCards` - Componente específico
- `MyCoursesStats` - Componente específico
- Múltiples `EmptyState` - Código duplicado
- Múltiples headers - Código duplicado

### Ahora (Reutilizable):
- ✅ `StatsGrid` - Un solo componente para todos
- ✅ `EmptyState` - Componente genérico
- ✅ `PageHeader` - Header reutilizable
- ✅ Tipos compartidos en `shared/types.ts`

## 📝 Convenciones

1. **Nombres de archivos**: kebab-case (`my-component.tsx`)
2. **Nombres de componentes**: PascalCase (`MyComponent`)
3. **Componentes compartidos**: Siempre en `components/shared/`
4. **Tipos compartidos**: En `components/shared/types.ts`
5. **Client Components**: Marcar con `"use client"` cuando sea necesario

## 🚀 Próximos Pasos

Para agregar nuevos componentes:
1. ¿Se usa en múltiples lugares? → `components/shared/`
2. ¿Es específico de un dominio? → `components/{domain}/`
3. ¿Es un componente UI base? → `components/ui/`

