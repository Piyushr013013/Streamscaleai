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
        isMasterAdmin: v.optional(v.boolean()),
        isMaster: v.optional(v.boolean()),
        emailVerified: v.boolean(),
        permissions: v.optional(v.array(v.string())),
        socialLinks: v.optional(
          v.object({
            linkedin: v.optional(v.string()),
            twitter: v.optional(v.string()),
            website: v.optional(v.string()),
          })
        ),
        otp: v.optional(v.string()),
        otpExpiry: v.optional(v.float64()),
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
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("contacted")
    ),
    message: v.optional(v.string()),
    resumeStorageId: v.optional(v.string()),
  }).index("by_applicant_email", ["applicantEmail"]),

  partnerRequests: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    service: v.union(
      v.literal("ai"),
      v.literal("testing_ai"),
      v.literal("recruitment"),
      v.literal("compliance"),
      v.literal("monitoring"),
      v.literal("integration")
    ),
    // Optional so legacy partner requests (saved before multi-select existed)
    // still validate; every new write supplies a full array of selections.
    services: v.optional(v.array(v.union(
      v.literal("ai"),
      v.literal("testing_ai"),
      v.literal("recruitment"),
      v.literal("compliance"),
      v.literal("monitoring"),
      v.literal("integration")
    ))),
    requirements: v.string(),
    objectives: v.optional(v.array(v.string())),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("active"), v.literal("closed")),
  }).index("by_service", ["service"]),


  notificationSettings: defineTable({
    key: v.literal("default"),
    partnerRequestRecipients: v.array(v.string()),
    jobApplicationRecipients: v.array(v.string()),
    accountRecipients: v.array(v.string()),
    updatedBy: v.id("users"),
  }).index("by_key", ["key"]),

  resumes: defineTable({
    applicantId: v.id("users"),
    applicationId: v.optional(v.id("applications")),
    name: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    sanitizerStatus: v.union(
      v.literal("pending"),
      v.literal("clean"),
      v.literal("blocked")
    ),
    scanSummary: v.optional(v.string()),
    originalName: v.optional(v.string()),
  }).index("by_application", ["applicationId"]),


  teamMembers: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    role: v.string(),
    bio: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    avatarColor: v.string(),
    order: v.number(),
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
