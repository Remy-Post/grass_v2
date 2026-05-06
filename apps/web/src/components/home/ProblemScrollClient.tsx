'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';
import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { Icon } from '@/components/shared/Icon';
import { Reveal, RevealItem } from '@/components/shared/Reveal';
import { useIsNarrow } from '@/lib/motion';
import { useViewportScrollProgress } from '@/lib/scroll-motion';

export type ProblemServiceData = {
  slug: string;
  title: string;
  icon: string;
  problem: string;
  result: string;
  quoteNote: string;
  includes: string[];
  beforeImageSrc?: string;
  afterImageSrc?: string;
  itemImageSrc?: string;
};

type Props = {
  services: ProblemServiceData[];
  headline: string;
  body: string;
};

export function ProblemScrollClient({ services, headline, body }: Props) {
  const reduce = useReducedMotion();
  const isNarrow = useIsNarrow(768);

  if (reduce || isNarrow) {
    return <FallbackList services={services} headline={headline} body={body} />;
  }

  return <PinnedScroll services={services} headline={headline} />;
}

function FallbackList({ services, headline, body }: Props) {
  return (
    <Section pad="lg">
      <Container>
        <Reveal preset="rise" as="header" className="max-w-2xl space-y-3">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">{headline}</h2>
          <p className="text-ink-soft">{body}</p>
        </Reveal>
        <Reveal preset="stagger" className="mt-10 grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <RevealItem
              key={service.slug}
              as="article"
              className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-line bg-surface p-6 transition-shadow hover:shadow-md"
            >
              {service.itemImageSrc ? (
                <div className="relative -mx-6 -mt-6 aspect-[4/3] overflow-hidden border-b border-line bg-bg">
                  <Image
                    src={service.itemImageSrc}
                    alt={`${service.title} result`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              ) : null}
              <div className="grid h-10 w-10 place-items-center rounded-md bg-brand/10 text-brand">
                <Icon name={service.icon} size={20} />
              </div>
              <h3 className="font-display text-xl font-semibold">{service.title}</h3>
              <p className="text-sm text-ink-soft">{service.problem}</p>
              <p className="mt-auto text-sm font-medium text-brand">{service.result}</p>
            </RevealItem>
          ))}
        </Reveal>
        <div className="mt-8">
          <Link href="/services" className="text-sm font-medium text-brand hover:underline">
            See all services →
          </Link>
        </div>
      </Container>
    </Section>
  );
}

function PinnedScroll({
  services,
  headline,
}: {
  services: ProblemServiceData[];
  headline: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useViewportScrollProgress(outerRef, ['start start', 'end end']);
  const total = services.length;

  return (
    <section
      ref={outerRef}
      className="relative bg-bg"
      style={{ height: `${total * 100}vh` }}
      aria-label={headline}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at top right, color-mix(in oklab, var(--color-grass) 18%, transparent), transparent 60%), radial-gradient(ellipse at bottom left, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 55%)',
          }}
        />
        <Container className="relative">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
              Problem &rarr; Result
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{headline}</h2>
          </header>

          <div className="relative mx-auto h-[440px] max-w-4xl">
            {services.map((service, i) => (
              <ServicePanel
                key={service.slug}
                service={service}
                index={i}
                total={total}
                progress={scrollYProgress}
              />
            ))}
          </div>

          <ProgressDots total={total} progress={scrollYProgress} />
        </Container>
      </div>
    </section>
  );
}

function ServicePanel({
  service,
  index,
  total,
  progress,
}: {
  service: ProblemServiceData;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;

  const opacity = useTransform(
    progress,
    [Math.max(0, start - 0.05), start + 0.04, end - 0.04, Math.min(1, end + 0.05)],
    index === 0 ? [1, 1, 1, 0] : index === total - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [Math.max(0, start - 0.05), start + 0.04, end - 0.04, Math.min(1, end + 0.05)],
    index === 0 ? [0, 0, 0, -30] : index === total - 1 ? [30, 0, 0, 0] : [30, 0, 0, -30],
  );

  return (
    <motion.article
      style={{ opacity, y }}
      className="absolute inset-0 grid gap-6 rounded-2xl border border-line bg-surface p-6 shadow-md md:grid-cols-[1.1fr_1fr] md:p-8"
    >
      <div className="flex flex-col">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand/10 text-brand">
          <Icon name={service.icon} size={24} />
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">{service.title}</h3>
        <p className="mt-2 text-ink-soft">{service.problem}</p>
        <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-grass/40 bg-grass/10 px-3 py-1 text-sm font-medium text-brand-dark">
          <Icon name="Sparkles" size={14} />
          {service.result}
        </p>
        <ul className="mt-6 space-y-2 text-sm text-ink-soft">
          {service.includes.slice(0, 4).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-4 text-xs italic text-ink-muted">{service.quoteNote}</p>
      </div>
      <div className="grid grid-rows-2 gap-3">
        <MiniPane variant="before" src={service.beforeImageSrc} />
        <MiniPane variant="after" src={service.afterImageSrc} />
      </div>
    </motion.article>
  );
}

function MiniPane({ variant, src }: { variant: 'before' | 'after'; src?: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-line">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 768px) 360px, 100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <div
            className={
              variant === 'before'
                ? 'absolute inset-0 bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-400'
                : 'absolute inset-0 bg-gradient-to-br from-emerald-200 via-grass/70 to-emerald-500'
            }
          />
          <div
            aria-hidden
            className={
              variant === 'before'
                ? 'absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-amber-700/30 to-transparent'
                : 'absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-emerald-700/30 to-transparent'
            }
          />
        </>
      )}
      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted shadow-sm backdrop-blur">
        {variant}
      </span>
    </div>
  );
}

function ProgressDots({
  total,
  progress,
}: {
  total: number;
  progress: MotionValue<number>;
}) {
  return (
    <div className="mt-8 flex items-center justify-center gap-3" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <ProgressDot key={i} index={i} total={total} progress={progress} />
      ))}
    </div>
  );
}

function ProgressDot({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(
    progress,
    [Math.max(0, start - 0.05), start, end, Math.min(1, end + 0.05)],
    [0.25, 1, 1, 0.25],
  );
  const scale = useTransform(
    progress,
    [Math.max(0, start - 0.05), start + 0.02, end - 0.02, Math.min(1, end + 0.05)],
    [0.7, 1, 1, 0.7],
  );
  return <motion.span style={{ opacity, scale }} className="block h-2 w-12 rounded-full bg-brand" />;
}
