// Help articles for staff: /help/staff/<file>/
export default {
  layout: "layouts/help-article.njk",
  audience: "staff",
  tags: ["helpStaff"],
  permalink: (data) => `/help/staff/${data.page.fileSlug}/`,
};
