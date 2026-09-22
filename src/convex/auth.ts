import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Type guard to check if a user document is a real user (not anonymous).
// Account creation remains admin-only through adminCreateUser.
function isRealUser(user: any): user is {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "user";
  emailVerified: boolean;
  otp?: string;
  otpExpiry?: number;
  _creationTime: number;
} {
  return user && !user.isAnonymous && user.email !== undefined;
}

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (existing && isRealUser(existing)) {
      throw new Error("Email already registered");
    }
    // Simple hash placeholder - in production use proper hashing (bcrypt)
    const passwordHash = btoa(args.password);
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      passwordHash,
      role: "user",
      emailVerified: false,
    });
    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await ctx.db.patch(userId, {
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes
    });
    console.log(`OTP for ${args.email}: ${otp}`);
    return { userId, otp };
  },
});

export const verifyOtp = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user || !isRealUser(user)) {
      throw new Error("User not found");
    }
    if (!user.otp || user.otp !== args.otp) {
      throw new Error("Invalid OTP");
    }
    if (user.otpExpiry && Date.now() > user.otpExpiry) {
      throw new Error("OTP expired");
    }
    await ctx.db.patch(user._id, {
      emailVerified: true,
      otp: undefined,
      otpExpiry: undefined,
    });
    return { success: true };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase();
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    if (!user || !isRealUser(user)) {
      throw new Error("User not found");
    }
    const storedHash = atob(user.passwordHash);
    if (storedHash !== args.password) {
      throw new Error("Invalid password");
    }
    if (!user.emailVerified) {
      throw new Error("Email not verified");
    }
    return { userId: user._id, role: user.role };
  },
});

export const requestOtp = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user || !isRealUser(user)) {
      throw new Error("User not found");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await ctx.db.patch(user._id, {
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
    });
    console.log(`Resent OTP for ${args.email}: ${otp}`);
    return { otp };
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !isRealUser(user)) return null;
    return { _id: user._id, _creationTime: user._creationTime, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified, permissions: user.permissions, socialLinks: user.socialLinks };
  },
});

export const adminCreateUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    permissions: v.array(v.string()),
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),
    creatorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId);
    if (!creator || !isRealUser(creator) || creator.role !== "admin") throw new Error("Admin access required");
    const email = args.email.toLowerCase();
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (existing) throw new Error("Email already registered");
    return await ctx.db.insert("users", {
      email,
      name: args.name,
      passwordHash: btoa(args.password),
      role: args.role,
      emailVerified: true,
      permissions: args.permissions,
      socialLinks: { linkedin: args.linkedin, twitter: args.twitter, website: args.website },
    });
  },
});

export const adminUpdateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),
    editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!editor || !isRealUser(editor) || editor.role !== "admin") throw new Error("Admin access required");
    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) throw new Error("Account not found");
    const updates: any = {};
    if (args.email !== undefined) {
      const normalized = args.email.toLowerCase();
      if (normalized !== target.email) {
        const conflict = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", normalized))
          .first();
        if (conflict && conflict._id !== args.userId) {
          throw new Error("That email is already in use by another account.");
        }
        updates.email = normalized;
      }
    }
    if (args.password !== undefined) {
      if (args.password.length < 6) throw new Error("Password must be at least 6 characters.");
      updates.passwordHash = btoa(args.password);
      updates.emailVerified = true;
    }
    if (args.name !== undefined) updates.name = args.name;
    if (args.permissions !== undefined) updates.permissions = args.permissions;
    if (args.linkedin !== undefined || args.twitter !== undefined || args.website !== undefined) {
      updates.socialLinks = { linkedin: args.linkedin, twitter: args.twitter, website: args.website };
    }
    await ctx.db.patch(args.userId, updates);
    return { success: true };
  },
});

export const adminGetUsers = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!viewer || !isRealUser(viewer) || viewer.role !== "admin") return [];
    const users = await ctx.db.query("users").collect();
    const realUsers: any[] = [];
    for (const u of users) {
      if (isRealUser(u)) {
        realUsers.push({
          _id: u._id,
          email: u.email,
          name: u.name,
          role: u.role,
          emailVerified: u.emailVerified,
          createdAt: u._creationTime,
        });
      }
    }
    return realUsers;
  },
});

export const adminDeleteUser = mutation({
  args: {
    userId: v.id("users"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.deletedBy);
    if (!editor || !isRealUser(editor) || editor.role !== "admin") throw new Error("Admin access required");
    if (args.userId === args.deletedBy) throw new Error("You cannot delete your own account from this menu.");
    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) throw new Error("Account not found");
    // Delete related data first
    const userApplications = await ctx.db.query("applications").collect();
    for (const app of userApplications) {
      if (app.applicantEmail === target.email) {
        await ctx.db.delete(app._id);
      }
    }
    await ctx.db.delete(args.userId);
    return { success: true };
  },
});

export const adminDeleteAllUsers = mutation({
  args: {
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.deletedBy);
    if (!editor || !isRealUser(editor) || editor.role !== "admin") throw new Error("Admin access required");
    const users = await ctx.db.query("users").collect();
    const realUserIds: any[] = [];
    for (const u of users) {
      if (isRealUser(u) && u._id !== args.deletedBy) {
        realUserIds.push(u._id);
      }
    }
    // Delete all applications
    const applications = await ctx.db.query("applications").collect();
    for (const app of applications) {
      await ctx.db.delete(app._id);
    }
    // Delete all jobs
    const jobs = await ctx.db.query("jobs").collect();
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }
    // Delete all partner requests
    const requests = await ctx.db.query("partnerRequests").collect();
    for (const req of requests) {
      await ctx.db.delete(req._id);
    }
    // Delete all non-admin users
    for (const id of realUserIds) {
      await ctx.db.delete(id);
    }
    return { success: true, deletedCount: realUserIds.length };
  },
});

export const initAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "piyushr013013@gmail.com"))
      .first();
    if (existingAdmin && isRealUser(existingAdmin)) {
      return { exists: true };
    }
    const passwordHash = btoa("admin123");
    await ctx.db.insert("users", {
      email: "piyushr013013@gmail.com",
      name: "Admin",
      passwordHash,
      role: "admin",
      emailVerified: true,
    });
    return { success: true };
  },
});
