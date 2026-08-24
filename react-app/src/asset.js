// Prefixes a root-relative path with Vite's configured base so hardcoded
// public/ references still resolve once the app is served from a subpath.
export const asset = (path) => import.meta.env.BASE_URL + path.replace(/^\//, "");
