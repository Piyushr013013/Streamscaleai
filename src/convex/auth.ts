import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Type guard to check if a user document is a real user (not anonymous)
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
    // In production, send email here. For now, we'll console.log
    console.log(`OTP for ${args.email}: ${otp}`);
    return { userId, otp }; // Return otp for demo purposes
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
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user || !isRealUser(user)) {
      throw new Error("User not found");
    }
    // Simple hash comparison
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

// Admin: Update user email/password
 export const adminUpdateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    if (args.email !== undefined) {
      updates.email = args.email.toLowerCase();
    }
    if (args.password !== undefined) {
      updates.passwordHash = btoa(args.password);
      updates.emailVerified = true; // Reset verification on password change
    }
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    await ctx.db.patch(args.userId, updates);
    return { success: true };
  },
});

// Admin: Get all users
export const adminGetUsers = query({
  handler: async (ctx) => {
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

// Initialize default admin
export const initAdmin = mutation({
  args: {},
  handler: async (ctx, _args) => {
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
