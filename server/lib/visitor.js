// Coarse visitor classification for share-link opens. Deliberately header-only: no IP
// storage, no fingerprinting, nothing that needs a cookie or a third party.
//
// Why this matters: a resume link sent by email is usually fetched by machines before a
// person ever clicks it. Mail security scanners (Outlook Safe Links, Microsoft Defender,
// Proofpoint, Mimecast), chat unfurlers (LinkedIn, Slack, WhatsApp) and search crawlers
// would otherwise show up as "the company opened it".

const BOT_UA = new RegExp(
  [
    // generic self-identifying crawlers
    // (not a bare 'bot': the Cubot phone brand would match)
    '\\bbot\\b', '[a-z]bot/', 'crawl', 'spider', 'slurp', 'scanner', 'preview', 'fetcher', 'monitor', 'validator',
    // link unfurlers and social previews
    'linkedinbot', 'slackbot', 'slack-imgproxy', 'facebookexternalhit', 'facebookcatalog', 'twitterbot',
    'discordbot', 'whatsapp', 'telegrambot', 'skypeuripreview', 'redditbot', 'embedly', 'iframely', 'vkshare',
    // Google and Gmail
    'googlebot', 'googleimageproxy', 'google-safety', 'google-read-aloud', 'feedfetcher-google',
    'mediapartners-google', 'adsbot-google', 'google-inspectiontool', 'apis-google', 'chrome-lighthouse',
    // Microsoft: Outlook Safe Links, Defender, Office link previews, Bing
    'bingpreview', 'bingbot', 'msnbot', 'safelinks', 'microsoft defender', 'microsoft-defender',
    'microsoft office', 'ms-office', 'msoffice', 'microsoft outlook', 'outlook-ios', 'outlook-android',
    'microsoft preview',
    // other mail security gateways
    'proofpoint', 'mimecast', 'barracuda', 'forcepoint', 'trendmicro', 'symantec', 'sophos', 'fortiguard',
    'zscaler', 'cisco', 'ironport', 'paloalto',
    // scripts and headless browsers
    'curl/', 'wget/', 'python-requests', 'python-urllib', 'aiohttp', 'httpx', 'go-http-client', 'node-fetch',
    'undici', 'axios/', 'okhttp', 'java/', 'apache-httpclient', 'libwww-perl', 'httpclient', 'postmanruntime',
    'insomnia', 'headlesschrome', 'phantomjs', 'puppeteer', 'playwright', 'selenium',
    // other search and SEO crawlers
    'applebot', 'duckduckbot', 'baiduspider', 'ahrefs', 'semrush', 'bytespider'
  ].join('|'),
  'i'
);

const MOBILE_UA = /mobi|android|iphone|ipad|ipod|windows phone/i;

export function classifyVisitor(req) {
  const ua = String(req.headers['user-agent'] || '');
  const purpose = String(req.headers['sec-purpose'] || req.headers.purpose || req.headers['x-moz'] || '');

  const bot =
    !ua ||
    BOT_UA.test(ua) ||
    // Unfurlers often send HEAD first; people never do.
    req.method === 'HEAD' ||
    // Speculative prefetch is not a visit.
    /prefetch/i.test(purpose) ||
    // Every real browser sends Accept-Language. Scanners that spoof a Chrome user agent
    // (Safe Links, Defender detonation) usually do not.
    !req.headers['accept-language'];

  const device = bot ? 'bot' : MOBILE_UA.test(ua) ? 'mobile' : 'desktop';
  const rawCountry = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
  const country = /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : undefined;

  return { bot, device, country };
}
