// Help Center search: Pagefind's ready-made search box. On the staff or
// members pages it searches only that audience's articles.
window.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("help-search");
  if (!box || !window.PagefindUI) return;
  const audience = box.dataset.audience; // "staff", "members" or ""
  const label = audience === "staff" ? "Staff" : audience === "members" ? "Members" : "";

  const ui = new window.PagefindUI({
    element: "#help-search",
    showSubResults: true,
    showImages: false,
    resetStyles: false,
    excerptLength: 22,
    translations: {
      placeholder: label ? `Search help for ${label.toLowerCase()}` : "Search the Help Center",
      zero_results: "Nothing found for [SEARCH_TERM]. Try other words, or contact us.",
      filters_label: "Help for",
    },
  });
  if (label) ui.triggerFilters({ audience: [label] });
});
