import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const defaultRecipients = {
  partnerRequestRecipients: ["piyushr013013@gmail.com"],
  jobApplicationRecipients: ["piyushr013013@gmail.com"],
  accountRecipients: ["piyushr013013@gmail.com"],
};

function canManageNotifications(user: any) {
  return Boolean(user && !user.isAnonymous && (user.role === "admin" || (user.permissions ?? []).includes("manage_notifications")));
}

export const getSettings = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!canManageNotifications(viewer)) return null;
    const saved = await ctx.db.query("notificationSettings").withIndex("by_key", (q) => q.eq("key", "default")).first();
    if (!saved) return defaultRecipients;
    return {
      partnerRequestRecipients: saved.partnerRequestRecipients,
      jobApplicationRecipients: saved.jobApplicationRecipients,
      accountRecipients: saved.accountRecipients,
    };
  },
});

export const updateSettings = mutation({
  args: {
    editorId: v.id("users"),
    partnerRequestRecipients: v.array(v.string()),
    jobApplicationRecipients: v.array(v.string()),
    accountRecipients: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!canManageNotifications(editor)) throw new Error("You do not have permission to manage notification recipients");
    const clean = (values: string[]) => [...new Set(values.map((value) => value.trim().toLowerCase()).filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))];
    const existing = await ctx.db.query("notificationSettings").withIndex("by_key", (q) => q.eq("key", "default")).first();
    const settings = {
      key: "default" as const,
      partnerRequestRecipients: clean(args.partnerRequestRecipients),
      jobApplicationRecipients: clean(args.jobApplicationRecipients),
      accountRecipients: clean(args.accountRecipients),
      updatedBy: args.editorId,
    };
    if (existing) await ctx.db.patch(existing._id, settings);
    else await ctx.db.insert("notificationSettings", settings);
    return settings;
  },
});
