import path from "node:path";
import * as sass from "sass";

/**
 * coopcirclehq.com — built with Eleventy into `_site/`, served by
 * Cloudflare Pages (build command `npm run build`, output `_site`).
 */
export default function (eleventyConfig) {
  // ── Sass: src/assets/scss/main.scss → /assets/css/main.css ──────────────
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compile(inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      // Partials (_tokens.scss…) are only imported.
      if (parsed.name.startsWith("_")) return;
      const result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir, "node_modules"],
        style: "compressed",
        sourceMap: false,
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin", "color-functions"],
      });
      this.addDependencies(inputPath, result.loadedUrls);
      return () => result.css;
    },
  });

  // ── Files copied as they are ────────────────────────────────────────────
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "assets/js/bootstrap.bundle.min.js",
    "node_modules/bootstrap-icons/bootstrap-icons.svg": "assets/icons/bootstrap-icons.svg",
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2":
      "assets/fonts/inter-latin-wght-normal.woff2",
    "node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2":
      "assets/fonts/outfit-latin-wght-normal.woff2",
  });

  // ── Filters ─────────────────────────────────────────────────────────────
  // ₦7,000 — whole naira, as on the Pricing page.
  eleventyConfig.addFilter("naira", (n) =>
    n === null || n === undefined ? "" : "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 }),
  );
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  // An absolute URL for canonical links and Open Graph.
  eleventyConfig.addFilter("absolute", (url, base) => new URL(url, base).href);

  // A Bootstrap Icons glyph from the sprite: {% icon "piggy-bank" %}
  eleventyConfig.addShortcode(
    "icon",
    (name, cls = "") =>
      `<svg class="bi ${cls}" aria-hidden="true" focusable="false"><use href="/assets/icons/bootstrap-icons.svg#${name}"></use></svg>`,
  );

  // Help articles in a category, in their `order`.
  eleventyConfig.addFilter("inCategory", (articles, slug) =>
    (articles || [])
      .filter((a) => a.data.category === slug)
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)),
  );
  // Articles flagged `popular`, for the Help Center home.
  eleventyConfig.addFilter("popular", (articles) => (articles || []).filter((a) => a.data.popular));
  eleventyConfig.addFilter("find", (list, key, value) => (list || []).find((x) => x[key] === value));

  // Links that leave coopcirclehq.com (the apps on their sub-domains,
  // Paystack…) and the app store buttons open in a new tab, with a note for
  // screen readers. mailto:, tel: and on-site links are left alone.
  const SITE_HOSTS = new Set(["coopcirclehq.com", "www.coopcirclehq.com"]);
  const NEW_TAB_NOTE = "(opens in a new tab)";
  eleventyConfig.addTransform("external-links", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (tag, attrs, inner) => {
      if (/\btarget=/i.test(attrs)) return tag;
      const href = (attrs.match(/\bhref="([^"]*)"/i) || [])[1] || "";
      const store = /\bclass="[^"]*\bstore-badge\b/i.test(attrs);
      let external = false;
      if (/^https?:\/\//i.test(href)) {
        try {
          external = !SITE_HOSTS.has(new URL(href).hostname);
        } catch {
          external = false;
        }
      }
      if (!external && !store) return tag;
      let out = attrs.replace(/\baria-label="([^"]*)"/i, (_, label) => `aria-label="${label} ${NEW_TAB_NOTE}"`);
      const labelled = out !== attrs;
      out += ' target="_blank" rel="noopener"';
      const note = labelled ? "" : ` <span class="visually-hidden">${NEW_TAB_NOTE}</span>`;
      return `<a${out}>${inner}${note}</a>`;
    });
  });

  eleventyConfig.setServerOptions({ watch: ["_site/assets/css/*.css"] });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md", "html", "scss"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
