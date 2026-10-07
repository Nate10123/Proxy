# Drift — personal reading proxy

A responsive URL-entry website with a server-side relay for public HTTP/HTTPS pages.

## Run on Vercel

Use Node.js 22.13+:

    npm ci
    npm test
    npm run build
    npm start

Deploy with the Next.js framework preset, the default output directory, and npm run build. No environment variables, databases, paid integrations, or paid services are required. Use the free Hobby plan.

The relay runs in a Node.js function and uses Cheerio to rewrite HTML. Requests are dynamic, uncached, and limited to 60 seconds. Files and rewritten HTML are limited to 4 MB to stay below Vercel's function payload limit.

## Behavior and limits

- GET requests only; no browsing history or cookies are deliberately stored.
- Follows up to five redirects and revalidates each target.
- Blocks IP literals, private IPv4 DNS answers, credentials in URLs, nonstandard ports, and non-web schemes.
- Rewrites ordinary links, images, stylesheets, and CSS URLs through the relay.
- Sandboxes retrieved documents and disables scripts, forms, sign-ins, embeds, and frames.
- Supports public reading pages. JavaScript apps, streaming, CAPTCHA-protected sites, IPv6-only sites, some CSS, responsive images, and downloads may fail.
- This is a reading proxy, not a VPN or anonymity guarantee.

The original Cloudflare/Sites scaffolding remains in the repository, excluded from the Vercel TypeScript build. The visible website design is unchanged.
