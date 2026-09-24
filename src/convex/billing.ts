import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Accounting / billing system.
 *
 * Access model:
 * - "billing" role accounts (the CFO) can do everything here: manage people,
 *   clients, contracts, payments, and create viewer accounts.
 * - Master admins can view everything but only the CFO edits.
 * - Any user with a billingPerson linked can see their own earnings/payouts.
 */

const CFO_EMAIL = "jaiveerssahni@gmail.com";
const CFO_INITIAL_PASSWORD = "nicheyams67";

function isRealUser(u: any) {
  return !u?.isAnonymous && typeof u?.email === "string";
}

/** CFO = a real user with role "billing". Master admins can view but not edit. */
function isCfo(u: any) {
  return Boolean(u && isRealUser(u) && u.role === "billing");
}

function isMasterAdmin(u: any) {
  return Boolean(u && isRealUser(u) && u.isMasterAdmin === true);
}

async function requireCfo(ctx: any, actorId: any) {
  const actor = await ctx.db.get(actorId);
  if (!actor || !isCfo(actor)) {
    throw new Error(
      "Only the CFO account can make billing changes. Ask the CFO if you need something updated."
    );
  }
  return actor;
}

async function hashPassword(password: string): Promise<string> {
  const { hashPassword: hash } = await import("./auth");
  return hash(password);
}

/** Ensure the CFO account exists with the initial credentials. */
export const initCfoAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", CFO_EMAIL))
      .first();

    if (existing && isRealUser(existing)) {
      if ((existing as any).role !== "billing") {
        await ctx.db.patch(existing._id, { role: "billing" } as any);
      }
      return { exists: true };
    }

    await ctx.db.insert("users", {
      email: CFO_EMAIL,
      name: "Jaiveer (CFO)",
      passwordHash: await hashPassword(CFO_INITIAL_PASSWORD),
      role: "billing",
      emailVerified: true,
    });
    return { ok: true };
  },
});

/** Login-like check used by the Billing page to know what the viewer can see. */
export const getBillingAccess = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !isRealUser(user)) {
      return { access: "none" as const };
    }
    if (isCfo(user)) return { access: "cfo" as const };
    if (isMasterAdmin(user)) return { access: "master" as const };

    const linkedPerson = await ctx.db
      .query("billingPeople")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    if (linkedPerson) return { access: "person" as const, personId: linkedPerson._id };

    return { access: "none" as const };
  },
});

// ---- People (comp plans) ----

export const listPeople = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!viewer || (!isCfo(viewer) && !isMasterAdmin(viewer))) return [];
    const people = await ctx.db.query("billingPeople").collect();
    const payouts = await ctx.db.query("billingPayouts").collect();

    return people.map((p: any) => {
      const paid = payouts
        .filter((x: any) => x.personId.toString() === p._id.toString())
        .reduce((sum: number, x: any) => sum + (x.amount ?? 0), 0);
      const linkedUser = p.userId ? ctx.db.get(p.userId) : null;
      return {
        _id: p._id,
        name: p.name,
        compType: p.compType,
        percent: p.percent,
        fixedAmount: p.fixedAmount,
        note: p.note,
        userId: p.userId,
        totalPaid: paid,
      };
    });
  },
});

export const createPerson = mutation({
  args: {
    name: v.string(),
    compType: v.union(v.literal("percent"), v.literal("fixed")),
    percent: v.optional(v.number()),
    fixedAmount: v.optional(v.number()),
    note: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    if (args.compType === "percent" && (args.percent === undefined || args.percent <= 0 || args.percent > 100)) {
      throw new Error("Enter a percentage between 0 and 100 for percent-based pay.");
    }
    if (args.compType === "fixed" && (args.fixedAmount === undefined || args.fixedAmount < 0)) {
      throw new Error("Enter a fixed dollar amount of 0 or more.");
    }
    if (!args.name.trim()) throw new Error("Enter the person's name.");

    return await ctx.db.insert("billingPeople", {
      name: args.name.trim(),
      compType: args.compType,
      percent: args.compType === "percent" ? args.percent : undefined,
      fixedAmount: args.compType === "fixed" ? args.fixedAmount : undefined,
      note: args.note?.trim() || undefined,
      userId: args.userId || undefined,
      createdBy: args.actorId,
    });
  },
});

