export function redactSecrets(input: Record<string, unknown>) {
  return {
    ...input,
    token: input.token ? "[REDACTED]" : input.token
  };
}
