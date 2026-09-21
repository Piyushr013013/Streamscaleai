import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable(
    v.union(
      v.object({
        email: v.string(),
        name: v.string(),
        passwordHash: v.string(),
        role: v.union(v.literal("admin"), v.literal("user")),
        emailVerified: v.boolean(),
        otp: v.optional(v.string()),
        otpExpiry: v.optional(v.number()),
      }),
      v.object({ isAnonymous: v.literal(true) })
    )
  ).index("by_email", ["email"]),

  jobs: defineTable({
    title: v.string(),
    role: v.string(),
    requirements: v.string(),
    salary: v.string(),
    extraInfo: v.optional(v.string()),
    createdBy: v.string(),
  }),

  applications: defineTable({
    jobId: v.id("jobs"),
    applicantName: v.string(),
    applicantEmail: v.string(),
    applicantPhone: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("contacted")),
    message: v.optional(v.string()),
  }),
  bookings: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    bookingType: v.union(
      v.literal("ai"),
      v.literal("testing_ai"),
      v.literal("recruitment")
    ),
    preferredTime: v.string(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("confirmed")),
  }),
});
