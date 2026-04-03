export async function pickAvailablePort(preferred: number, candidates: number[]) {
  if (!candidates.includes(preferred)) {
    return preferred;
  }

  const fallback = candidates.find((port) => port !== preferred);
  return fallback ?? preferred;
}