export const updatePerson = mutation({
  args: {
    personId: v.id("billingPeople"),
    name: v.optional(v.string()),
    compType: v.optional(v.union(v.literal("percent"), v.literal("fixed"))),
    percent: v.optional(v.number()),
    fixedAmount: v.optional(v.number()),
    note: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    const person = await ctx.db.get(args.personId);
    if (!person) throw new Error("That person no longer exists.");

    const patch: any = {};
    if (args.name !== undefined && args.name.trim()) patch.name = args.name.trim();
    if (args.compType !== undefined) patch.compType = args.compType;
    if (args.percent !== undefined) patch.percent = args.percent;
    if (args.fixedAmount !== undefined) patch.fixedAmount = args.fixedAmount;
    if (args.note !== undefined) patch.note = args.note.trim() || undefined;
    if (args.userId !== undefined) patch.userId = args.userId || undefined;

    await ctx.db.patch(args.personId, patch);
    return { ok: true };
  },
});

export const deletePerson = mutation({
  args: { personId: v.id("billingPeople"), actorId: v.id("users") },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    await ctx.db.delete(args.personId);
    return { ok: true };
  },
});

// ---- Clients ----

export const listClients = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!viewer || (!isCfo(viewer) && !isMasterAdmin(viewer))) return [];
    return await ctx.db.query("billingClients").collect();
  },
});

export const createClient = mutation({
  args: {
    companyName: v.string(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    note: v.optional(v.string()),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    if (!args.companyName.trim()) throw new Error("Enter the company name.");
    return await ctx.db.insert("billingClients", {
      companyName: args.companyName.trim(),
      contactName: args.contactName?.trim() || undefined,
      contactEmail: args.contactEmail?.trim() || undefined,
      note: args.note?.trim() || undefined,
      createdBy: args.actorId,
    });
  },
});

export const deleteClient = mutation({
  args: { clientId: v.id("billingClients"), actorId: v.id("users") },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    const contracts = await ctx.db
      .query("billingContracts")
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .collect();
    if (contracts.length > 0) {
      throw new Error(
        "This company still has contracts attached. Delete or reassign those contracts first."
      );
    }
    await ctx.db.delete(args.clientId);
    return { ok: true };
  },
});

// ---- Contracts ----

export const listContracts = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!viewer || (!isCfo(viewer) && !isMasterAdmin(viewer))) return [];

    const contracts = await ctx.db.query("billingContracts").collect();
    const clients = await ctx.db.query("billingClients").collect();
    const people = await ctx.db.query("billingPeople").collect();
    const payouts = await ctx.db.query("billingPayouts").collect();

    return contracts.map((c: any) => {
      const client = clients.find((x: any) => x._id.toString() === c.clientId.toString());
      const totalSalaries = (c.workers ?? []).reduce(
        (sum: number, w: any) => sum + (w.salary ?? 0),
        0
      );
      const fee =
        c.feeType === "percent_of_salaries"
          ? Math.round(totalSalaries * ((c.feePercent ?? 0) / 100))
          : c.flatFee ?? 0;
      const paid = payouts
        .filter((x: any) => x.contractId.toString() === c._id.toString())
        .reduce((sum: number, x: any) => sum + (x.amount ?? 0), 0);
      const splits = people.map((p: any) => {
        const share =
          p.compType === "percent"
            ? Math.round(fee * ((p.percent ?? 0) / 100))
            : p.fixedAmount ?? 0;
        return {
          personId: p._id,
          name: p.name,
          compType: p.compType,
          share,
          paid: payouts
            .filter(
              (x: any) =>
                x.contractId.toString() === c._id.toString() &&
                x.personId.toString() === p._id.toString()
            )
            .reduce((sum: number, x: any) => sum + (x.amount ?? 0), 0),
        };
      });
      return {
        _id: c._id,
        clientName: client?.companyName ?? "Unknown company",
        clientId: c.clientId,
        feeType: c.feeType,
        feePercent: c.feePercent,
        flatFee: c.flatFee,
        workers: c.workers,
        totalSalaries,
        fee,
        status: c.status,
        amountPaid: c.amountPaid ?? 0,
        note: c.note,
        totalPaidOut: paid,
        splits,
      };
    });
  },
});

