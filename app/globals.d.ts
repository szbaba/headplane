// Globals replaced at build time by Vite (`define` in `vite.config.ts`).

declare const __PREFIX__: string;
declare const __VERSION__: string;

// Static asset modules — PNG/JPG imports return URL string at runtime.
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
