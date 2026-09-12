# NTitled — website

Static site. No build step, no dependencies. Production origin is
**https://ntitled.in** and every file below is already wired for it.

```
index.html      markup + copy, canonical/OG/JSON-LD pointing at https://ntitled.in
styles.css      tokens, components, sections, responsive, reduced-motion
script.js       nav, reveals, audience toggle, modal, form  (config at the top)
assets/         logo mark, wordmark, full lockup, favicon
robots.txt      allows all, points at the sitemap
sitemap.xml     single URL: https://ntitled.in/

_redirects      Netlify / Cloudflare Pages — http→https, www→bare domain
_headers        Netlify / Cloudflare Pages — HSTS, CSP, caching
netlify.toml    Netlify — publish root as-is
vercel.json     Vercel — www→bare redirect, same headers
.htaccess       Apache / cPanel / shared hosting — http→https, www→bare, headers
```

## Deploy

Pick one. In every case the site is served over HTTPS at https://ntitled.in
as soon as DNS is pointed at the host; the host issues the certificate itself.

| Host | Steps |
| --- | --- |
| **Netlify** | Drag the folder onto app.netlify.com (or connect the repo). Domain settings → add `ntitled.in` and `www.ntitled.in` → follow the DNS instructions. Netlify provisions Let's Encrypt automatically; `_redirects` / `_headers` do the rest. |
| **Cloudflare Pages** | Create a Pages project, build command empty, output dir `/`. Custom domains → add `ntitled.in` (+ `www`). If the domain is on Cloudflare DNS, also set **SSL/TLS → Full (strict)** and **Always Use HTTPS** on. |
| **Vercel** | `vercel --prod` from this folder or import the repo. Settings → Domains → add `ntitled.in` and `www.ntitled.in`. `vercel.json` handles headers and the www redirect; Vercel forces HTTPS by default. |
| **cPanel / Apache** | Upload everything (including the hidden `.htaccess`) to `public_html`. In cPanel run **SSL/TLS Status → AutoSSL** (or install a Let's Encrypt cert) for `ntitled.in` and `www.ntitled.in`. `.htaccess` then forces HTTPS and the bare domain. |

DNS at the registrar, whichever host you choose:

```
ntitled.in       A / ALIAS   → host's IP or apex target
www.ntitled.in   CNAME       → host's target
```

After DNS resolves, check https://ntitled.in loads with a padlock, that
http://ntitled.in and https://www.ntitled.in both 301 to it, and that
https://ntitled.in/sitemap.xml returns the sitemap.

### Changing the domain later

Search-and-replace `ntitled.in` in: `index.html`, `robots.txt`, `sitemap.xml`,
`_redirects`, `vercel.json`, `.htaccess`. Nothing else references it.

## The three things to change first

All at the top of `script.js`:

| Constant | What it does |
| --- | --- |
| `FORM_ENDPOINT` | Empty by default, so the contact form opens the visitor's mail app with everything pre-filled. Paste a Formspree / Basin / Web3Forms URL to collect submissions properly. The CSP in `_headers` / `vercel.json` / `.htaccess` already allows those three; add any other provider to `connect-src` and `form-action`. |
| `CONTACT_EMAIL` | Fallback inbox. Currently `hello@ntitled.co` — also hardcoded in the contact block, footer and JSON-LD of `index.html`, change all three. |
| `TESTIMONIALS` | Empty array. Add `{ quote, name, org }` objects and the quote grid appears under "Early days, on purpose." |

## Notes

- Pricing shows only "from ₹30,000/month" plus the five tier names. No rate card,
  no creator pay bands, no margins. Full pricing stays behind the call.
- No paid-ads language anywhere, per current scope.
- The logo lockup is used without the founder line.
- Colours, spacing and motion all come from CSS custom properties in `:root`.
- The CSP whitelists Google Fonts and the three form providers only. Adding any
  other third-party script/embed (analytics, chat widget) means adding its
  origin to `script-src` / `connect-src` in all three header files.
