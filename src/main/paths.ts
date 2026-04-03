export function resolveOnclawPaths(root: string) {
  return {
    root,
    runtime: `${root}/runtime`,
    snapshots: `${root}/snapshots`,
    state: `${root}/state`,
    data: `${root}/data`,
    logs: `${root}/logs`,
    cache: `${root}/cache`,
    downloads: `${root}/downloads`,
    tmp: `${root}/tmp`
  } as const;
}

export function resolveActiveRuntimePointer(root: string) {
  return `${root}/state/active-runtime.json`;
}

export function isOnclawRoot(root: string) {
  const normalized = root.replaceAll("\\", "/").replace(/\/+$/, "");
  return normalized.toLowerCase().endsWith("/onclaw") || normalized.toLowerCase() === "onclaw";
}
