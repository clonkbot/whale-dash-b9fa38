import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's watchlist
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Add address to watchlist
export const add = mutation({
  args: {
    address: v.string(),
    label: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already exists
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("address"), args.address.toLowerCase()))
      .first();

    if (existing) throw new Error("Address already in watchlist");

    return await ctx.db.insert("watchlist", {
      userId,
      address: args.address.toLowerCase(),
      label: args.label,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

// Remove from watchlist
export const remove = mutation({
  args: { id: v.id("watchlist") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});

// Update watchlist item
export const update = mutation({
  args: {
    id: v.id("watchlist"),
    label: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, {
      ...(args.label !== undefined && { label: args.label }),
      ...(args.notes !== undefined && { notes: args.notes }),
    });
  },
});
