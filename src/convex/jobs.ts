import { v } from "convex/values";
import { mutation, query } from "./_generated/server"; // permission-aware job operations

const ALLOWED_MIME_TYPES = new Set(["application/pdf"]);

export const createJob = mutation({
  args: {
    title: v.string(), role: v.string(), jobType: v.optional(v.string()), companyName: v.optional(v.string()),
    requirements: v.string(), salary: v.string(), benefits: v.optional(v.string()), extraInfo: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.createdBy);
    if (!user || !("email" in user)) throw new Error("Sign in required");
    if (user.role !== "admin" && !(user.permissions ?? []).includes("manage_jobs")) throw new Error("You do not have permission to publish jobs");
    return { jobId: await ctx.db.insert("jobs", { title: args.title, role: args.role, jobType: args.jobType ?? "Full-time", companyName: args.companyName ?? "Streamscale", requirements: args.requirements, salary: args.salary, benefits: args.benefits, extraInfo: args.extraInfo, createdBy: user.email }) };
  },
});

export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"), title: v.optional(v.string()), role: v.optional(v.string()), jobType: v.optional(v.string()), companyName: v.optional(v.string()),
    requirements: v.optional(v.string()), salary: v.optional(v.string()), benefits: v.optional(v.string()), extraInfo: v.optional(v.string()), editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId);
    if (!user || !("email" in user) || (user.role !== "admin" && !(user.permissions ?? []).includes("manage_jobs"))) throw new Error("You do not have permission to edit jobs");
    const { jobId, editorId, ...updates } = args;
    await ctx.db.patch(jobId, Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined)));
    return { success: true };
  },
});

export const deleteJob = mutation({
  args: { jobId: v.id("jobs"), editorId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId) as any;
    if (!user || user.isAnonymous || (user.role !== "admin" && !(user.permissions ?? []).includes("manage_jobs"))) throw new Error("You do not have permission to delete jobs");
    await ctx.db.delete(args.jobId);
    return { success: true };
  },
});

export const listJobs = query({ handler: async (ctx) => (await ctx.db.query("jobs").collect()).sort((a, b) => b._creationTime - a._creationTime) });

export const applyToJob = mutation({
  args: { jobId: v.id("jobs"), name: v.string(), email: v.string(), phone: v.optional(v.string()), message: v.optional(v.string()), resumePdf: v.union(v.object({ storageId: v.id("resumes"), name: v.string(), contentType: v.string(), size: v.number() }), v.null()) },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    let resumePdfId: v.Id<"resumes"> | undefined;
    if (args.resumePdf && args.resumePdf.storageId) {
      const file = await ctx.storage.get(args.resumePdf.storageId);
      if (!file || !ALLOWED_MIME_TYPES.has(file.metadata?.contentType?.split(";")[0].toLowerCase() ?? "")) throw new Error("Resume upload is not supported");
      resumePdfId = args.resumePdf.storageId;
    }
    return { applicationId: await ctx.db.insert("applications", { jobId: args.jobId, applicantName: args.name, applicantEmail: args.email, applicantPhone: args.phone, message: args.message, resumePdfId, status: "pending" }) };
  },
});

export const listApplications = query({
  handler: async (ctx) => (await ctx.db.query("applications").collect()).sort((a, b) => b._creationTime - a._creationTime),
  args: { viewerId: v.optional(v.id("users")) },
  input: true,
});export const updateApplicationStatus = mutation({
  args: { applicationId: v.id("applications"), status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("contacted")), editorId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId) as any;
    if (!user || user.isAnonymous || (user.role !== "admin" && !(user.permissions ?? []).includes("view_applications"))) throw new Error("You do not have permission to manage applications");
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");
    if (application.resumePdfId) {
      const file = await ctx.storage.get(application.resumePdfId);
      if (!file) throw new Error("Resume file is no longer available");
    }

    await ctx.db.patch(args.applicationId, { status: args.status });
    return { success: true };
  },
});

export const getResumeMetadata = query({
  args: { resumePdfId: v.id("resumes") },
  handler: async (ctx) => {
    const file = await ctx.storage.get(args.resumePdfId);
    if (!file) return null;
    return { name: file.displayName ?? "resume.pdf", contentType: file.metadata?.contentType ?? "application/pdf", size: file.size };
  },
});
