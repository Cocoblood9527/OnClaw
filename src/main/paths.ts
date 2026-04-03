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
