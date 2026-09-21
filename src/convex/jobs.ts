import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createJob = mutation({
  args: {
    title: v.string(),
    role: v.string(),
    requirements: v.string(),
    salary: v.string(),
    extraInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For demo, we'll use a simple admin check via context
    // In real implementation, use proper auth
    const jobId = await ctx.db.insert("jobs", {
      ...args,
      createdBy: "admin",
    });
    return { jobId };
  },
});

export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.optional(v.string()),
    role: v.optional(v.string()),
    requirements: v.optional(v.string()),
    salary: v.optional(v.string()),
    extraInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.role !== undefined) updates.role = args.role;
    if (args.requirements !== undefined) updates.requirements = args.requirements;
    if (args.salary !== undefined) updates.salary = args.salary;
    if (args.extraInfo !== undefined) updates.extraInfo = args.extraInfo;
    await ctx.db.patch(args.jobId, updates);
    return { success: true };
  },
});

export const deleteJob = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.jobId);
    return { success: true };
  },
});

export const listJobs = query({
  handler: async (ctx) => {
    const jobs = await ctx.db.query("jobs").collect();
    return jobs.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getJob = query({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

export const applyToJob = mutation({
  args: {
    jobId: v.id("jobs"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const applicationId = await ctx.db.insert("applications", {
      jobId: args.jobId,
      applicantName: args.name,
      applicantEmail: args.email,
      applicantPhone: args.phone,
      message: args.message,
      status: "pending",
    });
    // In production, send email to admin here
    console.log(`New application for job ${args.jobId}:`, args);
    return { applicationId };
  },
});

export const getApplications = query({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .collect();
    return applications
      .filter((app) => app.jobId === args.jobId)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("contacted")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, { status: args.status });
    return { success: true };
  },
});

export const listApplications = query({
  handler: async (ctx) => {
    const applications = await ctx.db.query("applications").collect();
    return applications.sort((a, b) => b._creationTime - a._creationTime);
  },
});
