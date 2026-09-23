import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "fb_email_2crN1hqIArZP2bEfvjp5Qik4";

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.freebuff.dev/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EMAIL_API_KEY,
    },
    body: JSON.stringify({ to, subject, html }),
  });
  if (!response.ok) throw new Error(`Email send failed: ${response.statusText}`);
}

export const createJob = mutation({
  args: {
    title: v.string(),
    role: v.string(),
    jobType: v.optional(v.string()),
    companyName: v.optional(v.string()),
    requirements: v.string(),
    salary: v.string(),
    benefits: v.optional(v.string()),
    extraInfo: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.createdBy);
    if (!user || !("email" in user)) {
      throw new Error("Sign in required");
    }
    if (user.role !== "admin" && !(user.permissions ?? []).includes("manage_jobs")) {
      throw new Error("You do not have permission to publish jobs");
    }
    return {
      jobId: await ctx.db.insert("jobs", {
        title: args.title,
        role: args.role,
        jobType: args.jobType ?? "Full-time",
        companyName: args.companyName ?? "Streamscale",
        requirements: args.requirements,
        salary: args.salary,
        benefits: args.benefits,
        extraInfo: args.extraInfo,
        createdBy: user.email,
      }),
    };
  },
});

export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.optional(v.string()),
    role: v.optional(v.string()),
    jobType: v.optional(v.string()),
    companyName: v.optional(v.string()),
    requirements: v.optional(v.string()),
    salary: v.optional(v.string()),
    benefits: v.optional(v.string()),
    extraInfo: v.optional(v.string()),
    editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId);
    if (!user || !("email" in user) || (user.role !== "admin" && !(user.permissions ?? []).includes("manage_jobs"))) {
      throw new Error("You do not have permission to edit jobs");
    }
    const { jobId, editorId, ...updates } = args;
    await ctx.db.patch(jobId, Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined && value !== null)));
    return { success: true };
  },
});

export const deleteJob = mutation({
  args: { jobId: v.id("jobs"), editorId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId) as any;
    if (!user || user.isAnonymous || (user.role !== "admin" && !(user.permissions ?? []).includes("manage_jobs"))) {
      throw new Error("You do not have permission to delete jobs");
    }
    await ctx.db.delete(args.jobId);
    return { success: true };
  },
});

export const listJobs = query({
  handler: async (ctx) =>
    (await ctx.db.query("jobs").collect()).sort((a, b) => b._creationTime - a._creationTime),
});

export const applyToJob = mutation({
  args: {
    jobId: v.id("jobs"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.optional(v.string()),
    resumeStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }    const applicationId = await ctx.db.insert("applications", {
      jobId: args.jobId,
      applicantName: args.name,
      applicantEmail: args.email,
      applicantPhone: args.phone,
      message: args.message,
      resumeStorageId: args.resumeStorageId,
      status: "pending",
    });
    // Send auto-reply to applicant (best-effort)
    try {
      await sendEmail(
        args.email,
        `Your application to Streamscale — ${job.title}`,
        `Hi ${args.name},<br><br>Thanks for applying to the <strong>${job.title}</strong> position at Streamscale. We've received your application and resume.<br><br>Our team reviews applications as they come in. If your background looks like a match, we'll reach out within 5-7 business days.<br><br><a href="${process.env.VITE_SITE_URL || "https://streamscale.com"}/jobs" style="color: #3b82f6;">View all open positions →</a><br><br>Streamscale — We test AI before your company bets on it.`
      );
    } catch (emailErr) {
      // Silently fail - don't block the application
      console.error("Auto-reply email failed:", emailErr);
    }
    return { applicationId };
  },
});

export const listApplications = query({
  args: { viewerId: v.optional(v.id("users")) },
  handler: async (_ctx, _args) =>
    (await _ctx.db.query("applications").collect()).sort((a, b) => b._creationTime - a._creationTime),
});

/** Admin view: applications joined with the job they were submitted for. */
export const adminListApplications = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId) as any;
    if (!viewer || viewer.isAnonymous || (viewer.role !== "admin" && !viewer.isMasterAdmin)) {
      return [];
    }

    const applications = await ctx.db.query("applications").collect();
    const jobs = await ctx.db.query("jobs").collect();
    const jobById = new Map(jobs.map((j) => [j._id.toString(), j]));

    return applications
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((a) => {
        const job = jobById.get(a.jobId.toString());
        return {
          _id: a._id,
          applicantName: a.applicantName,
          applicantEmail: a.applicantEmail,
          applicantPhone: a.applicantPhone,
          status: a.status,
          message: a.message,
          resumeStorageId: a.resumeStorageId,
          jobTitle: job?.title ?? null,
          jobRole: job?.role ?? null,
          createdAt: a._creationTime,
        };
      });
  },
});

/** Permanently delete a job application (admin only). */
export const deleteApplication = mutation({
  args: { applicationId: v.id("applications"), editorId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId) as any;
    if (!user || user.isAnonymous || (user.role !== "admin" && !user.isMasterAdmin)) {
      throw new Error("You do not have permission to delete applications");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Delete the resume document that belongs to this application, if any.
    const resumes = await ctx.db.query("resumes").collect();
    for (const resume of resumes) {
      if (
        resume.applicationId &&
        resume.applicationId.toString() === args.applicationId.toString()
      ) {
        await ctx.db.delete(resume._id);
      }
    }

    await ctx.db.delete(args.applicationId);
    return { ok: true };
  },
});

/** Admin list of all posted jobs with the number of applications each received. */
export const adminListJobs = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId) as any;
    if (!viewer || viewer.isAnonymous || (viewer.role !== "admin" && !viewer.isMasterAdmin)) {
      return [];
    }

    const jobs = await ctx.db.query("jobs").collect();
    const applications = await ctx.db.query("applications").collect();

    const counts = new Map<string, number>();
    for (const app of applications) {
      const key = app.jobId.toString();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return jobs
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((job) => ({
        _id: job._id,
        title: job.title,
        role: job.role,
        jobType: job.jobType,
        companyName: job.companyName,
        requirements: job.requirements,
        salary: job.salary,
        benefits: job.benefits,
        extraInfo: job.extraInfo,
        applicationCount: counts.get(job._id.toString()) ?? 0,
        createdAt: job._creationTime,
      }));
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("contacted")),
    editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.editorId) as any;
    if (!user || user.isAnonymous || (user.role !== "admin" && !(user.permissions ?? []).includes("view_applications"))) {
      throw new Error("You do not have permission to manage applications");
    }
    await ctx.db.patch(args.applicationId, { status: args.status });
    return { success: true };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return { uploadUrl: await ctx.storage.generateUploadUrl() };
  },
});

export const getResumeMetadata = query({
  args: { resumePdfId: v.id("resumes") },
  handler: async (_ctx, { resumePdfId }) => ({ id: resumePdfId, name: "resume.pdf" }),
});
