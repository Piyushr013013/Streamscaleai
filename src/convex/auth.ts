import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sendEmail, emailConfigured } from "./email";

const MASTER_EMAIL = "piyushr013013@gmail.com";
const MASTER_PASSWORD = "admin123";
const MASTER_PASSWORD_PREFIX = "master:";

function normalizeStoredPassword(raw: unknown): string {
  if (typeof raw !== "string") return raw as any;
  if (raw.startsWith(MASTER_PASSWORD_PREFIX)) return raw;
  if (raw.startsWith("v1:")) return raw;
  try {
    const decoded = atob(raw);
    if (typeof decoded === "string" && decoded.length > 0) {
      return "v1:" + decoded;
    }
  } catch {
    // fall through
  }
  return "v1:" + raw;
}

const MASTER_PASSWORD_V1_HASH = "v1:" + normalizePassword(MASTER_PASSWORD);

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

/**
 * Returns the earliest-created master admin account. This is the "OG" admin:
 * only this account may demote or delete other master admins, no matter what.
 */
async function getOriginalMasterAdmin(ctx: any) {
  const masters = (await ctx.db.query("users").collect())
    .filter((u: any) => isRealUser(u) && isMasterAccount(u))
    .sort((a: any, b: any) => a._creationTime - b._creationTime);
  return masters[0] ?? null;
}

function normalizePassword(password: string) {
  return password;
}

function hashPassword(password: string): string {
  return "v1:" + normalizePassword(password);
}

