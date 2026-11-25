// Site-wide settings and links. The apps are separate Flutter web apps on
// their own sub-domains.
export default {
  name: "CoopCircle",
  url: "https://coopcirclehq.com",
  description:
    "Savings, dues, loans and payments for every branch of your cooperative society, and an app where members can see their own accounts.",
  locale: "en_NG",

  apps: {
    staff: "https://staff.coopcirclehq.com",
    member: "https://member.coopcirclehq.com",
    signUp: "https://staff.coopcirclehq.com/create-society",
    staffSignIn: "https://staff.coopcirclehq.com/sign-in",
    memberSignIn: "https://member.coopcirclehq.com/sign-in",
  },

  // Not listed yet: '#' until they are.
  stores: {
    staff: { googlePlay: "#", appStore: "#" },
    member: { googlePlay: "#", appStore: "#" },
  },

  // ⚠ Confirm before launch: the registered company and the inboxes below
  // are used on the Contact, Privacy and Terms pages.
  company: {
    name: "CoopCircle",
    legalName: "CoopCircle", // the registered company name, e.g. "… Limited"
    country: "Nigeria",
    address: "", // registered address; left out of the pages while empty
    email: "hello@coopcirclehq.com",
    privacyEmail: "privacy@coopcirclehq.com",
    legalUpdated: "25 November 2026",
  },

  // Cloudflare Turnstile (spam protection on the contact form): the public
  // site key, set as CF_TURNSTILE_SITE_KEY in Cloudflare Pages. Empty: off.
  turnstileSiteKey: process.env.CF_TURNSTILE_SITE_KEY || "",

  // Cloudflare Web Analytics (no cookies, so no banner). Empty: off.
  // Set it in Cloudflare Pages → Settings → Environment variables.
  analyticsToken: process.env.CF_ANALYTICS_TOKEN || "",
};
