'use client';

import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { MobileNavDrawer } from './MobileNavDrawer';
import { cn } from '@/lib/cn';
import { navItems, services, siteSettings } from '@/lib/website-data';
import { getQuoteCtaHref } from '@/lib/contact-href';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

const SERVICE_TILE_BACKGROUNDS = [
  'linear-gradient(135deg, rgba(31,90,58,0.88), rgba(22,63,41,0.98))',
  'linear-gradient(135deg, rgba(37,103,66,0.86), rgba(21,57,38,0.98))',
  'linear-gradient(135deg, rgba(72,101,68,0.86), rgba(23,64,42,0.98))',
  'linear-gradient(135deg, rgba(116,128,58,0.84), rgba(30,84,54,0.98))',
  'linear-gradient(135deg, rgba(62,83,58,0.9), rgba(22,63,41,0.98))',
  'linear-gradient(135deg, rgba(82,123,54,0.82), rgba(27,73,46,0.98))',
];

type ThemeMode = 'light' | 'night';

const THEME_STORAGE_KEY = 'lawnguy-theme';
const LIGHT_THEME_COLOR = '#1f5a3a';
const NIGHT_THEME_COLOR = '#0b1710';
const SETTINGS_ROUTE = '/admin/settings' as Route;
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'night';
}

function isLocalHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  return LOCAL_HOSTNAMES.has(normalized) || normalized.endsWith('.localhost');
}

function useShowLocalSettingsLink() {
  const [showLink, setShowLink] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    setShowLink(
      process.env.NODE_ENV === 'development' || isLocalHostname(window.location.hostname),
    );
  }, []);

  return showLink;
}

function readStoredTheme(): ThemeMode | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(theme: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme still works for the current session when storage is unavailable.
  }
}

function getThemeMedia() {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
}

function getSystemTheme(): ThemeMode {
  return getThemeMedia()?.matches ? 'night' : 'light';
}

function updateThemeColor(theme: ThemeMode) {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  meta?.setAttribute('content', theme === 'night' ? NIGHT_THEME_COLOR : LIGHT_THEME_COLOR);
}

function applyPublicTheme(theme: ThemeMode) {
  document.documentElement.dataset.lawnguyTheme = theme;
  document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light';
  updateThemeColor(theme);
}

function resetPublicTheme() {
  delete document.documentElement.dataset.lawnguyTheme;
  document.documentElement.style.removeProperty('color-scheme');
  updateThemeColor('light');
}

function usePublicTheme() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const savedPreferenceRef = useRef(false);

  useEffect(() => {
    const storedTheme = readStoredTheme();
    savedPreferenceRef.current = storedTheme !== null;
    setTheme(storedTheme ?? getSystemTheme());

    const media = getThemeMedia();
    if (!media) return;

    const onSystemThemeChange = (event: MediaQueryListEvent) => {
      if (savedPreferenceRef.current) return;
      setTheme(event.matches ? 'night' : 'light');
    };

    media.addEventListener('change', onSystemThemeChange);
    return () => {
      media.removeEventListener('change', onSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    applyPublicTheme(theme);
  }, [theme]);

  useEffect(() => resetPublicTheme, []);

  const toggleTheme = useCallback(() => {
    savedPreferenceRef.current = true;
    setTheme((currentTheme) => {
      const nextTheme: ThemeMode = currentTheme === 'night' ? 'light' : 'night';
      writeStoredTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  return { theme, toggleTheme };
}

function useScrollProgress(pathname: string) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frameId: number | null = null;
    let timeoutId: number | null = null;

    const measure = () => {
      frameId = null;
      const documentElement = document.documentElement;
      const body = document.body;
      const scrollHeight = Math.max(documentElement.scrollHeight, body?.scrollHeight ?? 0);
      const maxScroll = Math.max(0, scrollHeight - window.innerHeight);
      const nextProgress =
        maxScroll === 0 ? 0 : Math.round((Math.max(0, window.scrollY) / maxScroll) * 100);
      const clampedProgress = Math.min(100, Math.max(0, nextProgress));

      setScrollProgress((currentProgress) =>
        currentProgress === clampedProgress ? currentProgress : clampedProgress,
      );
    };

    const queueMeasure = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(measure);
    };

    measure();
    queueMeasure();
    timeoutId = window.setTimeout(measure, 250);
    window.addEventListener('scroll', queueMeasure, { passive: true });
    window.addEventListener('resize', queueMeasure);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', queueMeasure);
      window.removeEventListener('resize', queueMeasure);
    };
  }, [pathname]);

  return scrollProgress;
}

