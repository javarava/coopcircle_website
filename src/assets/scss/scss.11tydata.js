// Stylesheets are written to /assets/css/ and aren't pages.
export default {
  permalink: (data) => `/assets/css/${data.page.fileSlug}.css`,
  eleventyExcludeFromCollections: true,
};
