// Waitlist form → Google Forms.
// Google doesn't send CORS headers, so we fire in no-cors mode and
// treat any non-network outcome as success. Submissions still land.
const FORM_ID = "1FAIpQLSfOKP8kS_xghROeTIth2hWUrDIGADeRaZ7sfUvOKDOoUvjOIA";
const EMAIL_ENTRY = "entry.793541744";
const FORM_ENDPOINT = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

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

  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (new FormData(form).get("email") || "").toString().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter a valid email address.", "is-error");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    setStatus("Adding you to the list…");

    const body = new URLSearchParams({ [EMAIL_ENTRY]: email });

    try {
      await fetch(FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body,
      });
      form.reset();
      setStatus("You're on the list — we'll be in touch as seats open.", "is-ok");
    } catch (_) {
      setStatus("Couldn't reach the waitlist — try again in a moment.", "is-error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
