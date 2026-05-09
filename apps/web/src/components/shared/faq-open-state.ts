export const MAX_OPEN_FAQS = 3;

export function getNextOpenFaqSlugs(
  currentOpenSlugs: readonly string[],
  toggledSlug: string,
): string[] {
  if (currentOpenSlugs.includes(toggledSlug)) {
    return currentOpenSlugs.filter((slug) => slug !== toggledSlug);
  }

  return [...currentOpenSlugs, toggledSlug].slice(-MAX_OPEN_FAQS);
}
