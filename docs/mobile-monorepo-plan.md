# Plan: fundación monorepo para web + móvil (Cursumi)

> Estado: **plan/diagnóstico** — no ejecutado. Sirve de guía para cuando se decida
> arrancar la app móvil. La ejecución se hará por fases en una rama aparte y
> validando un preview de Vercel antes de tocar `main`.

## Decisiones ya tomadas
- **Tecnología móvil:** React Native + **Expo** (reutiliza React/TS, Expo Router ≈ App Router).
- **Backend:** se reutilizan las rutas `/api` actuales (el móvil nunca toca la BD).
- **Auth:** better-auth con cookies (web) + token/SecureStore (móvil vía `@better-auth/expo`).
- **Monetización:** se decide más adelante (IAP vs "reader app"); no es parte de la fundación.

## Principio rector
Invertir solo en lo caro de cambiar después: **estructura, código compartido, contrato
de API y auth**. Lo demás, iterativo. No sobre-construir.

## Arquitectura objetivo
```
cursumi/  (Turborepo + pnpm workspaces)
├─ apps/
│  ├─ web/      ← Next.js 16 actual (se mueve aquí)
│  └─ mobile/   ← Expo (nuevo, fase posterior)
├─ packages/
│  └─ shared/   ← tipos TS + esquemas Zod + helpers puros
├─ turbo.json
└─ pnpm-workspace.yaml
```

## Qué se comparte y qué NO (regla de oro)
**`packages/shared` debe ser TS puro — sin React, sin Next, sin React Native, sin Prisma.**
Eso elimina de raíz los conflictos de versiones entre web y móvil.

| Sí compartir | NO compartir |
|---|---|
| Tipos de dominio (Course, Lesson, tipos de planning) | Componentes UI (web: Tailwind/Radix; móvil: RN/NativeWind) |
| Esquemas **Zod** (validación + contrato de API) | Estilos / Tailwind |
| Helpers puros (formato de fecha, precio, slug) | Código server-only (Prisma, better-auth server, Stripe) |
| Contrato de endpoints (paths + input/output) | Cliente Prisma (el móvil siempre pasa por la API) |

## Plan de migración paso a paso
1. **Rama nueva** (`chore/monorepo`). Nada toca `main` hasta validar.
2. Añadir `pnpm-workspace.yaml` + `turbo` + `turbo.json` en la raíz.
3. Mover el Next.js actual a **`apps/web/`** (src, public, configs, su `package.json`).
   El alias `@/` se mantiene porque el `tsconfig` se mueve con él.
4. Crear **`packages/shared`** (`@cursumi/shared`): empezar extrayendo los **tipos de los
   documentos de planning** y los **Zod de formularios/registro** — ya son TS puro y son
   el caso ideal para estrenar el paquete.
5. Web importa desde `@cursumi/shared` en vez de rutas locales (incremental, archivo por archivo).
6. **Reconfigurar Vercel:** Root Directory → `apps/web`. Probar un **preview deploy** antes
   de tocar producción.
7. Solo cuando el preview esté verde → merge a `main`.
8. (Fase posterior) `apps/mobile` con Expo + auth unificada + pantalla de cursos contra la API.

## Riesgos honestos y mitigación
- **Versión de React (Next 19 vs Expo):** se resuelve porque pnpm aísla cada app *y* porque
  `packages/shared` no importa React. Verificar al ejecutar que el Expo SDK del momento
  soporte React 19 (los recientes sí).