const MASTER_LOOKUP_KEY = "master:" + normalizePassword(MASTER_PASSWORD);

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

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();

    if (normalizedEmail === MASTER_EMAIL && args.password === MASTER_PASSWORD) {
      // no-op guard only; fall through to normal lookup below
    }

    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (normalizedEmail === MASTER_EMAIL) {
      const existingMaster = (await ctx.db.query("users").collect()).find(
        (candidate) => isRealUser(candidate) && candidate.isMasterAdmin === true,
      );

      if (!existingMaster && !user) {
        const masterId = await ctx.db.insert("users", {
          email: MASTER_EMAIL,
          name: "Master Admin",
          passwordHash: MASTER_PASSWORD_PREFIX + MASTER_PASSWORD,
          role: "admin",
          isMasterAdmin: true,
          emailVerified: true,
          permissions: [],
        });
        user = await ctx.db.get(masterId);
      }
    }

    if (!user || !isRealUser(user)) {
      throw new Error("User not found");
    }

    if (!user.emailVerified) {
      throw new Error("Email not verified");
    }

    let passwordValid = false;

    if (typeof user.passwordHash !== "string") {
      throw new Error("Incorrect password");
    }

    const stored = user.passwordHash;

    if (stored === MASTER_PASSWORD_V1_HASH && user.email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
      passwordValid = true;
    } else if (stored === MASTER_LOOKUP_KEY && user.email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
      passwordValid = true;
    } else if (stored.startsWith(MASTER_PASSWORD_PREFIX) && user.email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
      passwordValid = stored.slice(MASTER_PASSWORD_PREFIX.length) === normalizePassword(args.password);
    } else if (stored === MASTER_PASSWORD_V1_HASH && user.email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
      passwordValid = args.password === MASTER_PASSWORD;
    } else if (stored.startsWith("v1:")) {
      passwordValid = stored.slice(3) === normalizePassword(args.password);
    } else {
      try {
        passwordValid = atob(stored) === normalizePassword(args.password);
      } catch {
        passwordValid = false;
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
    if (typeof args.email !== "string" || args.email.trim().length === 0) {
      throw new Error("Email is required");
    }

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

    if (!emailConfigured()) {
      throw new Error(
        "Email is not set up yet, so we couldn't send your code. Please contact a Streamscale administrator to reset your password."
      );
    }

    try {
      await sendEmail(
        user.email,
        "Your Streamscale password reset code",
        `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">`
        + `<h2 style="color: #0f172a; margin-bottom: 8px;">Reset your password</h2>`
        + `<p style="color: #475569;">Hi ${user.name ?? "there"},</p>`
        + `<p style="color: #475569;">Use this 6-digit code to reset your Streamscale password. It expires in 10 minutes.</p>`
        + `<div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">`
        + `<span style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #0f172a;">${code}</span>`
        + `</div>`
        + `<p style="color: #94a3b8; font-size: 13px;">If you didn't request this, you can ignore this email — your password won't change.</p>`
        + `<p style="color: #94a3b8; font-size: 13px;">Streamscale</p></div>`
      );
    } catch (err) {
      console.error("[auth] reset-code email failed:", err);
      throw new Error(
        "We couldn't send the code email right now. Please try again in a moment, or contact a Streamscale administrator."
      );
    }

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

    // The "original" master admin is the earliest-created master account;
    // only it may demote or delete other master admins.
    let isOriginalMaster = false;
    if (isMasterAccount(user)) {
      const original = await getOriginalMasterAdmin(ctx);
      isOriginalMaster = Boolean(original && original._id.toString() === user._id.toString());
    }

    return {
      _id: user._id,
      _creationTime: user._creationTime,
      email: user.email,
      name: user.name,
      role: user.role,
      isMasterAdmin: isMasterAccount(user),
      isOriginalMaster,
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
      const normalized = (args.email ?? "").trim().toLowerCase();

      if (normalized === "") {
        throw new Error("Email cannot be empty");
      }

      if (normalized !== current.email) {
        const conflict = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", normalized))
          .first();

        if (conflict && conflict._id.toString() !== args.userId.toString()) {
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
        if (conflict && conflict._id.toString() !== args.userId.toString()) {
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

export const adminPromoteToMasterAdmin = mutation({
  args: {
    userId: v.id("users"),
    promoterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const promoter = await ctx.db.get(args.promoterId);
    if (!promoter || !isRealUser(promoter) || !promoter.isMasterAdmin) {
      throw new Error("Master admin access required");
    }

    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) {
      throw new Error("Account not found");
    }

    if (isMasterAccount(target)) {
      throw new Error("That account is already a master admin");
    }

    await ctx.db.patch(args.userId, {
      isMasterAdmin: true,
      role: "admin",
      emailVerified: true,
    } as any);

    return { ok: true };
  },
});

export const adminDemoteMasterAdmin = mutation({
  args: {
    userId: v.id("users"),
    demoterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const demoter = await ctx.db.get(args.demoterId);
    if (!demoter || !isRealUser(demoter) || !demoter.isMasterAdmin) {
      throw new Error("Master admin access required");
    }

    // Only the original (earliest-created) master admin can demote others.
    const originalMaster = await getOriginalMasterAdmin(ctx);
    if (!originalMaster || originalMaster._id.toString() !== args.demoterId.toString()) {
      throw new Error("Only the original master admin can remove master admin access");
    }

    // The original master admin can never be demoted by anyone.
    if (originalMaster._id.toString() === args.userId.toString()) {
      throw new Error("The original master admin account cannot be removed");
    }

    if (args.userId.toString() === args.demoterId.toString()) {
      throw new Error("You cannot remove your own master admin access");
    }

    const target = await ctx.db.get(args.userId);
    if (!target || !isRealUser(target)) {
      throw new Error("Account not found");
    }

    if (!isMasterAccount(target)) {
      throw new Error("That account is not a master admin");
    }

    await ctx.db.patch(args.userId, {
      isMasterAdmin: false,
    } as any);

    return { ok: true };
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
      // Only the original (earliest-created) master admin may delete another
      // master admin account, and the original itself can never be deleted.
      const originalMaster = await getOriginalMasterAdmin(ctx);
      const isOriginalMaster =
        originalMaster && originalMaster._id.toString() === args.deletedBy.toString();
      if (originalMaster && originalMaster._id.toString() === args.userId.toString()) {
        throw new Error("The original master admin account cannot be deleted");
      }
      if (!isOriginalMaster) {
        throw new Error("Only the original master admin account can delete another master admin");
      }
      if (args.userId.toString() === args.deletedBy.toString()) {
        throw new Error("You cannot delete your own account");
      }
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

export const adminGetPartnerRequests = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", MASTER_EMAIL))
      .first();

    if (!viewer || !isRealUser(viewer) || !isMasterAccount(viewer)) {
      return [];
    }

    const requests = await ctx.db.query("partnerRequests").collect();
    return requests.map((r: any) => ({
      _id: r._id,
      name: r.name,
      email: r.email,
      service: r.service,
      status: r.status,
      createdAt: r._creationTime,
    }));
  },
});

export const adminDeletePartnerRequest = mutation({
  args: {
    id: v.id("partnerRequests"),
  },
  handler: async (ctx, args) => {
    const viewer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", MASTER_EMAIL))
      .first();

    if (!viewer || !isRealUser(viewer) || !isMasterAccount(viewer)) {
      throw new Error("Master admin access required");
    }

    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new Error("Partner request not found");
    }

    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const adminGetResumes = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", MASTER_EMAIL))
      .first();

    if (!viewer || !isRealUser(viewer) || !isMasterAccount(viewer)) {
      return [];
    }

    const applications = await ctx.db.query("applications").collect();
    return applications.map((a: any) => ({
      _id: a._id,
      applicantName: a.applicantName,
      applicantEmail: a.applicantEmail,
      applicantPhone: a.applicantPhone,
      jobTitle: a.jobId,
      status: a.status,
      createdAt: a._creationTime,
    }));
  },
});

export const __placeholderAuthFunc = 1;
export const adminDeleteResume = mutation({
  args: {
    id: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const viewer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", MASTER_EMAIL))
      .first();

    if (!viewer || !isRealUser(viewer) || !isMasterAccount(viewer)) {
      throw new Error("Master admin access required");
    }

    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error("Application not found");
    }

    await ctx.db.delete(args.id);
    return { ok: true };
  },
});
