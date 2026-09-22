import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Type guard to check if a user document is a real user (not anonymous).
// Account creation remains admin-only through adminCreateUser.
const MASTER_ACCOUNT_ID = "jx717vzztttby8p52pd0bbbc2n8etdcc";
const ORIGINAL_MASTER_EMAIL = "piyushr013013@gmail.com";

function isMasterAccount(user: any) {
  return Boolean(user?.isMaster === true || user?._id === MASTER_ACCOUNT_ID || (user?.role === "admin" && user?.email === ORIGINAL_MASTER_EMAIL));
}

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
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      passwordHash: "v1:" + args.password,
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
    // The original seeded credentials are permanently retired. They must never
    // become valid again after the master account changes credentials.
    if (normalizedEmail === ORIGINAL_MASTER_EMAIL) {
      throw new Error("User not found");
    }
    const allUsers = await ctx.db.query("users").collect();
    const currentMaster = allUsers.find((candidate) => isMasterAccount(candidate));
    const matchingUsers = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();
    const user = matchingUsers.find((candidate) => isMasterAccount(candidate)) ?? matchingUsers[0];
    // The old seeded email must never authenticate through a duplicate legacy account.
    if (normalizedEmail === ORIGINAL_MASTER_EMAIL && (!user || !isMasterAccount(user))) {
      throw new Error("User not found");
    }
    if (!user || !isRealUser(user)) {
      throw new Error("User not found");
    }
    // Support both old btoa format and new v1: format
    let passwordValid = false;
    if (typeof user.passwordHash === "string") {
      if (user.passwordHash.startsWith("v1:")) {
        // New format: direct comparison
        passwordValid = user.passwordHash.slice(3) === args.password;
      } else {
        // Old btoa format: decode and compare
        try { passwordValid = atob(user.passwordHash) === args.password; } catch { passwordValid = false; }
      }
    }
    if (!passwordValid) {
      throw new Error("Invalid password");
    }
    if (!user.emailVerified) {
      throw new Error("Email not verified");
    }
    if (isMasterAccount(user) && user.isMaster !== true) {
      await ctx.db.patch(user._id, { isMaster: true });
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
    return { _id: user._id, _creationTime: user._creationTime, email: user.email, name: user.name, role: user.role, isMaster: isMasterAccount(user), emailVerified: user.emailVerified, permissions: user.permissions, socialLinks: user.socialLinks };
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
      passwordHash: "v1:" + args.password,
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
    if (isMasterAccount(target)) updates.isMaster = true;
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
      updates.passwordHash = "v1:" + args.password;
      updates.emailVerified = true;
    }
    if (args.name !== undefined) updates.name = args.name;
    if (args.permissions !== undefined) updates.permissions = args.permissions;
    if (args.linkedin !== undefined || args.twitter !== undefined || args.website !== undefined) {
      updates.socialLinks = { linkedin: args.linkedin, twitter: args.twitter, website: args.website };
    }
    if (Object.keys(updates).length === 0) {
      throw new Error("No changes to save. Enter at least one field to update.");
    }
    await ctx.db.patch(args.userId, updates);
    // Verify the update actually persisted
    const verify = await ctx.db.get(args.userId);
    if (!verify || !isRealUser(verify)) throw new Error("Failed to update account. Please try again.");
    if (args.password !== undefined && verify.passwordHash !== updates.passwordHash) {
      throw new Error("Password update failed. The old password might still work. Please try again.");
    }
    return { success: true, updatedEmail: verify.email, updatedName: verify.name };
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
          isMaster: isMasterAccount(u),
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
    if (!editor || !isRealUser(editor) || editor.role !== "admin") throw new Error("Only an administrator can delete accounts.");
    if (args.userId === args.deletedBy) throw new Error("You cannot delete your own account. No one can delete the master account under any circumstances.");
    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) throw new Error("Account not found.");
    if (isMasterAccount(target)) throw new Error("The master account is protected and cannot be deleted.");
    if (target.role === "admin" && !isMasterAccount(editor)) throw new Error("Only the master account can delete another administrator.");
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
    if (!editor || !isRealUser(editor) || editor.role !== "admin") throw new Error("Only an administrator can delete accounts.");
    if (!isMasterAccount(editor)) throw new Error("Only the master account can delete all accounts and data.");
    const users = await ctx.db.query("users").collect();
    const realUserIds: any[] = [];
    for (const u of users) {
      if (isRealUser(u) && !isMasterAccount(u)) {
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
    await ctx.db.insert("users", {
      email: "piyushr013013@gmail.com",
      name: "Admin",
      passwordHash: "v1:admin123",
      role: "admin",
      isMaster: true,
      emailVerified: true,
    });
    return { success: true };
  },
});
