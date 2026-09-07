// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // Mismo criterio que apps/web: las reglas de React Hooks que llegaron con
      // eslint-config-expo 57 (React Compiler) se dejan en warn mientras se
      // migra el código. set-state-in-effect salta en el `setLoading(true)`
      // inicial de cada pantalla que carga datos; refs, en el PanResponder del
      // pizarrón, que lee refs a propósito para no recrearse.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
]);
