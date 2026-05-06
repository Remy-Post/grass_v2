import type { Metadata } from 'next';
import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { Reveal, RevealItem } from '@/components/shared/Reveal';
import { Icon } from '@/components/shared/Icon';

const referenceTypes = [
  'Portfolio',
  'GitHub',
  'LinkedIn',
  'Other',
] as const;

type ReferenceType = (typeof referenceTypes)[number];

type Contributor = {
  name: string;
  role: string;
  contribution: string;
  appreciation: string;
  references: Partial<Record<ReferenceType, string>>;
};

const contributors: Contributor[] = [
  {
    name: 'Alyssa',
    role: 'Design Support',
    contribution: 'Logo and brand image creation',
    appreciation:
      'Alyssa, thank you for helping give The Lawn Guy Bradford a visual identity people can recognize quickly. The logo and brand image work gave the site its first real sense of personality, polish, and confidence.',
    references: {
      LinkedIn: 'https://www.linkedin.com/in/alexander-pinnell-209878328/',
    },
  },
];

export const metadata: Metadata = {
  title: 'The Web Development Team | The Lawn Guy Bradford',
  description:
    'A public thank-you to the people who helped create the website, logo, and brand image for The Lawn Guy Bradford.',
  alternates: {
    canonical: '/partner',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function WebDevelopmentTeamPage() {
  return (
    <>
      <Section pad="lg">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)] lg:items-end">
          <Reveal className="max-w-3xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
              Website Credits
            </p>
            <h1 className="font-display text-4xl font-semibold sm:text-5xl">
              The web development team
            </h1>
            <p className="text-ink-soft">
              This website was built with care from people who helped shape how The Lawn Guy
              Bradford looks, feels, and shows up online. This page is a public thank-you for the
              creative work behind the brand.
            </p>
          </Reveal>

          <Reveal delay={0.08} className="rounded-md border border-line bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              With Appreciation
            </p>
            <p className="mt-3 font-display text-2xl font-semibold text-ink">
              Good websites are built from more than code.
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              They need taste, detail, feedback, and people willing to make the work feel like it
              belongs to the business it represents.
            </p>
          </Reveal>
        </Container>
      </Section>

      <div className="bg-surface-alt">
        {contributors.map((contributor, index) => (
          <Section
            key={contributor.name}
            pad="lg"
            className="min-h-[82svh] border-t border-line"
          >
            <Container className="grid gap-10 lg:grid-cols-[minmax(240px,0.45fr)_minmax(0,1fr)] lg:items-center">
              <Reveal className="lg:sticky lg:top-28">
                <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
                  Contributor {String(index + 1).padStart(2, '0')}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="grid h-20 w-20 shrink-0 place-items-center rounded-md bg-brand text-2xl font-semibold text-surface shadow-sm">
                    {getInitials(contributor.name)}
                  </span>
                  <div>
                    <h2 className="font-display text-4xl font-semibold">{contributor.name}</h2>
                    <p className="mt-1 text-sm font-medium text-ink-muted">{contributor.role}</p>
                  </div>
                </div>
              </Reveal>

              <Reveal preset="stagger" className="space-y-5">
                <RevealItem className="rounded-md border border-line bg-surface p-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                    Contribution
                  </p>
                  <p className="mt-3 font-display text-2xl font-semibold text-ink">
                    {contributor.contribution}
                  </p>
                </RevealItem>

                <RevealItem className="rounded-md border border-line bg-surface p-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                    Special Appreciation
                  </p>
                  <p className="mt-3 text-lg leading-relaxed text-ink-soft">
                    {contributor.appreciation}
                  </p>
                </RevealItem>

                <RevealItem className="rounded-md border border-line bg-surface p-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                    References
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {referenceTypes.map((type) => {
                      const href = contributor.references[type];
                      if (!href) return null;

                      return (
                        <a
                          key={type}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex min-h-14 items-center justify-between gap-3 rounded-md border border-line bg-surface-alt px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                        >
                          <span>{type}</span>
                          <Icon
                            name="ArrowUpRight"
                            size={17}
                            className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </a>
                      );
                    })}
                  </div>
                </RevealItem>
              </Reveal>
            </Container>
          </Section>
        ))}
      </div>

      <Section pad="md" tone="brand">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wider opacity-75">Thank You</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              The details make the brand feel real.
            </h2>
            <p className="mt-3 text-surface/80">
              Every thoughtful design choice, visual asset, and brand detail helps this small
              Bradford lawn care business feel more trustworthy, more personal, and more ready to
              meet the people it serves.
            </p>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
