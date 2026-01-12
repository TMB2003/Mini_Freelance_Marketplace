export const getAuthUserId = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1] ?? '';
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const json = atob(padded);
    const decoded = JSON.parse(json) as { id?: string };
    return decoded.id ?? null;
  } catch {
    return null;
  }
};
