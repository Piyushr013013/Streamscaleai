import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/** Get the current signed in user */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});
