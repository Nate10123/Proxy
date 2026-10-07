# Drift — personal reading proxy

A responsive URL-entry website with a server-side relay for public HTTP/HTTPS pages.

## Status
Source implemented. Direct tests pass for URL validation, private IPv4 blocking, link rewriting, and a mocked server relay. Full framework build, HTMLRewriter integration, browser testing, and live deployment remain unverified. This session could not download npm dependencies or connect to the Sites Git endpoint. No live version exists.

## Run
Use Node.js 22.13+ and a working internet connection:

    npm ci
    npm run dev

The server defaults to http://localhost:5173. The proxy uses Cloudflare HTMLRewriter and is intended for the Cloudflare Worker runtime used by Vinext; confirm this API works in the local preview before using real pages.

## Checks

    node --experimental-strip-types verify-proxy.mjs
    npm run build

## Resume Sites publication
Keep `.openai/hosting.json` unchanged. Existing project ID: appgprj_6ac60a43bd948191887be48cf83224e7. The registered site is owner-private and unpublished. Resume with Sites from this source; obtain a new short-lived source credential for this existing project, push source through the Sites helper, build/package, then save and deploy. Do not register another copy merely to retry.

## Behavior and limits
- GET requests only; no browsing history or cookies are deliberately stored by this application.
- Follows up to five redirects and revalidates each target.
- Blocks IP literals, private IPv4 DNS answers, credentials in URLs, nonstandard ports, and non-web URL schemes.
- Rewrites ordinary page links, image paths, stylesheet links, and CSS URLs through the relay.
- Sandboxes retrieved documents and disables scripts, forms, sign-ins, embeds, and frames.
- Supports public reading pages; not a full Proxyium replacement. JavaScript applications, streaming, CAPTCHA-protected sites, IPv6-only sites, some CSS, responsive images, and downloads may fail.
- An 8 MB file limit and request timeouts apply.
- Not a VPN or an anonymity guarantee. Hosting and destination providers can observe requests. Do not use it for sensitive information.
- No paid services were purchased in this session. Hosting availability and quotas are controlled by the hosting provider; unlimited free service is not guaranteed.

## Main files
- app/page.tsx: URL entry and reading frame
- app/globals.css: responsive Drift interface
- app/proxy/route.ts: page relay and rewriting
- verify-proxy.mjs: direct logic checks with mocked requests