export const createContract = mutation({
  args: {
    clientId: v.id("billingClients"),
    feeType: v.union(v.literal("percent_of_salaries"), v.literal("flat")),
    feePercent: v.optional(v.number()),
    flatFee: v.optional(v.number()),
    workers: v.array(v.object({ name: v.string(), salary: v.number() })),
    note: v.optional(v.string()),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    if (!args.clientId) throw new Error("Pick the company this contract belongs to.");
    if (args.workers.length === 0) {
      throw new Error("Add at least one worker with their first-year salary.");
    }
    for (const w of args.workers) {
      if (!w.name.trim() || w.salary < 0) {
        throw new Error("Every worker needs a name and a salary of 0 or more.");
      }
    }
    if (args.feeType === "percent_of_salaries") {
      if (args.feePercent === undefined || args.feePercent <= 0 || args.feePercent > 100) {
        throw new Error("Enter a fee percentage between 0 and 100 of the combined first-year salaries.");
      }
    } else if (args.flatFee === undefined || args.flatFee < 0) {
      throw new Error("Enter a flat fee of 0 or more.");
    }

    return await ctx.db.insert("billingContracts", {
      clientId: args.clientId,
      feeType: args.feeType,
      feePercent: args.feeType === "percent_of_salaries" ? args.feePercent : undefined,
      flatFee: args.feeType === "flat" ? args.flatFee : undefined,
      workers: args.workers.map((w) => ({ name: w.name.trim(), salary: w.salary })),
      status: "in_progress",
      note: args.note?.trim() || undefined,
      createdBy: args.actorId,
    });
  },
});

export const updateContractStatus = mutation({
  args: {
    contractId: v.id("billingContracts"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("fulfilled"),
      v.literal("cancelled")
    ),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    await ctx.db.patch(args.contractId, { status: args.status });
    return { ok: true };
  },
});

export const updateContractPaid = mutation({
  args: {
    contractId: v.id("billingContracts"),
    amountPaid: v.number(),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    if (args.amountPaid < 0) throw new Error("Amount paid cannot be negative.");
    await ctx.db.patch(args.contractId, { amountPaid: args.amountPaid });
    return { ok: true };
  },
});

export const deleteContract = mutation({
  args: { contractId: v.id("billingContracts"), actorId: v.id("users") },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    const payouts = await ctx.db
      .query("billingPayouts")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();
    for (const payout of payouts) {
      await ctx.db.delete(payout._id);
    }
    await ctx.db.delete(args.contractId);
    return { ok: true };
  },
});

// ---- Payouts ----

/**
 * Record a payment for a contract. Splits the payment across people with comp
 * plans proportionally to their share of the fee, and stores per-person
 * payout records so everyone can see what they were paid.
 */
export const recordPayment = mutation({
  args: {
    contractId: v.id("billingContracts"),
    amount: v.number(),
    note: v.optional(v.string()),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("That contract no longer exists.");
    if (contract.status !== "fulfilled") {
      throw new Error(
        "Payments can only be recorded on fulfilled contracts. Mark the contract fulfilled first."
      );
    }
    if (args.amount <= 0) {
      throw new Error("Enter a payment amount greater than zero.");
    }

    const people = await ctx.db.query("billingPeople").collect();
    const totalSalaries = (contract.workers ?? []).reduce(
      (sum: number, w: any) => sum + (w.salary ?? 0),
      0
    );
    const fee =
      contract.feeType === "percent_of_salaries"
        ? Math.round(totalSalaries * ((contract.feePercent ?? 0) / 100))
        : contract.flatFee ?? 0;

    const shares = people.map((p: any) => ({
      person: p,
      share:
        p.compType === "percent"
          ? Math.round(fee * ((p.percent ?? 0) / 100))
          : p.fixedAmount ?? 0,
    }));
    const totalShares = shares.reduce((sum, s) => sum + s.share, 0);
    if (totalShares <= 0) {
      throw new Error(
        "No one has a payout plan yet, so there is nothing to split. Add people and their pay split first."
      );
    }

    for (const { person, share } of shares) {
      if (share <= 0) continue;
      const portion = Math.round(args.amount * (share / totalShares));
      if (portion <= 0) continue;
      await ctx.db.insert("billingPayouts", {
        contractId: args.contractId,
        personId: person._id,
        amount: portion,
        note: args.note?.trim() || undefined,
        createdBy: args.actorId,
      });
    }

    // Track how much the client has paid in total.
    const newPaid = (contract.amountPaid ?? 0) + args.amount;
    await ctx.db.patch(args.contractId, { amountPaid: newPaid } as any);

    return { ok: true, recordedTotal: args.amount };
  },
});

