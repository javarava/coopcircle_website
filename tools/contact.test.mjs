// Tests for the contact form function, with Resend and Turnstile mocked: npm test
import assert from "node:assert/strict";
const mod = await import(new URL("../functions/api/contact.js", import.meta.url));
const calls = [];
globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  if (url.includes("turnstile")) return new Response(JSON.stringify({ success: init.body.get("response") === "good" }));
  if (url.includes("resend")) return new Response("{}", { status: 200 });
  throw new Error("unexpected " + url);
};
const env = { RESEND_API_KEY: "re_test", CONTACT_TO: "inbox@example.com", CONTACT_FROM: "Site <site@example.com>", TURNSTILE_SECRET_KEY: "sk" };
const post = (body, e = env) => mod.onRequestPost({ request: new Request("https://x/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }), env: e });
const good = { name: "Ada Obi", email: "Ada@Example.com", society: "Unity CTCS", role: "president", size: "50–200", topic: "demo", message: "We have 120 members and two branches.", "cf-turnstile-response": "good" };

let r = await post(good); assert.equal(r.status, 200); assert.deepEqual(await r.json(), { ok: true });
const sent = calls.find((c) => c.url.includes("resend")); const email = JSON.parse(sent.init.body);
assert.equal(email.reply_to, "ada@example.com"); assert.deepEqual(email.to, ["inbox@example.com"]);
assert.equal(email.subject, "Book a demo: Ada Obi (Unity CTCS)"); assert.match(email.text, /Role: President or chairman/); assert.doesNotMatch(email.text, /Phone:/);
console.log("ok 1 - a good message is emailed with Reply-To the sender");

calls.length = 0; r = await post({ ...good, "cf-turnstile-response": "bad" }); assert.equal(r.status, 403); assert.ok(!calls.some((c) => c.url.includes("resend")));
console.log("ok 2 - a failed robot check isn't sent");
r = await post({ ...good, email: "nope" }); assert.equal(r.status, 422); assert.equal((await r.json()).error, "Please enter a valid email address.");
console.log("ok 3 - a bad email is refused in plain words");
r = await post({ ...good, topic: "hack" }); assert.equal(r.status, 422);
r = await post({ ...good, message: "hi" }); assert.equal(r.status, 422);
r = await post({ ...good, message: "x".repeat(4001) }); assert.equal(r.status, 422);
console.log("ok 4 - topic and message are checked");
calls.length = 0; r = await post({ ...good, website: "http://spam" }); assert.equal(r.status, 200); assert.equal(calls.length, 0);
console.log("ok 5 - the hidden field quietly drops bots");
r = await post(good, { ...env, RESEND_API_KEY: "" }); assert.equal(r.status, 503);
console.log("ok 6 - without Resend set up it says to email instead");
globalThis.fetch = async (url) => url.includes("resend") ? new Response("{}", { status: 500 }) : new Response(JSON.stringify({ success: true }));
r = await post(good); assert.equal(r.status, 502);
console.log("ok 7 - a Resend failure is reported");
r = mod.onRequest(); assert.equal(r.status, 405);
console.log("ok 8 - only POST");
