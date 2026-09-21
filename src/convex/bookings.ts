import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBooking = mutation({
  args: {
    name: v.string(), email: v.string(), phone: v.optional(v.string()),
    bookingType: v.union(v.literal("ai"), v.literal("testing_ai"), v.literal("recruitment")),
    preferredTime: v.string(), notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => ({ bookingId: await ctx.db.insert("partnerRequests", { name: args.name, email: args.email, phone: args.phone ?? "", service: args.bookingType, requirements: `${args.preferredTime}\n${args.notes ?? ""}`, status: "new" }) }),
});

export const createPartnerRequest = mutation({
  args: {
    name: v.string(), email: v.string(), phone: v.string(),
    service: v.union(v.literal("ai"), v.literal("testing_ai"), v.literal("recruitment")),
    requirements: v.string(),
  },
  handler: async (ctx, args) => {
    return { requestId: await ctx.db.insert("partnerRequests", { ...args, status: "new" }) };
  },
});

export const listPartnerRequests = query({ handler: async (ctx) => (await ctx.db.query("partnerRequests").collect()).sort((a, b) => b._creationTime - a._creationTime) });

export const updatePartnerRequestStatus = mutation({
  args: { requestId: v.id("partnerRequests"), status: v.union(v.literal("new"), v.literal("contacted")), editorId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId);
    if (!user || !("email" in user) || user.role !== "admin") throw new Error("Admin access required");
    await ctx.db.patch(args.requestId, { status: args.status });
    return { success: true };
  },
});
