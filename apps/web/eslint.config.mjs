import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      // Declarar versión de React explícitamente para que eslint-plugin-react@7
      // no intente auto-detectarla con context.getFilename() (eliminado en ESLint 9+)
      react: { version: "19" },
    },
    rules: {
      // ── Reglas pre-existentes bajadas a warn ─────────────────────────────────
      // Se migrarán gradualmente; no deben bloquear el CI mientras tanto

      // Variables/args/destructuring prefijados con "_" = intencionalmente sin usar
      // (p. ej. `const { email: _email, ...payload } = values` omite un campo, o
      // parámetros de firma de callback que el server recomputa). ignoreRestSiblings
      // cubre el patrón de destructuring-omit aunque no lleve prefijo.
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        ignoreRestSiblings: true,
      }],

      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-this-alias": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",

      // React
      "react/no-unescaped-entities": "warn",
      "react/display-name": "warn",

      // React Hooks (reglas de React 19 — muchas dan falsos positivos en Next.js App Router)
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
  globalIgnores([
    // Default ignores de eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Código generado (Prisma)
    "src/generated/**",
    // Tests e2e y reportes de Playwright
    "e2e/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
