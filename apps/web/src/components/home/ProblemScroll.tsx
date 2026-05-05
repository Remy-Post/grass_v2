import { services, pageCopy } from '@/lib/website-data';
import { ProblemScrollClient, type ProblemServiceData } from './ProblemScrollClient';

const PANEL_COUNT = 3;

export function ProblemScroll() {
  const top: ProblemServiceData[] = services.slice(0, PANEL_COUNT).map((s) => ({
    slug: s.slug,
    title: s.title,
    icon: s.data.icon,
    problem: s.data.problem,
    result: s.data.result,
    quoteNote: s.data.quoteNote,
    includes: s.data.includes,
  }));

  return (
    <ProblemScrollClient
      services={top}
      headline={pageCopy.services.headline}
      body={pageCopy.services.body}
    />
  );
}
