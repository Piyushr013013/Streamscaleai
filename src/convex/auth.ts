import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MASTER_EMAIL = "piyushr013013@gmail.com";
const MASTER_PASSWORD = "admin123";
const MASTER_PASSWORD_PREFIX = "master:";

function isRealUser(
  user: unknown
): user is {
  _id: { _toString(): string };
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  emailVerified: boolean;
  isMasterAdmin: boolean;
  permissions?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  otp?: string;
  otpExpiry?: number;
  _creationTime: number;
} {
  if (!user || typeof user !== "object") return false;
  const u = user as any;
  return !u.isAnonymous && typeof u.email === "string";
}

function isMasterAccount(user: unknown) {
  return Boolean(user && (user as any).isMasterAdmin === true);
}

function normalizePassword(password: string) {
  return password;
}

function hashPassword(password: string): string {
  return "v1:" + normalizePassword(password);
}

export const initMasterAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", MASTER_EMAIL))
      .first();

    if (existing && isRealUser(existing)) {
      await ctx.db.patch(existing._id, {
        isMasterAdmin: true,
        emailVerified: true,
        passwordHash:
          MASTER_PASSWORD_PREFIX + normalizePassword(MASTER_PASSWORD),
      });
      return { exists: true };
    }

    await ctx.db.insert("users", {
      email: MASTER_EMAIL,
      name: "Admin",
      passwordHash:
        MASTER_PASSWORD_PREFIX + normalizePassword(MASTER_PASSWORD),
      role: "admin",
      isMasterAdmin: true,
      emailVerified: true,
    });

    return { ok: true };
  },
});

export const migrateLegacyUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let patched = 0;

    for (const doc of users) {
      if (!doc || typeof doc !== "object") continue;
      const record = doc as any;
      if (record.isAnonymous) continue;
      if (typeof record.email !== "string") continue;
      if (record.isMasterAdmin !== undefined) continue;

      const isMaster = record.isMaster === true;

      let passwordHash: string;
      if (typeof record.passwordHash === "string") {
        if (record.passwordHash.startsWith("v1:")) {
          passwordHash = record.passwordHash;
        } else if (record.passwordHash.startsWith(MASTER_PASSWORD_PREFIX)) {
          passwordHash = record.passwordHash;
        } else {
          try {
            const decoded = atob(record.passwordHash);
            if (typeof decoded === "string" && decoded.length > 0) {
              passwordHash = "v1:" + decoded;
            } else {
              passwordHash = "v1:" + record.passwordHash;
            }
          } catch {
            passwordHash = "v1:" + record.passwordHash;
          }
        }
      } else {
        passwordHash = "v1:changeme";
      }

      await ctx.db.patch(record._id, {
        isMasterAdmin: isMaster,
        passwordHash,
      } as any);

      patched += 1;
    }

    return { patched };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (!user || !isRealUser(user)) {
      throw new Error("User not found");
    }

    if (!user.emailVerified) {
      throw new Error("Email not verified");
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
          passwordValid =
            atob(user.passwordHash) === normalizePassword(args.password);
        } catch {
          passwordValid = false;
        }
      }
    }

    if (!passwordValid) {
      throw new Error("Incorrect password");
    }

    return { userId: user._id, role: user.role };
  },
});

export const requestResetCode = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();
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

    return { ok: true };
  },
});

export const verifyResetCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();
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

    return { ok: true };
  },
});

export const resetPassword = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();
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
      passwordHash: hashPassword(args.newPassword),
      emailVerified: true,
      otp: undefined,
      otpExpiry: undefined,
    } as any);

    return { ok: true, email: user.email };
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !isRealUser(user)) {
      return null;
    }

    return {
      _id: user._id,
      _creationTime: user._creationTime,
      email: user.email,
      name: user.name,
      role: user.role,
      isMasterAdmin: isMasterAccount(user),
      emailVerified: user.emailVerified,
      permissions: user.permissions,
      socialLinks: user.socialLinks,
    };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.userId);
    if (!current || !isRealUser(current)) {
      throw new Error("Account not found");
    }

    const patch: any = {};

    if (args.email !== undefined) {
      const normalized = args.email.toLowerCase().trim();
      if (normalized === "") {
        throw new Error("Email cannot be empty");
      }
      if (normalized !== current.email) {
        const conflict = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", normalized))
          .first();
        if (conflict && conflict._id !== args.userId) {
          throw new Error("That email is already in use");
        }
      }
      patch.email = normalized;
    }

    if (args.password !== undefined) {
      if (args.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      patch.passwordHash = hashPassword(args.password);
      patch.emailVerified = true;
    }

    if (args.name !== undefined) {
      if (args.name.trim() === "") {
        throw new Error("Name cannot be empty");
      }
      patch.name = args.name.trim();
    }

    if (Object.keys(patch).length === 0) {
      throw new Error("No changes to save");
    }

    await ctx.db.patch(args.userId, patch as any);

    const updated = await ctx.db.get(args.userId);
    if (!updated || !isRealUser(updated)) {
      throw new Error("Failed to update account");
    }

    return {
      ok: true,
      email: updated.email,
      name: updated.name,
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
    if (!creator || !isRealUser(creator) || !creator.isMasterAdmin) {
      throw new Error("Master admin access required");
    }

    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const email = args.email.toLowerCase().trim();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    return (await ctx.db.insert("users", {
      email,
      name: args.name.trim(),
      passwordHash: hashPassword(args.password),
      role: args.role,
      isMasterAdmin: false,
      emailVerified: true,
      permissions: args.permissions,
      socialLinks: {
        linkedin: args.linkedin,
        twitter: args.twitter,
        website: args.website,
      },
    })) as any;
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
    if (!editor || !isRealUser(editor) || !editor.isMasterAdmin) {
      throw new Error("Master admin access required");
    }

    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) {
      throw new Error("Account not found");
    }

    const patch: any = {};

    if (args.permissions !== undefined) {
      patch.permissions = args.permissions;
    }

    if (args.email !== undefined) {
      const normalized = args.email.toLowerCase().trim();
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
      patch.passwordHash = hashPassword(args.password);
      patch.emailVerified = true;
    }

    if (args.name !== undefined) {
      if (args.name.trim() === "") {
        throw new Error("Name cannot be empty");
      }
      patch.name = args.name.trim();
    }

    if (args.permissions !== undefined) {
      patch.permissions = args.permissions;
    }

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

    return { ok: true, updatedEmail: verify.email };
  },
});

export const adminGetUsers = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!viewer || !isRealUser(viewer) || !viewer.isMasterAdmin) {
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
        isMasterAdmin: isMasterAccount(u),
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
    if (!editor || !isRealUser(editor) || !editor.isMasterAdmin) {
      throw new Error("Master admin access required");
    }

    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) {
      throw new Error("Account not found");
    }

    if (target.isMasterAdmin) {
      throw new Error("You cannot delete a master admin account through this menu. Only the master admin itself can be removed through account reset or database cleanup.");
    }

    await ctx.db.delete(args.userId);
    return { ok: true };
  },
});

export const adminDeleteAllNonMasterUsers = mutation({
  args: {
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.deletedBy);
    if (!editor || !isRealUser(editor) || !editor.isMasterAdmin) {
      throw new Error("Master admin access required");
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

    const teamMembers = await ctx.db.query("teamMembers").collect();
    for (const member of teamMembers) {
      await ctx.db.delete(member._id);
    }

    for (const id of idsToDelete) {
      await ctx.db.delete(id);
    }

    return { ok: true, deletedCount: idsToDelete.length };
  },
});
