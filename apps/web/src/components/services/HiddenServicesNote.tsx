import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { Icon } from '@/components/shared/Icon';

export function HiddenServicesNote() {
  return (
    <Section pad="md">
      <Container>
        <div className="rounded-xl border border-line bg-surface-alt p-6">
          <div className="flex items-start gap-3">
            <Icon name="ShieldCheck" size={20} className="mt-0.5 shrink-0 text-brand" />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold">
                A quick note on weed and grub control.
              </h2>
              <p className="text-sm text-ink-soft">
                Lawn-health questions can be discussed during a quote visit. Paid pesticide,
                herbicide, grub, or pest treatments are not advertised here until Ontario
                licensing and product-label requirements are confirmed.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