function FloatingNavTrigger({
  onClick,
  theme,
  onToggleTheme,
  scrollProgress,
  className,
}: {
  onClick: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  scrollProgress: number;
  className?: string;
}) {
  const isNight = theme === 'night';

  return (
    <div
      role="group"
      aria-label="Site menu and display controls"
      className={cn(
        'fixed left-1/2 top-5 z-50 h-11 -translate-x-1/2 items-center gap-1 rounded-full bg-ink px-1.5 text-surface shadow-2xl ring-1 ring-surface/15 backdrop-blur-md',
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Open menu"
        className="inline-flex h-8 items-center gap-2 rounded-full px-2.5 text-sm font-semibold transition-colors hover:bg-surface/10 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Icon name="Menu" size={18} />
        <span>Menu</span>
      </button>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={isNight ? 'Switch to light mode' : 'Switch to night mode'}
        aria-pressed={isNight}
        className={cn(
          'grid h-8 w-8 place-items-center rounded-full border border-surface/15 transition-colors focus-visible:ring-2 focus-visible:ring-accent',
          isNight ? 'bg-accent text-ink' : 'bg-surface/5 text-surface hover:bg-surface/10',
        )}
      >
        <Icon name={isNight ? 'Moon' : 'Sun'} size={15} strokeWidth={2} />
      </button>

      <span
        role="meter"
        aria-label="Page scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={scrollProgress}
        className="inline-flex h-8 min-w-12 items-center justify-center rounded-full bg-surface/15 px-2.5 text-xs font-bold tabular-nums text-surface"
      >
        {scrollProgress}%
      </span>
    </div>
  );
}

function DesktopNavPanel({
  pathname,
  onClose,
  panelRef,
  showLocalSettingsLink,
}: {
  pathname: string;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  showLocalSettingsLink: boolean;
}) {
  const [activeServiceSlug, setActiveServiceSlug] = useState(services[0]?.slug ?? '');

  return (
    <div className="fixed left-1/2 top-5 z-50 hidden -translate-x-1/2 md:block">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="w-[min(680px,calc(100vw-2rem))] overflow-hidden rounded-md border border-surface/15 bg-ink/90 text-surface shadow-2xl backdrop-blur-xl"
      >
        <div className="grid min-h-[392px] grid-cols-[190px_1fr]">
          <aside className="flex flex-col border-r border-surface/10 bg-surface/5 p-5">
            <div className="mb-7 flex items-center justify-between gap-3">
              <Link
                href="/"
                onClick={onClose}
                className="inline-flex h-10 w-24 items-center justify-center overflow-hidden rounded-md shadow-sm ring-1 ring-surface/10"
                aria-label="The Lawn Guy Bradford home"
              >
                <Image
                  src="/images/lawnguy-logo-text-transparent.webp"
                  alt=""
                  width={1128}
                  height={635}
                  sizes="96px"
                  className="h-full w-full object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-md border border-surface/15 text-surface/65 transition-colors hover:border-accent/70 hover:text-accent"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <nav aria-label="Expanded primary navigation" className="space-y-1">
              <Link
                href="/"
                onClick={onClose}
                aria-current={pathname === '/' ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-between border-b border-surface/10 px-1 py-2.5 text-lg font-semibold transition-colors hover:text-accent',
                  pathname === '/' ? 'text-accent' : 'text-surface/55',
                )}
              >
                Home
                {pathname === '/' && (
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Link>
              {navItems.map((item) => {
                const active = isActive(pathname, item.data.href);
                return (
                  <Link
                    key={item.slug}
                    href={item.data.href as Route}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between border-b border-surface/10 px-1 py-2.5 text-lg font-semibold transition-colors hover:text-accent',
                      active ? 'text-surface' : 'text-surface/55',
                    )}
                  >
                    {item.data.label}
                    {active && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4 pt-7">
              {showLocalSettingsLink && (
                <Link
                  href={SETTINGS_ROUTE}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-md border border-surface/15 px-3 py-2 text-xs font-semibold text-surface/70 transition-colors hover:border-accent/60 hover:text-accent"
                >
                  <Icon name="Settings" size={15} />
                  Site settings
                </Link>
              )}
              <div className="space-y-2 text-xs font-medium text-surface/60">
                <p>{siteSettings.serviceArea}</p>
                <p>Text-first quotes</p>
                <p>Evening/weekend visits</p>
              </div>
            </div>
          </aside>

          <section
            aria-label="Services navigation"
            className="grid grid-cols-2 bg-[radial-gradient(circle_at_50%_18%,rgba(124,179,66,0.18),transparent_38%)]"
          >
            {services.map((service, index) => {
              const active = service.slug === activeServiceSlug;
              return (
                <Link
                  key={service.slug}
                  href="/services"
                  onClick={onClose}
                  onMouseEnter={() => setActiveServiceSlug(service.slug)}
                  onFocus={() => setActiveServiceSlug(service.slug)}
                  className="group relative min-h-[130px] overflow-hidden border-b border-r border-surface/10 p-4 transition-[filter,box-shadow] hover:brightness-110 focus-visible:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
                  style={{
                    background: SERVICE_TILE_BACKGROUNDS[index % SERVICE_TILE_BACKGROUNDS.length],
                  }}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:18px_18px] opacity-0 transition-opacity duration-300 group-hover:opacity-25 group-focus-visible:opacity-25',
                      active && 'opacity-20',
                    )}
                  />
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.18),transparent_32%)]" />
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface/92 text-brand shadow-sm">
                        <Icon name={service.data.icon} size={19} />
                      </span>
                      <p className="max-w-[10.5rem] font-sans text-lg font-semibold leading-tight text-surface">
                        {service.data.name}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-md border border-surface/20 bg-ink/10 text-surface/65 transition-colors group-hover:border-accent/80 group-hover:bg-ink/20 group-hover:text-accent',
                        active && 'border-accent/80 bg-ink/20 text-accent',
                      )}
                    >
                      <Icon name="ArrowUpRight" size={16} />
                    </span>
                  </div>

                  <p className="relative z-10 mt-5 max-w-[14rem] text-sm leading-snug text-surface/72">
                    {service.data.result}
                  </p>
                </Link>
              );
            })}
          </section>
        </div>

        <a
          href={getQuoteCtaHref()}
          onClick={onClose}
          className="group flex h-11 items-center overflow-hidden bg-surface text-sm font-semibold text-ink"
        >
          <span className="nav-marquee-track flex min-w-max items-center gap-6 px-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} className="inline-flex items-center gap-2">
                <Icon name="MessageCircle" size={14} />
                Text for a quote
                <Icon name="ArrowUpRight" size={14} />
              </span>
            ))}
          </span>
        </a>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { theme, toggleTheme } = usePublicTheme();
  const scrollProgress = useScrollProgress(pathname);
  const showLocalSettingsLink = useShowLocalSettingsLink();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsDesktopOpen(false);
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isDesktopOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDesktopOpen(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!panelRef.current) return;
      if (e.target instanceof Node && !panelRef.current.contains(e.target)) {
        setIsDesktopOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isDesktopOpen]);

  return (
    <>
      {!isDesktopOpen && (
        <FloatingNavTrigger
          onClick={() => setIsDesktopOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          scrollProgress={scrollProgress}
          className="hidden md:inline-flex"
        />
      )}

      {!isDrawerOpen && (
        <FloatingNavTrigger
          onClick={() => setIsDrawerOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          scrollProgress={scrollProgress}
          className="inline-flex md:hidden"
        />
      )}

      {isDesktopOpen && (
        <DesktopNavPanel
          pathname={pathname}
          onClose={() => setIsDesktopOpen(false)}
          panelRef={panelRef}
          showLocalSettingsLink={showLocalSettingsLink}
        />
      )}

      <MobileNavDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        pathname={pathname}
        showLocalSettingsLink={showLocalSettingsLink}
      />
    </>
  );
}
