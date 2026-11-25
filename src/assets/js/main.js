// coopcirclehq.com: the header's shadow once scrolled, and the mega menus
// opening on hover on desktop (they still open on click and by keyboard).
(() => {
  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const desktop = window.matchMedia("(min-width: 992px) and (hover: hover)");
  const megas = document.querySelectorAll(".main-nav .dropdown.mega");

  megas.forEach((item) => {
    const toggle = item.querySelector("[data-bs-toggle='dropdown']");
    if (!toggle || !window.bootstrap) return;
    const dropdown = window.bootstrap.Dropdown.getOrCreateInstance(toggle);
    let closeTimer;

    item.addEventListener("mouseenter", () => {
      if (!desktop.matches) return;
      clearTimeout(closeTimer);
      megas.forEach((other) => {
        if (other !== item) {
          const t = other.querySelector("[data-bs-toggle='dropdown']");
          window.bootstrap.Dropdown.getInstance(t)?.hide();
        }
      });
      dropdown.show();
    });

    item.addEventListener("mouseleave", () => {
      if (!desktop.matches) return;
      closeTimer = setTimeout(() => dropdown.hide(), 180);
    });
  });

  // Closing the phone menu when a link inside it is followed.
  const menu = document.getElementById("siteMenu");
  menu?.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (link && window.bootstrap && !desktop.matches) {
      window.bootstrap.Offcanvas.getInstance(menu)?.hide();
    }
  });
})();

// Pricing: monthly or yearly prices.
(() => {
  const buttons = document.querySelectorAll("[data-billing]");
  if (!buttons.length) return;
  const show = (period) => {
    buttons.forEach((b) => {
      const on = b.dataset.billing === period;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    document.querySelectorAll("[data-price-monthly]").forEach((el) => (el.hidden = period !== "monthly"));
    document.querySelectorAll("[data-price-annual]").forEach((el) => (el.hidden = period !== "annual"));
  };
  buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.billing)));
})();
