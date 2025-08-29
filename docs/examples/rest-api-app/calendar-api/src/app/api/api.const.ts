const OneHour: number = 60 * 60;

export const ChacheHeaderFifteenMinutes: object = {
  'Cache-Control': `public, s-maxage=${OneHour / 4}, stale-while-revalidate=${OneHour / 4}`,
  'CDN-Cache-Control': `public, s-maxage=${OneHour / 4}`,
  'Vercel-CDN-Cache-Control': `public, s-maxage=${OneHour / 4}`,
};

export const CacheHeaderOneHour: object = {
  'Cache-Control': `public, s-maxage=${OneHour}, stale-while-revalidate=${OneHour}`,
  'CDN-Cache-Control': `public, s-maxage=${OneHour}`,
  'Vercel-CDN-Cache-Control': `public, s-maxage=${OneHour}`,
};

export const CacheHeaderOneDay: object = {
  'Cache-Control': `public, s-maxage=${OneHour * 24}, stale-while-revalidate=${OneHour * 24}`,
  'CDN-Cache-Control': `public, s-maxage=${OneHour * 24}`,
  'Vercel-CDN-Cache-Control': `public, s-maxage=${OneHour * 24}`,
};
