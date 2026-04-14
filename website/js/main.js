// smooth nav highlight + waitlist form handler
document.addEventListener("DOMContentLoaded", () => {
  // waitlist form
  const form = document.querySelector("#waitlist-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = document.querySelector("#waitlist-success");
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const stored = JSON.parse(localStorage.getItem("editron.waitlist") || "[]");
        stored.push({ ...data, at: new Date().toISOString() });
        localStorage.setItem("editron.waitlist", JSON.stringify(stored));
      } catch (_) {}
      form.reset();
      if (success) {
        success.classList.add("show");
        setTimeout(() => success.classList.remove("show"), 6000);
      }
    });
  }

  // docs active section highlight
  const docsLinks = document.querySelectorAll(".docs-nav a[href^='#']");
  if (docsLinks.length) {
    const ids = Array.from(docsLinks).map((a) => a.getAttribute("href").slice(1));
    const setActive = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      docsLinks.forEach((a) => {
        a.style.color = a.getAttribute("href") === "#" + current ? "var(--text)" : "";
        a.style.borderLeftColor = a.getAttribute("href") === "#" + current ? "var(--accent)" : "";
      });
    };
    window.addEventListener("scroll", setActive, { passive: true });
    setActive();
  }
});
