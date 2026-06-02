# Componentes Compartidos

Esta carpeta contiene componentes reutilizables que se usan en múltiples partes de la aplicación.

## Componentes Disponibles

### `StatsCard` y `StatsGrid`
Componente para mostrar tarjetas de estadísticas.

```tsx
import { StatsGrid, StatItem } from "@/components/shared/stats-card";

const stats: StatItem[] = [
  {
    title: "Total",
    value: "100",
    description: "Descripción opcional",
    icon: Users,
    iconColor: "text-blue-600",
  },
];

<StatsGrid stats={stats} columns={4} />
```

### `EmptyState`
Componente para mostrar estados vacíos cuando no hay datos.

```tsx
import { EmptyState } from "@/components/shared/empty-state";

<EmptyState
  title="No hay cursos"
  description="Descripción opcional"
  action={{
    label: "Crear curso",
    href: "/courses/new",
  }}
  secondaryAction={{
    label: "Limpiar filtros",
    onClick: handleClear,
  }}
/>
```

### `PageHeader`
Componente para headers de página consistentes.

```tsx
import { PageHeader } from "@/components/shared/page-header";

<PageHeader
  title="Mi Página"
  description="Descripción opcional"
  action={{
    label: "Acción",
    href: "/action",
  }}
/>
```

## Tipos Compartidos

Los tipos comunes están en `types.ts`:
- `Modality`
- `CourseStatus`
- `CourseCategory`
- `BaseCourse`
- `FilterState`

