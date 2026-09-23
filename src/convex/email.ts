// Shared email sender for Convex mutations that need to reach users.
// Key comes from the platform environment; never hardcode it here.

const EMAIL_API_KEY = process.env.EMAIL_API_KEY ?? "";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!EMAIL_API_KEY) {
    // No key configured — log instead of throwing so best-effort flows
    // (password reset, application confirmations) don't hard-fail.
    console.warn("[email] EMAIL_API_KEY not set; skipping send to", to);
    return;
  }

  const response = await fetch("https://api.freebuff.dev/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EMAIL_API_KEY,
    },
    body: JSON.stringify({ to, subject, html }),
  });

  if (!response.ok) {
    throw new Error(`Email send failed: ${response.statusText}`);
  }
}

export const emailConfigured = () => Boolean(EMAIL_API_KEY);
