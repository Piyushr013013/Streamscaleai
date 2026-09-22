import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MASTER_EMAIL = "piyushr013013@gmail.com";
const MASTER_PASSWORD = "admin123";
const MASTER_PASSWORD_PREFIX = "master:";

function isRealUser(user: any): user is {
  _id: any;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  emailVerified: boolean;
  isMaster?: boolean;
  otp?: string;
  otpExpiry?: number;
  _creationTime: number;
} {
  return Boolean(user && !user.isAnonymous && typeof user.email === "string");
}

function isMasterAccount(user: any) {
  return Boolean(user?.isMaster === true);
}

function normalizePassword(password: string) {
  return password;
}

export const initMasterAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const existing = (users.find(isRealUser) ?? null) as any;
    if (existing) {
      await ctx.db.patch(existing._id, {
        isMaster: true,
        emailVerified: true,
        passwordHash: MASTER_PASSWORD_PREFIX + MASTER_PASSWORD,
      } as any);
      return { exists: true };
    }
    await ctx.db.insert("users", {
      email: MASTER_EMAIL,
      name: "Admin",
      passwordHash: MASTER_PASSWORD_PREFIX + MASTER_PASSWORD,
      role: "admin",
      isMaster: true,
      emailVerified: true,
    } as any);
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
    const users = await ctx.db.query("users").collect();
    const user = (users.find((candidate) => {
      if (!isRealUser(candidate)) return false;
      return candidate.email === normalizedEmail;
    }) ?? null) as any;
    if (!user) {
      throw new Error("User not found");
    }
    let passwordValid = false;
    if (typeof user.passwordHash === "string") {
      if (user.passwordHash.startsWith(MASTER_PASSWORD_PREFIX)) {
        passwordValid =
          user.passwordHash.slice(MASTER_PASSWORD_PREFIX.length) ===
          normalizePassword(args.password);
      } else if (user.passwordHash.startsWith("v1:")) {
        passwordValid =
          user.passwordHash.slice(3) === normalizePassword(args.password);
      } else {
        try {
          passwordValid = atob(user.passwordHash) === normalizePassword(args.password);
        } catch {
          passwordValid = false;
        }
      }
    }
    if (!passwordValid) {
      throw new Error("Wrong password");
    }
    if (!user.emailVerified) {
      throw new Error("Email not verified");
    }
    return { userId: user._id, role: user.role };
  },
});

export const requestResetCode = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    if (!user || !isRealUser(user)) {
      throw new Error("No account found with that email");
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await ctx.db.patch(user._id, {
      otp: code,
      otpExpiry: Date.now() + 10 * 60 * 1000,
    } as any);
    console.log(`Streamscale reset code for ${user.email}: ${code}`);
    return { success: true };
  },
});

export const verifyResetCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    if (!user || !isRealUser(user)) {
      throw new Error("No account found with that email");
    }
    if (!user.otp || user.otp !== args.code) {
      throw new Error("Invalid code");
    }
    if (!user.otpExpiry || Date.now() > user.otpExpiry) {
      throw new Error("Code expired");
    }
    await ctx.db.patch(user._id, {
      otp: undefined,
      otpExpiry: undefined,
    } as any);
    return { success: true };
  },
});