- **Deploy de Vercel (riesgo #1):** cambiar el Root Directory mal = deploy roto. Mitigación:
  rama + preview deploy antes de tocar `main`.
- **better-auth para móvil:** hoy es cookie-based. Para móvil hay que **activar el plugin de
  token/bearer** en el servidor better-auth y usar `@better-auth/expo` (SecureStore) en la app.
  Google OAuth móvil necesita configurar el esquema de deep-link.
- **Contrato de API:** mantener REST (no reescribir a tRPC/GraphQL). Definir input/output con
  **Zod en `shared`** y usarlo en ambos lados → tipado garantizado sin reescritura.

## Lo que NO hacer (evitar parálisis / sobre-ingeniería)
- Nada de microservicios, backend separado ni GraphQL. **Vercel + Neon escala bien** para esto.
- No compartir UI ni estilos entre web y móvil.
- No migrar las 121 rutas de golpe: compartir tipos/Zod **incrementalmente**.
- No meter Prisma/DB en la app móvil.

## Decisiones pendientes antes de ejecutar
1. Confirmar compatibilidad Expo SDK ↔ React 19 en el momento de arrancar.
2. Nombre del scope de paquetes (`@cursumi/*`).
3. Aprobar el cambio de Root Directory en Vercel.

## Esfuerzo aproximado
- Migración a monorepo + preview verde: ~1 día de trabajo cuidadoso.
- Extraer tipos/Zod compartidos: incremental, sin prisa.
- `apps/mobile` (Expo + auth + pantalla de cursos): arranca después, sobre base sólida.

## Orden sugerido (fases)
1. **Fundación:** Turborepo (`apps/web` + `packages/shared`). La web sigue igual.
2. **App base:** `apps/mobile` con Expo + auth unificada + pantalla de cursos (solo lectura).
3. **Acceso:** modelo de entitlement único (web Stripe + futuro móvil).
4. **Monetización:** decidir IAP vs reader.

---

## Notas de la 1ª ejecución (aprendizajes)

### ✅ Lo que SÍ funcionó (ya en la rama `chore/monorepo`)
- Activar pnpm workspaces (`packages/*` + `apps/*`).
- Crear `packages/shared` (`@cursumi/shared`, TS puro) con tipos de dominio + `formatPriceMXN`.
- Que la **web (en la raíz)** consuma el paquete: `transpilePackages: ["@cursumi/shared"]`,
  dependencia `workspace:*`, y re-export de `formatPriceMXN` sin cambiar call sites.
- `pnpm build` verde. **No requiere tocar Vercel** porque la web sigue en la raíz.
- Conclusión: la fundación es de bajo riesgo y mergeable a `main` por sí sola.

### ↩️ Lo que falló: mover la web a `apps/web` (revertido)
- Al mover todo a `apps/web` + reinstalar, el **type-check de `next/script` empezó a fallar**
  (`Property 'src' does not exist on type ScriptProps`) en `forgot-password-form.tsx` y
  `register-form.tsx`, **aunque pasaba minutos antes** con la web en la raíz.
- **Causa:** NO fue deriva de versión (TypeScript ya era `^6.0.3`). Fue la **resolución/hoisting
  de `node_modules` del layout workspace**: con `apps/web` teniendo su propio árbol, `@types/react`
  / tipos de Next se resolvieron de forma distinta y rompieron el JSX typing.
- **Además:** el cambio de **Root Directory → `apps/web` en Vercel** no se puede validar en remoto;
  hay que ver el preview deploy.

### 🔧 Para el próximo intento del move (hacerlo hands-on)
1. Hacerlo **localmente con capacidad de iterar** install/build (no a ciegas).
2. Asegurar **una sola copia de `@types/react`/`react`**: revisar hoisting de pnpm
   (`public-hoist-pattern[]=*react*` o `node-linker`), o `typeRoots`/`paths` en `apps/web/tsconfig.json`.
3. Verificar que `apps/web/tsconfig.json` resuelve bien tras el move (alias `@/*` → `./src/*`).
4. Mover artefactos correctamente: `.env` a `apps/web/.env`; des-anclar patrones del `.gitignore`
   (`/.next/`, `/node_modules`, `/coverage`, `/test-results/`, etc.) — ya hecho en el intento.
5. Cambiar Root Directory en Vercel y **validar preview ANTES** de merge.

### Estado actual
- Fundación en rama `chore/monorepo` (1 commit sobre `main`), verde y pusheada.
- El move y `apps/mobile` quedan pendientes para una sesión con validación en vivo.
