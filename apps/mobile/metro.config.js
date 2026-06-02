// Configuración de Metro para monorepo pnpm.
// Permite que la app móvil resuelva paquetes del workspace (p. ej. @cursumi/shared)
// y los node_modules hoisted de la raíz.
// Docs: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Observar también la raíz del monorepo (para paquetes compartidos).
config.watchFolders = [workspaceRoot];

// 2. Resolver módulos desde la app y desde la raíz (node-linker=hoisted).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
