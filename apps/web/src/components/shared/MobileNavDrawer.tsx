'use client';

import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LinkButton } from './Button';
import { Icon } from './Icon';
import { cn } from '@/lib/cn';
import { navItems, siteSettings } from '@/lib/website-data';
import { getQuoteCtaHref } from '@/lib/contact-href';

type Props = {
  open: boolean;
  onClose: () => void;
  pathname: string;
  showLocalSettingsLink: boolean;
};

const SETTINGS_ROUTE = '/admin/settings' as Route;

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function MobileNavDrawer({ open, onClose, pathname, showLocalSettingsLink }: Props) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const scrimVariants = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const panelVariants = reduce
    ? { initial: { y: 0, scale: 1 }, animate: { y: 0, scale: 1 }, exit: { y: 0, scale: 1 } }
    : {
        initial: { y: -18, scale: 0.96, opacity: 0 },
        animate: { y: 0, scale: 1, opacity: 1 },
        exit: { y: -18, scale: 0.96, opacity: 0 },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 md:hidden"
        >
          <motion.div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-bg/[0.78] backdrop-blur-sm"
            variants={scrimVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
          <motion.div
            data-lenis-prevent
            className="absolute left-1/2 top-5 flex max-h-[calc(100dvh-2.5rem)] w-[min(340px,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-y-auto rounded-[1.75rem] bg-surface-alt p-3 shadow-2xl"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-11 items-center justify-between rounded-full bg-ink px-2 text-surface">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex h-9 items-center gap-1 rounded-full px-2 text-sm font-semibold transition-colors hover:bg-surface/10"
              >
                <Icon name="X" size={18} />
                Close
              </button>
              <span
                className="inline-flex h-8 w-20 items-center justify-center overflow-hidden rounded-full border border-surface/15 px-1"
                aria-label={siteSettings.businessName}
              >
                <Image
                  src="/images/lawnguy-logo-text-transparent.webp"
                  alt=""
                  width={1128}
                  height={635}
                  sizes="80px"
                  className="h-full w-full object-contain"
                />
              </span>
            </div>

            <div className="px-2 pb-2 pt-5">
              <p className="mb-1 text-xs font-medium text-ink-muted">Menu</p>
              <nav aria-label="Mobile" className="border-b border-line pb-8">
                <ul className="flex flex-col gap-1">
                  <li>
                    <Link
                      href="/"
                      onClick={onClose}
                      aria-current={pathname === '/' ? 'page' : undefined}
                      className={cn(
                        'block rounded-md px-1 py-1 text-2xl font-semibold leading-tight transition-colors hover:text-brand',
                        pathname === '/' ? 'text-brand' : 'text-ink',
                      )}
                    >
                      Home
                    </Link>
                  </li>
                  {navItems.map((item) => {
                    const active = isActive(pathname, item.data.href);
                    return (
                      <li key={item.slug}>
                        <Link
                          href={item.data.href as Route}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'block rounded-md px-1 py-1 text-2xl font-semibold leading-tight transition-colors hover:text-brand',
                            active ? 'text-brand' : 'text-ink',
                          )}
                        >
                          {item.data.label}
                        </Link>
                      </li>
                    );
                  })}
                  {showLocalSettingsLink && (
                    <li className="pt-5">
                      <Link
                        href={SETTINGS_ROUTE}
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-brand/50 hover:text-brand"
                      >
                        <Icon name="Settings" size={16} />
                        Site settings
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>

            <div className="grid gap-10 px-3 pb-8 pt-4">
              <section>
                <p className="mb-3 text-xs font-medium text-ink-muted">Local</p>
                <div className="space-y-2 text-sm font-semibold text-ink">
                  <p>{siteSettings.serviceArea}</p>
                  <p>Text-first quotes</p>
                  <p>Evening/weekend quote visits</p>
                </div>
              </section>

              <section>
                <p className="mb-3 text-xs font-medium text-ink-muted">Contact</p>
                <div className="space-y-2 text-sm font-semibold text-ink">
                  <a
                    href={siteSettings.emailHref}
                    className="block transition-colors hover:text-brand"
                  >
                    {siteSettings.emailDisplay}
                  </a>
                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="block transition-colors hover:text-brand"
                  >
                    Contact page
                  </Link>
                </div>
              </section>
            </div>

            <div className="px-3 pb-3">
              <LinkButton href={getQuoteCtaHref()} size="md" variant="primary" className="w-full">
                <Icon name="MessageCircle" size={18} />
                Text For A Quote
              </LinkButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
