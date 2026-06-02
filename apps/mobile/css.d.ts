// Declaraciones de tipos para imports de CSS (Metro/Expo los maneja en runtime).
declare module "*.css";
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
