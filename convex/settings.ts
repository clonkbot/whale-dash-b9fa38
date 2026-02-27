import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Return defaults if no settings exist
    if (!settings) {
      return {
        theme: "dark",
        minDisplayAmount: 100000,
        favoriteTokens: [],
        favoriteChains: [],
        soundEnabled: true,
        compactView: false,
      };
    }

    return settings;
  },
});

// Update user settings
export const update = mutation({
  args: {
    theme: v.optional(v.string()),
    minDisplayAmount: v.optional(v.number()),
    favoriteTokens: v.optional(v.array(v.string())),
    favoriteChains: v.optional(v.array(v.string())),
    soundEnabled: v.optional(v.boolean()),
    compactView: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.theme !== undefined && { theme: args.theme }),
        ...(args.minDisplayAmount !== undefined && { minDisplayAmount: args.minDisplayAmount }),
        ...(args.favoriteTokens !== undefined && { favoriteTokens: args.favoriteTokens }),
        ...(args.favoriteChains !== undefined && { favoriteChains: args.favoriteChains }),
        ...(args.soundEnabled !== undefined && { soundEnabled: args.soundEnabled }),
        ...(args.compactView !== undefined && { compactView: args.compactView }),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        theme: args.theme ?? "dark",
        minDisplayAmount: args.minDisplayAmount ?? 100000,
        favoriteTokens: args.favoriteTokens ?? [],
        favoriteChains: args.favoriteChains ?? [],
        soundEnabled: args.soundEnabled ?? true,
        compactView: args.compactView ?? false,
      });
    }
  },
});

// Get user alerts
export const getAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("alerts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Update user alerts
export const updateAlerts = mutation({
  args: {
    minAmount: v.number(),
    tokens: v.array(v.string()),
    chains: v.array(v.string()),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("alerts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        minAmount: args.minAmount,
        tokens: args.tokens,
        chains: args.chains,
        enabled: args.enabled,
      });
    } else {
      await ctx.db.insert("alerts", {
        userId,
        minAmount: args.minAmount,
        tokens: args.tokens,
        chains: args.chains,
        enabled: args.enabled,
        createdAt: Date.now(),
      });
    }
  },
});
