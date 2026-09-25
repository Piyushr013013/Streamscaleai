import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable(
    v.union(
      v.object({
        email: v.string(),
        name: v.string(),
        passwordHash: v.string(),
        role: v.union(v.literal("admin"), v.literal("user"), v.literal("billing")),
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
        // Brute-force protection: failed sign-in attempts and lockout window.
        failedLoginCount: v.optional(v.number()),
        lockoutUntil: v.optional(v.float64()),
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
    companyName: v.optional(v.string()),
    website: v.optional(v.string()),
    aboutCompany: v.optional(v.string()),
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

  // ---- Accounting / billing system ----

  // A person who receives a share of revenue (percentage) or a fixed salary.
  // May be linked to a login account (userId) so they can see their earnings.
  billingPeople: defineTable({
    name: v.string(),
    // "percent" = share of contract fee; "fixed" = fixed payout per contract;
    // "both" = percent + fixed per contract combined
    compType: v.union(v.literal("percent"), v.literal("fixed"), v.literal("both")),
    // Optional monthly salary treated as a fixed monthly cost in the P&L.
    monthlySalary: v.optional(v.number()),
    percent: v.optional(v.number()), // e.g. 12.5 (percent of fee)
    fixedAmount: v.optional(v.number()), // dollars per fulfilled contract
    userId: v.optional(v.id("users")), // optional linked login account
    note: v.optional(v.string()),
    createdBy: v.id("users"),
  }),

  // A company that booked with Streamscale.
  billingClients: defineTable({
    companyName: v.string(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    note: v.optional(v.string()),
    createdBy: v.id("users"),
  }),

  // A contract with a client. Fee = custom percent of combined first-year
  // salaries of the placed workers, or a flat fee.
  billingContracts: defineTable({
    clientId: v.id("billingClients"),
    // "percent_of_salaries" or "flat"
    feeType: v.union(v.literal("percent_of_salaries"), v.literal("flat")),
    // percent of combined first-year salaries (e.g. 20 for 20%)
    feePercent: v.optional(v.number()),
    flatFee: v.optional(v.number()),
    // workers placed: name + first-year salary each
    workers: v.array(
      v.object({
        name: v.string(),
        salary: v.number(),
      })
    ),
    status: v.union(
      v.literal("in_progress"),
      v.literal("fulfilled"),
      v.literal("cancelled")
    ),
    // How much the client has paid us so far (CFO-editable).
    amountPaid: v.optional(v.number()),
    note: v.optional(v.string()),
    createdBy: v.id("users"),
  }),

  // A general business expense (tools, rent, marketing, salaries, etc.).
  // Recurring monthly expenses are counted once per month in the P&L.
  billingExpenses: defineTable({
    description: v.string(),
    category: v.union(
      v.literal("salaries"),
      v.literal("tools"),
      v.literal("marketing"),
      v.literal("office"),
      v.literal("travel"),
      v.literal("other")
    ),
    amount: v.number(),
    // Recurring = happens every month automatically; one-off has a date.
    recurring: v.boolean(),
    date: v.optional(v.number()), // ms timestamp for one-off expenses
    note: v.optional(v.string()),
    createdBy: v.id("users"),
  }),

  // A payment made out of a fulfilled contract to people with comp plans.
  billingPayouts: defineTable({
    contractId: v.id("billingContracts"),
    personId: v.id("billingPeople"),
    // Snapshotted at payment time so later comp changes don't rewrite history.
    amount: v.number(),
    note: v.optional(v.string()),
    createdBy: v.id("users"),
  }).index("by_person", ["personId"]).index("by_contract", ["contractId"]),

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
