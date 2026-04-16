// Waitlist form handler — writes to localStorage for now.
// TODO(waitlist-backend): POST to a real endpoint once it exists.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#waitlist-form");
  const status = document.querySelector("#waitlist-status");
  if (!form) return;

  const setStatus = (msg, kind) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove("is-error", "is-ok");
    if (kind) status.classList.add(kind);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const email = (data.email || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter a valid email address.", "is-error");
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem("editron.waitlist") || "[]");
      stored.push({ email, at: new Date().toISOString() });
      localStorage.setItem("editron.waitlist", JSON.stringify(stored));
    } catch (_) {}

    form.reset();
    setStatus("You're on the list — we'll be in touch as seats open.", "is-ok");
  });
});