export const resetPassword = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    if (!user || !isRealUser(user)) {
      throw new Error("No account found with that email");
    }
    if (!user.otp || user.otp !== args.code) {
      throw new Error("Invalid or expired code");
    }
    if (!user.otpExpiry || Date.now() > user.otpExpiry) {
      throw new Error("Code expired");
    }
    if (args.newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    await ctx.db.patch(user._id, {
      passwordHash: MASTER_PASSWORD_PREFIX + normalizePassword(args.newPassword),
      emailVerified: true,
      otp: undefined,
      otpExpiry: undefined,
    } as any);
    return { success: true, email: user.email };
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !isRealUser(user)) return null;
    return {
      _id: user._id,
      _creationTime: user._creationTime,
      email: user.email,
      name: user.name,
      role: user.role,
      isMaster: isMasterAccount(user),
      emailVerified: user.emailVerified,
      permissions: user.permissions,
      socialLinks: user.socialLinks,
    };
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
    if (!creator || !isRealUser(creator) || creator.role !== "admin") {
      throw new Error("Admin access required");
    }
    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    const email = args.email.toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      throw new Error("Email already registered");
    }
    return (await ctx.db.insert("users", {
      email,
      name: args.name,
      passwordHash: "v1:" + normalizePassword(args.password),
      role: args.role,
      emailVerified: true,
      permissions: args.permissions,
      socialLinks: {
        linkedin: args.linkedin,
        twitter: args.twitter,
        website: args.website,
      },
    } as any)) as any;
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
    if (!editor || !isRealUser(editor) || editor.role !== "admin") {
      throw new Error("Admin access required");
    }
    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) {
      throw new Error("Account not found");
    }
    const patch: any = {};
    if (args.email !== undefined) {
      const normalized = args.email.toLowerCase();
      if (normalized !== target.email) {
        const conflict = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", normalized))
          .first();
        if (conflict && conflict._id !== args.userId) {
          throw new Error("That email is already in use");
        }
        patch.email = normalized;
      }
    }
    if (args.password !== undefined) {
      if (args.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      patch.passwordHash = "v1:" + normalizePassword(args.password);
      patch.emailVerified = true;
    }
    if (args.name !== undefined) patch.name = args.name;
    if (args.permissions !== undefined) patch.permissions = args.permissions;
    if (
      args.linkedin !== undefined ||
      args.twitter !== undefined ||
      args.website !== undefined
    ) {
      patch.socialLinks = {
        linkedin: args.linkedin,
        twitter: args.twitter,
        website: args.website,
      };
    }
    if (Object.keys(patch).length === 0) {
      throw new Error("No changes to save");
    }
    await ctx.db.patch(args.userId, patch as any);
    const verify = await ctx.db.get(args.userId);
    if (!verify || !isRealUser(verify)) {
      throw new Error("Failed to update account");
    }
    if (args.password !== undefined && verify.passwordHash !== patch.passwordHash) {
      throw new Error("Password update failed");
    }
    return { success: true, updatedEmail: verify.email };
  },
});

export const adminGetUsers = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!viewer || !isRealUser(viewer) || viewer.role !== "admin") {
      return [];
    }
    const users = await ctx.db.query("users").collect();
    return users
      .filter(isRealUser)
      .map((u: any) => ({
        _id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
        isMaster: isMasterAccount(u),
        emailVerified: u.emailVerified,
        createdAt: u._creationTime,
      }));
  },
});

export const adminDeleteUser = mutation({
  args: {
    userId: v.id("users"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.deletedBy);
    if (!editor || !isRealUser(editor) || editor.role !== "admin") {
      throw new Error("Admin access required");
    }
    if (args.userId === args.deletedBy) {
      throw new Error("You cannot delete your own account");
    }
    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) {
      throw new Error("Account not found");
    }
    if (isMasterAccount(target)) {
      throw new Error("The master account cannot be deleted");
    }
    if (target.role === "admin" && !isMasterAccount(editor)) {
      throw new Error("Only the master account can delete another admin");
    }
    const relatedApplications = await ctx.db
      .query("applications")
      .withIndex("by_applicant_email", (q) => q.eq("applicantEmail", target.email))
      .collect();
    for (const app of relatedApplications) {
      await ctx.db.delete(app._id);
    }
    await ctx.db.delete(args.userId);
    return { success: true };
  },
});

export const adminDeleteAllNonMasterUsers = mutation({
  args: {
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.deletedBy);
    if (!editor || !isRealUser(editor) || editor.role !== "admin") {
      throw new Error("Admin access required");
    }
    if (!isMasterAccount(editor)) {
      throw new Error("Only the master account can wipe all other accounts");
    }
    const users = await ctx.db.query("users").collect();
    const idsToDelete = users
      .filter(isRealUser)
      .filter((u) => !isMasterAccount(u))
      .map((u) => u._id);
    const applications = await ctx.db.query("applications").collect();
    for (const app of applications) {
      await ctx.db.delete(app._id);
    }
    const jobs = await ctx.db.query("jobs").collect();
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }
    const partnerRequests = await ctx.db.query("partnerRequests").collect();
    for (const request of partnerRequests) {
      await ctx.db.delete(request._id);
    }
    for (const id of idsToDelete) {
      await ctx.db.delete(id);
    }
    return { success: true, deletedCount: idsToDelete.length };
  },
});
