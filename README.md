# coopcirclehq.com

CoopCircle's website and Help Center: a static site built with
[Eleventy](https://www.11ty.dev/) and Bootstrap 5.3 (through Sass), hosted on
Cloudflare Pages from this repository.

The apps live elsewhere, on their own sub-domains:

| App | URL |
|---|---|
| Coop Staff | https://staff.coopcirclehq.com (sign-up: `/create-society`) |
| Coop Member | https://member.coopcirclehq.com |
| Coop Admin | https://admin.coopcirclehq.com (not linked from the site) |

## Working on it

```sh
npm install
npm run dev      # http://localhost:8080, reloads as you edit (no search)
npm run build    # builds into _site/ and the Help Center's search index
npm run preview  # build, then serve _site/ with search working
npm test         # the contact form function's tests
```

Node 20 or later.

## Where things are

```
src/
  _data/site.js        URLs of the apps, store links ('#' until listed), analytics
  _data/plans.js       the plans and prices (proposals — keep in step with the app)
  _data/nav.js         the header menus and footer columns
  _includes/layouts/   base.njk: <head>, header, footer, scripts
  _includes/layouts/   feature.njk: product, audience and security pages from front matter
  _includes/partials/  header.njk (mega menus, phone menu), footer.njk, cta.njk,
                       visuals.njk (the product illustrations, by name)
  assets/scss/         _tokens.scss (colours, type, radii) and the Bootstrap set-up in main.scss
  assets/js/main.js    header shadow, menus opening on hover on desktop
  assets/img/brand/    logos (from branding/SVG); coopcircle-logo-white.svg is for dark backgrounds
  static/              copied to the root as is: _headers (Cloudflare), robots.txt
  index.njk            the home page
  pricing.njk          plans, monthly/yearly switch, comparison table
  security.njk         security (feature layout)
  product/*.njk        product pages (feature layout; front matter only)
  for/*.njk            audience pages (feature layout)
  help/index.njk       the Help Center home (search, the two doors, popular articles)
  help/staff/*.md      articles for staff; help/members/*.md for members
  about.njk, contact.njk, privacy.md, terms.md, cookies.md
  _data/helpCategories.js  the Help Center's categories, in order
functions/api/contact.js   the contact form (Cloudflare Pages Function)
tools/contact.test.mjs     its tests
tools/og-image.html    the social share image's source (see below)
branding/              the original logo files
```

### Design rules

- Colours come from the logo: navy `#014c9c` / `#013876`, blue `#0065bf`,
  green `#2daa30` (accent; dark text on it). Warm neutrals for backgrounds.
- Headings: Outfit; text: Inter. Both self-hosted.
- Copy: plain, sentence case, curly apostrophes (’), naira as `₦7,000`.
  See **Writing** below.
- No invented customers, numbers or quotes. The home hero uses screenshots from
  the demo apps; other product illustrations are drawn in HTML with sample figures.
- Check every page at 360, 768, 1,024 and 1,440 px with no sideways scrolling.

### Writing

> Agreed Nov 2026.

We write for members and executives of local cooperative societies, many
reading English as a second language, on a phone.

- **Nigerian English, British spelling:** organise, colour, programme,
  enrolment. The one exception is **Help Center**, which keeps its name.
- **Short sentences:** about 15 to 20 words, with one idea each. Say what
  the reader gets or does, not what the software "enables".
- **Plain headlines.** "See every member’s savings and loans in one place",
  not a clever slogan.
- **App words:** use the same words as the apps, from the word list in the
  app repo's `docs/10-conventions.md` (**Words**). For example, "Payment to
  member", not "payout". Explain money words the first time they
  appear, or link to the Help Center's "Words we use" page.
- **Avoid:**

  | Don’t write | Write |
  |---|---|
  | in the loop | can see, are told |
  | up and running | ready to use, set up |
  | sign off (on) | approve |
  | chasing paper | collecting forms by hand |
  | in plain sight | easy to see |
  | settled to | paid into |
  | reconcile | check, match |
  | seamless, streamline, leverage, robust, empower(s) (as a verb) | say what actually happens |
  | finally, actually, simply, just | (leave it out) |
  | onboarding | setting up, getting started |
  | reach out | contact us |
  | ledgers | record books |
  | payroll | salary deduction |

`npm test` runs `tools/words.test.mjs`, which fails if one of these words, or
an old app word (payout, reversed, loan product, import…), is used in the
copy. The Help Center's **Words we use** page (`/help/words/`) explains money
words; its list is `src/_data/words.js`. Keep it in step with the app repo's
word list.

### Help Center articles

Each article is a Markdown file in `src/help/staff/` or `src/help/members/`;
its URL is `/help/staff/<file name>/`. Front matter:

```yaml
---
title: "Approve payments"
description: "One sentence shown under the title and in search."
category: "payments"     # a slug from src/_data/helpCategories.js
order: 1                 # its place in the category
plan: "Starter and up"   # optional
app: "Coop Staff"        # optional
popular: true            # optional: listed on the Help Center home
---
```

Write numbered steps with the app's own button names in **bold**, as they
appear in the apps. Check them against the app (coopcircle `docs/07` and
`docs/08`) when screens change. Search is built by Pagefind from the
articles only (`data-pagefind-body`).

### Company details and legal pages

`src/_data/site.js → company` holds the registered name, address and the
inboxes used on Contact, Privacy and Terms. **Confirm them before launch**,
and have the legal pages (`privacy.md`, `terms.md`, `cookies.md`) reviewed by
a lawyer; they're drafts written for the Nigeria Data Protection Act 2023.

### Links to other sites

Links that leave coopcirclehq.com (the apps on their sub-domains, Paystack…)
and the app store buttons open in a new tab automatically, with
`rel="noopener"` and "(opens in a new tab)" for screen readers. It's done at
build time by the `external-links` transform in `eleventy.config.js`, so just
write normal links.

### Prices

`src/_data/plans.js` mirrors `public.subscription_plans` in the app
(coopcircle `docs/12-subscriptions.md`). The prices are still proposals; when
they're final, change them here in the same release as the app and Paystack.

### The share image

`src/assets/img/og-default.png` (1200 × 630) is a screenshot of
`tools/og-image.html`. To change it, copy that file into `_site/`, serve
`_site/`, and take a 1200 × 630 screenshot of it (for example with headless
Chrome: `--headless=new --window-size=1200,630 --screenshot=…`).

## Hosting: Cloudflare Pages

`coopcirclehq.com` is registered with Cloudflare, so its DNS is already in
Cloudflare. `staff`, `member` and `admin` already point to their apps:
**leave those records as they are**. The website only needs the bare domain
and `www`.

One-time set-up in the Cloudflare dashboard:

1. **Workers & Pages → Create → Pages → Connect to Git**, and choose this
   repository.
2. **Build settings:** framework preset **None**, build command
   `npm run build`, output directory `_site`. Add the environment variable
   `NODE_VERSION` = `22`. The `functions/` folder (the contact form) is
   picked up automatically.
3. **Custom domains** (the Pages project → Custom domains): add
   `coopcirclehq.com`, then `www.coopcirclehq.com`. Because the domain is on
   Cloudflare, the DNS records are created for you. If Cloudflare says a
   record already exists for the bare domain or `www` (a parking page, for
   example), let it replace that one only.
4. **`www` → bare domain:** Rules → **Redirect Rules** → create a rule:
   when the hostname equals `www.coopcirclehq.com`, redirect (301) to
   `https://coopcirclehq.com` with the path and query string kept.
5. **Contact form** (the Pages project → Settings → Variables and secrets,
   for Production and Preview):
   - `AWS_SES_ACCESS_KEY_ID` and `AWS_SES_SECRET_ACCESS_KEY` (both secrets),
     from a dedicated IAM user `coopcircle-website-ses`. Give it an inline
     policy allowing only `ses:SendEmail` on
     `arn:aws:ses:<region>:<account>:identity/coopcirclehq.com`.
   - `AWS_SES_REGION`, the region where `coopcirclehq.com` is verified in SES.
     `SES_CONFIGURATION_SET` is optional, for bounce and complaint tracking.
   - `CONTACT_TO` (`hello@coopcirclehq.com`) and `CONTACT_FROM`
     (`CoopCircle website <website@coopcirclehq.com>`). The form BCCs
     `babatundeaniyi@gmail.com` and `coopcirclesoftware@gmail.com`; those
     addresses are in `functions/api/contact.js`.
   - Delete `RESEND_API_KEY`. Verify `coopcirclehq.com` in SES instead of
     Resend, and remove Resend's DNS records once a test message arrives. If
     SES is still in the sandbox, `CONTACT_TO` must be a verified address too.
   - Turnstile: Turnstile → add a widget for `coopcirclehq.com`, then set
     `CF_TURNSTILE_SITE_KEY` (public, used at build time) and
     `TURNSTILE_SECRET_KEY` (secret), and deploy again. Without them the
     form still works, with only the hidden-field spam check.
6. **Analytics:** in the Pages project → Metrics, turn on **Web Analytics**
   (cookie-free, so no consent banner). Cloudflare adds the beacon itself;
   only set `CF_ANALYTICS_TOKEN` instead if you'd rather add it from the
   site, not both.

Every push to `main` deploys; every other branch gets a preview URL.

`src/static/_headers` sets the security headers (including the Content
Security Policy) and caching. If a page needs a new outside script, add its
domain to the policy there.
