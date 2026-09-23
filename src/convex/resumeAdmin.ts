import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const adminGetResumes = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!viewer || !canViewResumes(viewer)) {
      return [];
    }

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
    if (!editor || !canViewResumes(editor)) {
      throw new Error("You do not have permission to manage resumes");
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
    editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!editor || !canViewResumes(editor)) {
      throw new Error("You do not have permission to manage resumes");
    }

    const storedEntry = await ctx.db.insert("resumes", {
      applicantId: args.editorId,
      applicationId: undefined,
      name: `resumes:manual:${Date.now()}`,
      originalName: `manual-upload-${Date.now()}.pdf`,
      contentType: "application/pdf",
      sizeBytes: 0,
      sanitizerStatus: "clean",
      scanSummary: [
        "[ADMIN] Manually added by administrator",
        "[PASS] No file upload — metadata-only record",
        "[INFO] Resume file must be uploaded separately via secure upload flow",
      ].join("\n"),
    } as any);

    return { ok: true, resumeId: storedEntry };
  },
});

function isMasterAdmin(u: any) {
  return Boolean(u && u.isMasterAdmin === true);
}

/** Master admins and accounts with the applications permission may view resumes. */
function canViewResumes(u: any) {
  return isMasterAdmin(u) || Boolean(u && (u.permissions ?? []).includes("view_applications"));
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
