export const parseSpotifyTrackId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/track[/:]([a-zA-Z0-9]{22})/);
  if (match) return match[1];

  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;

  return null;
};
