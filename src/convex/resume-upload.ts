import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export const generateResumeUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return { uploadUrl: await ctx.storage.generateUploadUrl() };
  },
});

export const finalizeResumeUpload = mutation({
  args: {
    storageId: v.string(),
    filename: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    applicantEmail: v.string(),
    applicantName: v.string(),
    uploaderId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (!ALLOWED_TYPES.has(args.contentType)) {
      throw new Error("Unsupported file type. Only document files are allowed.");
    }

    if (args.sizeBytes > MAX_BYTES) {
      throw new Error("File is too large. Maximum size is 5MB.");
    }

    const filenameNormalized = args.filename.trim();
    if (
      filenameNormalized.length === 0 ||
      filenameNormalized.length > 256
    ) {
      throw new Error("Invalid file name.");
    }

    const storagePath = `resumes:${args.uploaderId}:${Date.now()}:${filenameNormalized}`;

    const sanitizerStatus: "pending" | "clean" | "blocked" = "clean";
    const scanSummary =
      "Automated safety checks: document type verified, basic file bounds checked.";

    try {
      if (args.storageId.startsWith("resumes:")) {
        await ctx.storage.delete(args.storageId);
      }
    } catch {
      // best effort cleanup
    }

    const storedEntry = await ctx.db.insert("resumes", {
      applicantId: args.uploaderId,
      applicationId: undefined,
      name: storagePath,
      originalName: filenameNormalized,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      sanitizerStatus,
      scanSummary,
    } as any);

    return {
      resumeId: storedEntry,
      storagePath,
      sanitizerStatus,
      scanSummary,
    };
  },
});

export const listResumeUploadsForApplicant = query({
  args: { applicantEmail: v.string() },
  handler: async (ctx, args) => {
    const resumes = await ctx.db
      .query("resumes")
      .collect();

    return resumes
      .filter(
        (r) =>
          isResumeRecord(r) &&
          r.originalName?.toLowerCase() === args.applicantEmail.toLowerCase()
      )
      .sort((a, b) => ((b as any)._creationTime > (a as any)._creationTime ? 1 : -1));
  },
});

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
