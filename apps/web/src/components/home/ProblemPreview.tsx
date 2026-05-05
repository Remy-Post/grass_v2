import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { Icon } from '@/components/shared/Icon';
import { services, pageCopy } from '@/lib/website-data';

export function ProblemPreview() {
  const top = services.slice(0, 3);
  return (
    <Section pad="lg">
      <Container>
        <header className="max-w-2xl space-y-3">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">
            {pageCopy.services.headline}
          </h2>
          <p className="text-ink-soft">{pageCopy.services.body}</p>
        </header>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {top.map((service) => (
            <article
              key={service.slug}
              className="group relative flex flex-col gap-3 rounded-xl border border-line bg-surface p-6 transition-shadow hover:shadow-md"
            >
              <div className="grid h-10 w-10 place-items-center rounded-md bg-brand/10 text-brand">
                <Icon name={service.data.icon} size={20} />
              </div>
              <h3 className="font-display text-xl font-semibold">{service.title}</h3>
              <p className="text-sm text-ink-soft">{service.data.problem}</p>
              <p className="mt-auto text-sm font-medium text-brand">{service.data.result}</p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/services" className="text-sm font-medium text-brand hover:underline">
            See all services →
          </Link>
        </div>
      </Container>
    </Section>
  );
}