/** My earnings: payouts linked to the signed-in person. */
export const getMyEarnings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const linked = await ctx.db
      .query("billingPeople")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    if (!linked) return null;

    const payouts = await ctx.db
      .query("billingPayouts")
      .withIndex("by_person", (q) => q.eq("personId", linked._id))
      .collect();

    const contracts = await ctx.db.query("billingContracts").collect();
    const clients = await ctx.db.query("billingClients").collect();

    const rows = payouts
      .map((p: any) => {
        const contract = contracts.find(
          (c: any) => c._id.toString() === p.contractId.toString()
        );
        const client = contract
          ? clients.find((c: any) => c._id.toString() === contract.clientId.toString())
          : null;
        return {
          _id: p._id,
          amount: p.amount,
          paidAt: p._creationTime,
          note: p.note,
          clientName: client?.companyName ?? "Unknown company",
        };
      })
      .sort((a: any, b: any) => b.paidAt - a.paidAt);

    return {
      name: linked.name,
      compType: linked.compType,
      percent: linked.percent,
      fixedAmount: linked.fixedAmount,
      totalPaid: rows.reduce((sum: number, r: any) => sum + r.amount, 0),
      payouts: rows,
    };
  },
});

/** CFO can change their own email/password from the billing Settings tab. */
export const changeCfoCredentials = mutation({
  args: {
    currentPassword: v.string(),
    newEmail: v.optional(v.string()),
    newPassword: v.optional(v.string()),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await requireCfo(ctx, args.actorId);
    const { verifyPassword, hashPassword: hash } = await import("./auth");

    const ok = await verifyPassword(args.currentPassword, actor.passwordHash);
    if (!ok) {
      throw new Error("That current password doesn't match. Nothing was changed.");
    }

    const patch: any = {};
    if (args.newEmail !== undefined && args.newEmail.trim()) {
      const email = args.newEmail.toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("That new email doesn't look like a valid email address.");
      }
      if (email !== actor.email) {
        const conflict = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();
        if (conflict && conflict._id.toString() !== actor._id.toString()) {
          throw new Error("That email is already used by another account.");
        }
        patch.email = email;
      }
    }
    if (args.newPassword !== undefined && args.newPassword.length > 0) {
      if (args.newPassword.length < 6) {
        throw new Error("The new password must be at least 6 characters.");
      }
      patch.passwordHash = await hash(args.newPassword);
    }

    if (Object.keys(patch).length === 0) {
      throw new Error("Enter a new email or a new password to change something.");
    }

    await ctx.db.patch(actor._id, patch);
    return { ok: true };
  },
});

/** List of users available to link a billing person to (CFO only). */
export const listLinkableUsers = query({
  args: { viewerId: v.id("users") },
  handler: async (ctx, args) => {
    const viewer = await ctx.db.get(args.viewerId);
    if (!viewer || !isCfo(viewer)) return [];
    const users = await ctx.db.query("users").collect();
    return users
      .filter(isRealUser)
      .map((u: any) => ({ _id: u._id, name: u.name, email: u.email }));
  },
});

/**
 * CFO-created viewer account: either a brand-new login, or a payment view
 * attached to an account the master admin already made.
 */
export const createViewerAccount = mutation({
  args: {
    email: v.string(),
    password: v.optional(v.string()),
    name: v.string(),
    // When set, attach billing to this existing account instead of creating one.
    linkExistingUserId: v.optional(v.id("users")),
    compType: v.union(v.literal("percent"), v.literal("fixed")),
    percent: v.optional(v.number()),
    fixedAmount: v.optional(v.number()),
    actorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCfo(ctx, args.actorId);
    if (!args.name.trim()) throw new Error("Enter the person's name.");

    let userId = args.linkExistingUserId || undefined;
    let personUserId = userId;

    if (!userId) {
      const email = args.email.toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Enter a valid email address for the new account.");
      }
      if (!args.password || args.password.length < 6) {
        throw new Error("New accounts need a password of at least 6 characters.");
      }
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (existing) {
        throw new Error(
          "That email already has an account. Use 'Connect to an existing account' instead."
        );
      }
      const { hashPassword: hash } = await import("./auth");
      personUserId = await ctx.db.insert("users", {
        email,
        name: args.name.trim(),
        passwordHash: await hash(args.password),
        role: "user",
        emailVerified: true,
      });
    }

    // Create the billing person linked to that account.
    if (args.compType === "percent" && (args.percent === undefined || args.percent <= 0 || args.percent > 100)) {
      throw new Error("Enter a percentage between 0 and 100 for percent-based pay.");
    }
    if (args.compType === "fixed" && (args.fixedAmount === undefined || args.fixedAmount < 0)) {
      throw new Error("Enter a fixed dollar amount of 0 or more.");
    }

    await ctx.db.insert("billingPeople", {
      name: args.name.trim(),
      compType: args.compType,
      percent: args.compType === "percent" ? args.percent : undefined,
      fixedAmount: args.compType === "fixed" ? args.fixedAmount : undefined,
      userId: personUserId,
      createdBy: args.actorId,
    });

    return { ok: true };
  },
});
