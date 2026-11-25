// Help articles for members: /help/members/<file>/
export default {
  layout: "layouts/help-article.njk",
  audience: "members",
  tags: ["helpMembers"],
  permalink: (data) => `/help/members/${data.page.fileSlug}/`,
};
