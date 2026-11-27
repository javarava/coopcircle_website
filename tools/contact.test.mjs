// Tests for the contact form function, with SES and Turnstile mocked: npm test
import assert from "node:assert/strict";
const mod = await import(new URL("../functions/api/contact.js", import.meta.url));

const calls = [];
let sesStatus = 200;

/** Stands in for Turnstile and SES, recording each request for assertions. */
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  if (url.includes("turnstile")) {
    calls.push({ url, turnstile: true });
    return new Response(JSON.stringify({ success: init.body.get("response") === "good" }));
  }
  // aws4fetch calls fetch with a signed Request, so read the body as bytes:
  // that also lets us check it was encoded as UTF-8.
  const req = input instanceof Request ? input : new Request(input, init);
  const raw = Buffer.from(await req.arrayBuffer());
  calls.push({ url: req.url, headers: req.headers, raw, body: JSON.parse(raw.toString("utf8")) });
  if (url.includes("amazonaws.com")) {
    return new Response(JSON.stringify(sesStatus === 200 ? { MessageId: "msg-1" } : { message: "SES error" }), { status: sesStatus });
  }
  throw new Error("unexpected " + url);
};

const env = {
  AWS_SES_ACCESS_KEY_ID: "AKIDEXAMPLE",
  AWS_SES_SECRET_ACCESS_KEY: "secret",
  AWS_SES_REGION: "eu-west-1",
  CONTACT_TO: "hello@coopcirclehq.com",
  CONTACT_FROM: "CoopCircle website <website@coopcirclehq.com>",
  TURNSTILE_SECRET_KEY: "sk",
};

/** Posts a form body to the function, optionally with different settings. */
const post = (body, e = env) => mod.onRequestPost({ request: new Request("https://x/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }), env: e });

/** The one SES request in the recorded calls. */
const sent = () => calls.find((c) => c.url.includes("amazonaws.com"));

const good = { name: "Ada Obi", email: "Ada@Example.com", society: "Unity CTCS", role: "president", size: "50–200", topic: "demo", message: "We have 120 members and two branches.", "cf-turnstile-response": "good" };

let r = await post(good);
assert.equal(r.status, 200);
assert.deepEqual(await r.json(), { ok: true });
const email = sent();
assert.equal(email.url, "https://email.eu-west-1.amazonaws.com/v2/email/outbound-emails");
const auth = email.headers.get("authorization");
assert.match(auth, /^AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE\/\d{8}\/eu-west-1\/ses\/aws4_request, SignedHeaders=[^,]+, Signature=[0-9a-f]{64}$/);
assert.equal(email.body.FromEmailAddress, env.CONTACT_FROM);
assert.deepEqual(email.body.Destination.ToAddresses, ["hello@coopcirclehq.com"]);
assert.deepEqual(email.body.Destination.BccAddresses, ["babatundeaniyi@gmail.com", "coopcirclesoftware@gmail.com"]);
assert.deepEqual(email.body.ReplyToAddresses, ["ada@example.com"]);
assert.equal(email.body.Content.Simple.Subject.Data, "Book a demo: Ada Obi (Unity CTCS)");
assert.equal(email.body.Content.Simple.Subject.Charset, "UTF-8");
assert.equal(email.body.Content.Simple.Body.Text.Charset, "UTF-8");
assert.match(email.body.Content.Simple.Body.Text.Data, /Role: President or chairman/);
assert.doesNotMatch(email.body.Content.Simple.Body.Text.Data, /Phone:/);
console.log("ok 1 - a good message is sent to SES, signed for ses in the region, with Reply-To the sender");

calls.length = 0;
r = await post({ ...good, name: "Ada “Ada” Obi", message: "We have ₦7,000 in savings." });
assert.equal(r.status, 200);
const utf8 = sent();
assert.match(utf8.body.Content.Simple.Subject.Data, /“Ada”/);
assert.match(utf8.body.Content.Simple.Body.Text.Data, /₦7,000/);
assert.ok(utf8.raw.includes(Buffer.from("₦7,000", "utf8")));
console.log("ok 2 - naira and curly quotes go out as UTF-8");

calls.length = 0;
r = await post({ ...good, "cf-turnstile-response": "bad" });
assert.equal(r.status, 403);
assert.ok(!sent());
console.log("ok 3 - a failed robot check isn't sent");

r = await post({ ...good, email: "nope" });
assert.equal(r.status, 422);
assert.equal((await r.json()).error, "Please enter a valid email address.");
console.log("ok 4 - a bad email is refused in plain words");

r = await post({ ...good, topic: "hack" });
assert.equal(r.status, 422);
r = await post({ ...good, message: "hi" });
assert.equal(r.status, 422);
r = await post({ ...good, message: "x".repeat(4001) });
assert.equal(r.status, 422);
console.log("ok 5 - topic and message are checked");

calls.length = 0;
r = await post({ ...good, website: "http://spam" });
assert.equal(r.status, 200);
assert.equal(calls.length, 0);
console.log("ok 6 - the hidden field quietly drops bots");

for (const key of ["AWS_SES_ACCESS_KEY_ID", "AWS_SES_SECRET_ACCESS_KEY", "AWS_SES_REGION"]) {
  r = await post(good, { ...env, [key]: "" });
  assert.equal(r.status, 503);
}
console.log("ok 7 - without SES set up it says to email instead");

calls.length = 0;
r = await post(good, { ...env, SES_CONFIGURATION_SET: "contact-tracking" });
assert.equal(r.status, 200);
assert.equal(sent().body.ConfigurationSetName, "contact-tracking");
console.log("ok 8 - a configuration set is added when set up");

sesStatus = 500;
r = await post(good);
assert.equal(r.status, 502);
assert.equal((await r.json()).error, "Your message didn’t send. Please try again in a minute, or email us.");
sesStatus = 200;
console.log("ok 9 - an SES failure is reported");

r = mod.onRequest();
assert.equal(r.status, 405);
console.log("ok 10 - only POST");
