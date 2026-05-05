import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { services } from '@/lib/website-data';
import { ServiceCard } from './ServiceCard';

export function ServiceList() {
  return (
    <Section pad="md">
      <Container className="space-y-8">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </Container>
    </Section>
  );
}
