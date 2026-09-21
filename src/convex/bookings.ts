import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBooking = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status: "pending",
    });
    // In production, send confirmation email here
    console.log("New booking:", args);
    return { bookingId };
  },
});

export const listBookings = query({
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    return bookings.sort((a, b) => b._creationTime - a._creationTime);
  },
});
