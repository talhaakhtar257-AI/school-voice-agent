/**
 * Reads the settings this application needs from the environment.
 *
 * Only two settings are required by the application foundation. `.env.example`
 * documents five, but the other three are read by later features; requiring them
 * now would make deployment fail for a missing value that nothing reads.
 *
 * Why this file throws rather than returning a default: FR-011 requires the
 * application to fail immediately and name the absent setting. A site that
 * publishes successfully and then fails silently for every visitor is worse than
 * one that refuses to publish.
 */

function readRequiredSetting(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Missing required setting: ${name}. Add it to .env.local for local ` +
        `development, or to the project's environment variables when deployed. ` +
        `See .env.example for the full list of settings.`,
    );
  }

  return value;
}

export function getSupabaseUrl(): string {
  return readRequiredSetting("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return readRequiredSetting("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
