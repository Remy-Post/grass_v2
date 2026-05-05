import { Hero } from '@/components/home/Hero';
import { TransformationSection } from '@/components/home/Transformation';
import { ProblemScroll } from '@/components/home/ProblemScroll';
import { ProcessSteps } from '@/components/home/ProcessSteps';
import { OwnerNote } from '@/components/home/OwnerNote';
import { Benefits } from '@/components/home/Benefits';
import { FaqList } from '@/components/shared/FaqList';
import { FinalCta } from '@/components/home/FinalCta';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata('home');

export default function HomePage() {
  return (
    <>
      <Hero />
      <TransformationSection />
      <ProblemScroll />
      <ProcessSteps />
      <OwnerNote />
      <Benefits />
      <FaqList limit={5} id="faq" />
      <FinalCta />
    </>
  );
}
