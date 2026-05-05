import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { Icon } from '@/components/shared/Icon';
import { Reveal } from '@/components/shared/Reveal';
import { pageCopy, siteSettings } from '@/lib/website-data';

export function OwnerNote() {
  const note = pageCopy.home.ownerNote;
  return (
    <Section pad="md">
      <Container>
        <Reveal preset="fade" className="grid gap-8 rounded-2xl border border-line bg-surface p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10 md:p-12">
          <div
            className="grid h-24 w-24 place-items-center rounded-full bg-brand text-surface"
            aria-hidden
          >
            <span className="font-display text-3xl font-semibold">R</span>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{note.headline}</h2>
            <p className="text-ink-soft">{note.body}</p>
            <p className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <Icon name="MapPin" size={14} />
              {siteSettings.serviceArea}
              <span aria-hidden>·</span>
              {siteSettings.socialScore} of local lawn-care experience
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
