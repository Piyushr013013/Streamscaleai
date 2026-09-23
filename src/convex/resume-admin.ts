import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const adminGetResumes = query({
  args: {},
  handler: async (ctx) => {
    const resumes = await ctx.db.query("resumes").collect();
    const applications = await ctx.db.query("applications").collect();
    const jobs = await ctx.db.query("jobs").collect();

    const jobById = Object.fromEntries(jobs.map((j) => [j._id.toString(), j]));
    const applicationById = Object.fromEntries(
      applications.map((a) => [a._id.toString(), a])
    );

    return resumes
      .filter(isResumeRecord)
      .map((r) => {
        const application =
          r.applicationId && applicationById[r.applicationId.toString()];
        const job = application?.jobId
          ? jobById[application.jobId.toString()]
          : undefined;

        return {
          _id: r._id,
          applicantId: r.applicantId,
          name: r.name,
          originalName: r.originalName ?? r.name,
          contentType: r.contentType,
          sizeBytes: r.sizeBytes,
          sanitizerStatus: r.sanitizerStatus,
          scanSummary: r.scanSummary,
          applicationId: r.applicationId,
          applicantEmail: application?.applicantEmail ?? null,
          applicantName: application?.applicantName ?? null,
          jobTitle: job?.title ?? null,
        };
      })
      .sort((a, b) => (((a as any)._creationTime as any) ?? 0) - (((b as any)._creationTime as any) ?? 0));
  },
});

export const adminDeleteResume = mutation({
  args: {
    resumeId: v.id("resumes"),
    editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!editor || !isMasterAdmin(editor)) {
      throw new Error("Master admin access required");
    }

    const resume = await ctx.db.get(args.resumeId);
    if (!resume || !isResumeRecord(resume)) {
      throw new Error("Resume not found");
    }

    await ctx.db.delete(args.resumeId);
    return { ok: true };
  },
});

export const adminAddManualResume = mutation({
  args: {
    applicantEmail: v.string(),
    applicantName: v.string(),
    jobTitle: v.optional(v.string()),
    fileId: v.id("resumes"),
    editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!editor || !isMasterAdmin(editor)) {
      throw new Error("Master admin access required");
    }

    await ctx.db.patch(args.fileId, {
      applicantId: args.editorId,
      name: `resumes:manual:${args.fileId}`,
      originalName: `manual-upload-${Date.now()}.pdf`,
      sanitizerStatus: "clean",
      scanSummary: "Manually added by admin",
    } as any);
    return { ok: true };
  },
});

function isMasterAdmin(u: any) {
  return Boolean(u && u.isMasterAdmin === true);
}

function isResumeRecord(r: any) {
  return (
    r &&
    typeof r === "object" &&
    typeof r.name === "string" &&
    typeof r.contentType === "string" &&
    typeof r.sizeBytes === "number" &&
    typeof r.sanitizerStatus === "string"
  );
}
