/**
 * Tiny conditional class-name joiner. Avoids pulling in clsx/tailwind-merge
 * for a project that already controls its own class strings.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
