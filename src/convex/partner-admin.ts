import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const adminGetNotifications = query({
  args: {},
  handler: async (ctx) => {
    const partnerRequests = await ctx.db
      .query("partnerRequests")
      .collect();

    const applications = await ctx.db
      .query("applications")
      .collect();

    return {
      partnerRequests: partnerRequests
        .filter(isPartnerRequest)
        .map((r) => ({
          _id: r._id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          services: Array.isArray(r.services) ? r.services : [r.service],
          service: r.service,
          requirements: r.requirements,
          status: r.status,
          createdAt: r._creationTime,
        })),
      applications: applications
        .filter(isApplication)
        .map((a) => ({
          _id: a._id,
          jobId: a.jobId,
          applicantName: a.applicantName,
          applicantEmail: a.applicantEmail,
          applicantPhone: a.applicantPhone,
          status: a.status,
          message: a.message,
          resumeStorageId: a.resumeStorageId,
          createdAt: a._creationTime,
        })),
    };
  },
});

export const adminGetNotificationStats = query({
  args: {},
  handler: async (ctx) => {
    const partnerRequests = await ctx.db.query("partnerRequests").collect();
    const applications = await ctx.db.query("applications").collect();

    return {
      partnerRequestsTotal: partnerRequests.filter(isPartnerRequest).length,
      partnerRequestsContacted: partnerRequests.filter(
        isPartnerRequestWithStatus("contacted")
      ).length,
      applicationsTotal: applications.filter(isApplication).length,
      applicationsReviewed: applications.filter(
        isApplicationWithStatus("reviewed")
      ).length,
    };
  },
});

export const adminMarkPartnerRequestContacted = mutation({
  args: {
    requestId: v.id("partnerRequests"),
    editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!editor || !isMasterAdmin(editor)) {
      throw new Error("Master admin access required");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request || !isPartnerRequest(request)) {
      throw new Error("Partner request not found");
    }

    await ctx.db.patch(args.requestId, { status: "contacted" });
    return { ok: true };
  },
});

export const adminDeletePartnerRequest = mutation({
  args: {
    requestId: v.id("partnerRequests"),
    editorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!editor || !isMasterAdmin(editor)) {
      throw new Error("Master admin access required");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request || !isPartnerRequest(request)) {
      throw new Error("Partner request not found");
    }

    await ctx.db.delete(args.requestId);
    return { ok: true };
  },
});

export const adminCreatePartnerRequest = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    services: v.array(
      v.union(
        v.literal("ai"),
        v.literal("testing_ai"),
        v.literal("recruitment")
      )
    ),
    requirements: v.string(),
    creatorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId);
    if (!creator || !isMasterAdmin(creator)) {
      throw new Error("Master admin access required");
    }

    const serviceList = args.services.length > 0 ? args.services : [args.services[0]];
    const primaryService = serviceList[0];

    return await ctx.db.insert("partnerRequests", {
      name: args.name.trim(),
      email: args.email.toLowerCase().trim(),
      phone: args.phone.trim(),
      service: primaryService,
      services: serviceList,
      requirements: args.requirements.trim(),
      status: "new",
    });
  },
});

function isRealUser(u: any) {
  return !u?.isAnonymous && typeof u?.email === "string";
}

function isMasterAdmin(u: any) {
  return Boolean(u && u.isMasterAdmin === true);
}

function isPartnerRequest(r: any) {
  return (
    r &&
    typeof r === "object" &&
    typeof r.name === "string" &&
    typeof r.email === "string"
  );
}

function isPartnerRequestWithStatus(status: string) {
  return (r: any) => isPartnerRequest(r) && r.status === status;
}

function isApplication(a: any) {
  return (
    a &&
    typeof a === "object" &&
    typeof a.applicantName === "string" &&
    typeof a.applicantEmail === "string"
  );
}

function isApplicationWithStatus(status: string) {
  return (a: any) => isApplication(a) && a.status === status;
}
