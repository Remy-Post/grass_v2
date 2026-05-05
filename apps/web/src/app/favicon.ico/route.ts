const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#1f5a3a"/>
  <path d="M14 42c8-18 23-24 38-26-4 12-11 25-30 30 6-7 13-13 22-18-10 2-20 8-30 14Z" fill="#7cb342"/>
  <path d="M16 46h34" stroke="#f5c518" stroke-width="5" stroke-linecap="round"/>
</svg>`;

export function GET(): Response {
  return new Response(favicon, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/svg+xml',
    },
  });
}
