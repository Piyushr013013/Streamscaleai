import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MASTER_EMAIL = "piyushr013013@gmail.com";
const MASTER_PASSWORD_PREFIX = "master:";

// ---- Brute-force protection ----
const MAX_FAILED_LOGINS = 5;              // attempts before lockout
const LOCKOUT_MINUTES = 15;               // how long sign-in is blocked

// ---- Input caps (defense against oversized-payload abuse) ----
export const MAX_INPUT_LENGTHS = {
  email: 254,
  name: 120,
  password: 128,
  shortText: 300,
  longText: 5000,
  url: 500,
};

/**
 * PBKDF2-SHA256 password hashing (Web Crypto, available in Convex runtime).
 * Stored format: pbkdf2$<iterations>$<salt-b64>$<hash-b64>
 * Legacy formats ("v1:<password>", "master:<password>", base64) are still
 * accepted at sign-in and transparently upgraded to PBKDF2 on next login.
 */
const PBKDF2_ITERATIONS = 100_000;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function pbkdf2Derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as unknown as BufferSource, iterations },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2Derive(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (stored.startsWith("pbkdf2$")) {
      const [, iterationsRaw, saltB64, hashB64] = stored.split("$");
      const iterations = parseInt(iterationsRaw, 10);
      if (!iterations || iterations < 10_000 || iterations > 5_000_000) return false;
      const expected = fromBase64(hashB64);
      const actual = await pbkdf2Derive(password, fromBase64(saltB64), iterations);
      // Constant-time comparison to avoid timing leaks.
      if (expected.length !== actual.length) return false;
      let diff = 0;
      for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i];
      return diff === 0;
    }
    // Legacy formats — verified, then upgraded to PBKDF2 by the caller.
    if (stored.startsWith("v1:")) return stored.slice(3) === password;
    if (stored.startsWith(MASTER_PASSWORD_PREFIX)) return stored.slice(MASTER_PASSWORD_PREFIX.length) === password;
    try {
      return atob(stored) === password;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

function isLegacyHash(stored: string): boolean {
  return !stored.startsWith("pbkdf2$");
}

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
  failedLoginCount?: number;
  lockoutUntil?: number;
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
      } as any);
      return { exists: true };
    }

    await ctx.db.insert("users", {
      email: MASTER_EMAIL,
      name: "Admin",
      // Initial master password is hashed at rest; change it from Profile
      // settings after first sign-in.
      passwordHash: await hashPassword("changeme-streamscale"),
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

    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (!user || !isRealUser(user)) {
      // Same message for unknown email and wrong password so attackers can't
      // probe which email addresses have accounts (user enumeration).
      throw new Error("That email and password combination doesn't match an account. Double-check both and try again.");
    }

    // ---- Brute-force lockout ----
    const now = Date.now();
    if (user.lockoutUntil && user.lockoutUntil > now) {
      const minutesLeft = Math.max(1, Math.ceil((user.lockoutUntil - now) / 60_000));
      throw new Error(`Too many failed sign-in attempts. For security, this account is locked for ${minutesLeft} more minute${minutesLeft === 1 ? "" : "s"}. Try again shortly.`);
    }

    const stored = user.passwordHash;
    if (typeof stored !== "string") {
      throw new Error("This account doesn't have a password set yet. Ask your Streamscale administrator to assign one.");
    }

    const passwordValid = await verifyPassword(args.password, stored);

    if (!passwordValid) {
      const failed = (user.failedLoginCount ?? 0) + 1;
      if (failed >= MAX_FAILED_LOGINS) {
        await ctx.db.patch(user._id, {
          failedLoginCount: 0,
          lockoutUntil: now + LOCKOUT_MINUTES * 60_000,
        } as any);
        throw new Error(`Too many failed sign-in attempts. For security, this account is locked for ${LOCKOUT_MINUTES} minutes.`);
      }
      await ctx.db.patch(user._id, { failedLoginCount: failed } as any);
      throw new Error("That email and password combination doesn't match an account. Double-check both and try again.");
    }

    // Successful sign-in: clear any failed-attempt counters.
    if (user.failedLoginCount || user.lockoutUntil) {
      await ctx.db.patch(user._id, { failedLoginCount: 0, lockoutUntil: undefined } as any);
    }

    // Transparent upgrade: re-hash legacy passwords with PBKDF2 at sign-in.
    if (isLegacyHash(stored)) {
      await ctx.db.patch(user._id, {
        passwordHash: await hashPassword(args.password),
      } as any);
    }

    return { userId: user._id, role: user.role };
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
      patch.passwordHash = await hashPassword(args.password);
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
      passwordHash: await hashPassword(args.password),
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
      patch.passwordHash = await hashPassword(args.password);
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
