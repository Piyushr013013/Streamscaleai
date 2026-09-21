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
        permissions: v.optional(v.array(v.string())),
        socialLinks: v.optional(v.object({
          linkedin: v.optional(v.string()),
          twitter: v.optional(v.string()),
          website: v.optional(v.string()),
        })),
        otp: v.optional(v.string()),
        otpExpiry: v.optional(v.number()),
      }),
      v.object({ isAnonymous: v.literal(true) })
    )
  ).index("by_email", ["email"]),

  jobs: defineTable({
    title: v.string(),
    role: v.string(),
    jobType: v.string(),
    companyName: v.string(),
    requirements: v.string(),
    salary: v.string(),
    benefits: v.optional(v.string()),
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
    resumePdfId: v.optional(v.id("resumes")),
  }),
  partnerRequests: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    service: v.union(v.literal("ai"), v.literal("testing_ai"), v.literal("recruitment")),
    requirements: v.string(),
    status: v.union(v.literal("new"), v.literal("contacted")),
  }),
  notificationSettings: defineTable({
    key: v.literal("default"),
    partnerRequestRecipients: v.array(v.string()),
    jobApplicationRecipients: v.array(v.string()),
    accountRecipients: v.array(v.string()),
    updatedBy: v.id("users"),
  }).index("by_key", ["key"]),

  resumes: defineTable({}),

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
