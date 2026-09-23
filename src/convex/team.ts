import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireAdmin(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  if (!user || (user as any).isAnonymous) throw new Error("Sign in required");
  if ((user as any).role !== "admin" && (user as any).isMasterAdmin !== true) {
    throw new Error("Admin access required");
  }
  return user;
}

export const initTeam = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("teamMembers").collect();
    if (existing.length > 0) return { seeded: true };
    const members = [
      { name: "Vivikth Mantha", role: "CEO", bio: "Leading Streamscale's vision and strategy. Focused on building AI testing that actually moves the needle for companies.", linkedin: "", avatarColor: "#10b981", order: 0 },
      { name: "Jaiveer", role: "IT Manager & Board Member", bio: "Oversees technology infrastructure and serves on the board. Keeps the systems running and the team secure.", linkedin: "", avatarColor: "#1E293B", order: 1 },
      { name: "Akash", role: "Chairman of Board", bio: "Chairman of the board, guiding Streamscale's long-term direction and partnerships.", linkedin: "", avatarColor: "#3b82f6", order: 2 },
      { name: "Piyush", role: "CTO", bio: "Chief Technology Officer. Builds the agents, benchmarks, and infrastructure that power Streamscale's testing platform.", linkedin: "", avatarColor: "#8b5cf6", order: 3 },
      { name: "Zain", role: "Candidate Outreach", bio: "Finds and connects with strong candidates. Builds relationships with people who can make AI work in real companies.", linkedin: "", avatarColor: "#ec4899", order: 4 },
      { name: "Roni", role: "General Demo Leader", bio: "Leads demos and showings of Streamscale's platform. Helps partners understand what the benchmarks and agents can do.", linkedin: "", avatarColor: "#f59e0b", order: 5 },
      { name: "Pranit", role: "Client Relations Manager", bio: "Manages relationships with partner companies. Makes sure every engagement runs smoothly from first contact to final deliverable.", linkedin: "", avatarColor: "#10b981", order: 6 },
      { name: "Yuva", role: "Recruitment and Demos", bio: "Handles recruitment outreach and runs demos. Bridges the gap between finding talent and showing partners what's possible.", linkedin: "", avatarColor: "#06b6d4", order: 7 },
    ];
    for (const m of members) {
      await ctx.db.insert("teamMembers", m);
    }
    return { seeded: true };
  },
});

export const getTeamMembers = query({
  handler: async (ctx) => {
    const members = await ctx.db.query("teamMembers").collect();
    return members.sort((a, b) => a.order - b.order);
  },
});

export const addTeamMember = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    avatarColor: v.optional(v.string()),
    order: v.number(),
    addedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.addedBy);
    return await ctx.db.insert("teamMembers", {
      name: args.name,
      role: args.role,
      email: args.email,
      bio: args.bio,
      linkedin: args.linkedin,
      avatarColor: args.avatarColor ?? "#1E293B",
      order: args.order,
    });
  },
});

export const updateTeamMember = mutation({
  args: {
    memberId: v.id("teamMembers"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    avatarColor: v.optional(v.string()),
    order: v.optional(v.number()),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.updatedBy);
    const { memberId, updatedBy, ...updates } = args;
    await ctx.db.patch(memberId, Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined)));
    return { success: true };
  },
});

export const deleteTeamMember = mutation({
  args: {
    memberId: v.id("teamMembers"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.deletedBy);
    await ctx.db.delete(args.memberId);
    return { success: true };
  },
});
