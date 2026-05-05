import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { FooterDotGrid } from '@/components/shared/FooterDotGrid';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { LenisProvider } from '@/components/shared/LenisProvider';
import { RouteTransition } from '@/components/shared/RouteTransition';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <Header />
      <div data-public-theme-scope>
        <main id="content">
          <RouteTransition>{children}</RouteTransition>
        </main>
        <Footer />
        <FooterDotGrid />
        <ChatWidget />
      </div>
    </LenisProvider>
  );
}
