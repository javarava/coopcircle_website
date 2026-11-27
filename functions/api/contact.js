// POST /api/contact — the website's contact form (Cloudflare Pages Function).
//
// Checks the fields and the Turnstile token, then sends the message with
// Amazon SES (API v2, SendEmail with Simple content) to CONTACT_TO, BCCs the
// two addresses below, and sets Reply-To to the sender. Nothing is stored.
//
// Environment (Cloudflare Pages → Settings → Variables and secrets):
//   AWS_SES_ACCESS_KEY_ID      secret; IAM user allowed only ses:SendEmail
//   AWS_SES_SECRET_ACCESS_KEY  secret; that user's access key
//   AWS_SES_REGION             region of the verified coopcirclehq.com identity
//   SES_CONFIGURATION_SET      optional; for bounce and complaint tracking
//   CONTACT_TO                 the inbox that receives messages
//   CONTACT_FROM               e.g. "CoopCircle website <website@coopcirclehq.com>"
//   TURNSTILE_SECRET_KEY       secret; when set, a valid Turnstile token is required

import { AwsClient } from "aws4fetch";

// The addresses that also get a copy, without being shown to other recipients.
const CONTACT_BCC = ["babatundeaniyi@gmail.com", "coopcirclesoftware@gmail.com"];

const TOPICS = {
  demo: "Book a demo",
  sales: "Plans and pricing",
  enterprise: "Enterprise",
  help: "Help with CoopCircle",
  partnership: "Partnership",
  press: "Press",
  other: "Something else",
};

const ROLES = {
  president: "President or chairman",
  executive: "Other executive",
  staff: "Branch staff",
  member: "Member",
  other: "Other",
};

const SIZES = ["Under 50", "50–200", "200–500", "500–2,000", "Over 2,000"];

const LIMITS = { name: 120, email: 200, phone: 30, society: 160, message: 4000 };

export async function onRequestPost({ request, env }) {
  let body;
  try {
    const type = request.headers.get("content-type") || "";
    body = type.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return reply(400, "We couldn’t read your message. Please try again.");
  }

  // A field people can't see: anything in it means a bot.
  if (clean(body.website)) return reply(200, null, { ok: true });

  const f = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone),
    society: clean(body.society),
    role: clean(body.role),
    size: clean(body.size),
    topic: clean(body.topic) || "other",
    message: clean(body.message, true),
  };

  const problem = check(f);
  if (problem) return reply(422, problem);

  if (env.TURNSTILE_SECRET_KEY) {
    const passed = await turnstileOk(env.TURNSTILE_SECRET_KEY, clean(body["cf-turnstile-response"]), request);
    if (!passed) return reply(403, "Please complete the check that you’re not a robot, then send again.");
  }

  // Without SES set up, the form stays honest and asks people to email us.
  if (
    !env.AWS_SES_ACCESS_KEY_ID || !env.AWS_SES_SECRET_ACCESS_KEY || !env.AWS_SES_REGION ||
    !env.CONTACT_TO || !env.CONTACT_FROM
  ) {
    return reply(503, "Our contact form isn’t working right now. Please email us instead.");
  }

  const sent = await sendEmail(env, f);
  if (!sent) return reply(502, "Your message didn’t send. Please try again in a minute, or email us.");
  return reply(200, null, { ok: true });
}

export function onRequest() {
  return reply(405, "Use the form on the contact page.");
}

export function clean(v, multiline = false) {
  if (typeof v !== "string") return "";
  const s = v.replace(/\r\n?/g, "\n").trim();
  return multiline ? s.replace(/\n{4,}/g, "\n\n\n") : s.replace(/\s+/g, " ");
}

export function check(f) {
  if (f.name.length < 2) return "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) return "Please enter a valid email address.";
  if (f.phone && !/^[+0-9 ()-]{7,}$/.test(f.phone)) return "Please check your phone number.";
  if (!TOPICS[f.topic]) return "Please choose what it’s about.";
  if (f.role && !ROLES[f.role]) return "Please choose your role.";
  if (f.size && !SIZES.includes(f.size)) return "Please choose your society’s size.";
  if (f.message.length < 10) return "Please write a little more in your message.";
  for (const [k, max] of Object.entries(LIMITS)) {
    if (f[k].length > max) return `That ${k === "society" ? "society name" : k} is too long.`;
  }
  return null;
}

export function emailText(f) {
  const lines = [`From: ${f.name} <${f.email}>`];
  if (f.phone) lines.push(`Phone: ${f.phone}`);
  if (f.society) lines.push(`Society: ${f.society}`);
  if (f.role) lines.push(`Role: ${ROLES[f.role]}`);
  if (f.size) lines.push(`Members: ${f.size}`);
  lines.push(`About: ${TOPICS[f.topic]}`, "", f.message, "", "— Sent from the contact form on coopcirclehq.com");
  return lines.join("\n");
}

async function turnstileOk(secret, token, request) {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

/**
 * Sends one message through SES v2. Simple content is enough here: there are
 * no attachments, and SES turns the UTF-8 subject and text into the email.
 * Returns true only when SES accepts the message.
 */
async function sendEmail(env, f) {
  const region = env.AWS_SES_REGION;

  // A fresh client per request; retries are off so a slow failure can't
  // deliver the same contact message twice.
  const ses = new AwsClient({
    accessKeyId: env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY,
    region,
    service: "ses",
    retries: 0,
  });

  const payload = {
    FromEmailAddress: env.CONTACT_FROM,
    Destination: { ToAddresses: [env.CONTACT_TO], BccAddresses: CONTACT_BCC },
    ReplyToAddresses: [f.email], // clean() has already flattened any line breaks.
    Content: {
      Simple: {
        Subject: {
          Data: `${TOPICS[f.topic]}: ${f.name}${f.society ? ` (${f.society})` : ""}`.slice(0, 200),
          Charset: "UTF-8",
        },
        Body: { Text: { Data: emailText(f), Charset: "UTF-8" } },
      },
    },
  };
  // Optional SES configuration set, used for bounce and complaint tracking.
  if (env.SES_CONFIGURATION_SET) payload.ConfigurationSetName = env.SES_CONFIGURATION_SET;

  try {
    const res = await ses.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    // The response body carries SES's reason (unverified address, denied by
    // IAM, wrong region…), so include it in the live Pages Function logs.
    if (!res.ok) console.error("contact: SES answered", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("contact: SES failed", e && e.name, e && e.message);
    return false;
  }
}

function reply(status, error, data) {
  return new Response(JSON.stringify(error ? { ok: false, error } : data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
