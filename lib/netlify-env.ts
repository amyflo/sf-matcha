/** Server env vars from Netlify (dashboard, CLI, or local `.env`). */
export function getNetlifyEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function requireNetlifyEnv(name: string): string {
  const value = getNetlifyEnv(name);
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function getExaApiKey(): string | undefined {
  return getNetlifyEnv("EXA_API_KEY");
}
