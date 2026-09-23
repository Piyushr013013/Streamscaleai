import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "fb_email_2crN1hqIArZP2bEfvjp5Qik4";

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.freebuff.dev/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EMAIL_API_KEY,
    },
    body: JSON.stringify({ to, subject, html }),
  });
  if (!response.ok) throw new Error(`Email send failed: ${response.statusText}`);
}

export const createBooking = mutation({
  args: {
    name: v.string(), email: v.string(), phone: v.optional(v.string()),
    bookingType: v.union(v.literal("ai"), v.literal("testing_ai"), v.literal("recruitment")),
    preferredTime: v.string(), notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("partnerRequests", {
      name: args.name,
      email: args.email,
      phone: args.phone ?? "",
      service: args.bookingType,
      services: [args.bookingType],
      requirements: `${args.preferredTime}\n${args.notes ?? ""}`,
      objectives: [],
      status: "new",
    });
    return { bookingId: requestId };
  },
});

export const createPartnerRequest = mutation({
  args: {
    name: v.string(), email: v.string(), phone: v.string(),
    services: v.array(v.union(v.literal("ai"), v.literal("testing_ai"), v.literal("recruitment"))),
    requirements: v.string(),
  },
  handler: async (ctx, args) => {
    const selected: ("ai" | "testing_ai" | "recruitment")[] = args.services.length > 0 ? [...args.services] : ["ai"];
    const requestId = await ctx.db.insert("partnerRequests", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      service: selected[0] as "ai" | "testing_ai" | "recruitment" | "compliance" | "monitoring" | "integration",
      services: selected as ("ai" | "testing_ai" | "recruitment" | "compliance" | "monitoring" | "integration")[],
      requirements: args.requirements,
      objectives: [],
      status: "new",
    });
    // Send auto-reply to partner (best-effort)
    try {
      const serviceNames: Record<string, string> = {
        ai: "AI Work Diagnostics",
        testing_ai: "Custom Agent Deployment",
        recruitment: "Talent & Recruitment",
      };
      const selectedNames = selected.map((s) => serviceNames[s] || s).join(", ");
      await sendEmail(
        args.email,
        `Thanks for reaching out to Streamscale — ${selectedNames}`,
        `Hi ${args.name},<br><br>We received your request for <strong>${selectedNames}</strong> and our team will review it shortly.<br><br>Here's a summary of what you sent:<br><br><strong>Services:</strong> ${selectedNames}<br><br><strong>Requirements:</strong><br>${args.requirements}<br><br>We'll follow up within 1-2 business days to scope what you need.<br><br><a href="${process.env.VITE_SITE_URL || "https://streamscale.com"}/jobs" style="color: #3b82f6;">View open jobs →</a><br><br>Streamscale — We test AI before your company bets on it.`
      );
    } catch (emailErr) {
      console.error("Auto-reply email failed:", emailErr);
    }
    return { requestId };
  },
});

export const listPartnerRequests = query({ handler: async (ctx) => (await ctx.db.query("partnerRequests").collect()).sort((a, b) => b._creationTime - a._creationTime) });

export const updatePartnerRequestStatus = mutation({
  args: { requestId: v.id("partnerRequests"), status: v.union(v.literal("new"), v.literal("contacted")), editorId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId);
    if (!user || !("email" in user) || (user.role !== "admin" && !(user.permissions ?? []).includes("view_partner_requests"))) throw new Error("Partner request access required");
    await ctx.db.patch(args.requestId, { status: args.status });
    return { success: true };
  },
});
