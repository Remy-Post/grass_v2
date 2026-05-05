import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

function createNextConfig(phase: string): NextConfig {
  const isDevelopmentServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    distDir: isDevelopmentServer ? '.next-dev' : '.next',
    reactStrictMode: true,
    transpilePackages: ['@lawnguy/brand'],
    typedRoutes: true,
    images: {
      formats: ['image/avif', 'image/webp'],
    },
    poweredByHeader: false,
    // Allow NodeNext-style `.js` import specifiers from workspace TS packages
    // by letting webpack also resolve `.ts`/`.tsx` for those paths.
    // NOTE: Turbopack (`next dev --turbopack`) does NOT support webpack's
    // `extensionAlias`, so the brand package's relative `.js` imports break under
    // Turbopack. The default `dev` script uses webpack; a `dev:turbo` script is
    // available for opting into Turbopack once that gap is closed upstream.
    webpack(config) {
      config.resolve = config.resolve ?? {};
      config.resolve.extensionAlias = {
        ...(config.resolve.extensionAlias ?? {}),
        '.js': ['.ts', '.tsx', '.js', '.jsx'],
        '.mjs': ['.mts', '.mjs'],
      };
      return config;
    },
  };
}

export default createNextConfig;
