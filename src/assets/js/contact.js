// The contact form: picks the topic from ?topic=, checks the fields, sends
// to /api/contact and shows the result without leaving the page.
(() => {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("contact-status");
  const send = document.getElementById("contact-send");
  const done = document.getElementById("contact-done");

  const topic = new URLSearchParams(location.search).get("topic");
  if (topic && form.topic.querySelector(`option[value="${CSS.escape(topic)}"]`)) form.topic.value = topic;

  const say = (text, isError) => {
    status.textContent = text || "";
    status.classList.toggle("is-error", !!isError);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    say("");
    form.classList.add("was-validated");
    if (!form.checkValidity()) {
      say("Please fill in the fields marked in red.", true);
      form.querySelector(":invalid")?.focus();
      return;
    }
    send.disabled = true;
    send.textContent = "Sending…";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Your message didn’t send. Please try again.");
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (err) {
      say(err instanceof TypeError
        ? "We couldn’t reach our server. Check your connection and try again."
        : err.message || "Your message didn’t send. Please try again.", true);
      window.turnstile?.reset();
    } finally {
      send.disabled = false;
      send.textContent = "Send message";
    }
  });
})();
