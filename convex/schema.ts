import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Whale transactions - large crypto movements
  whaleTransactions: defineTable({
    txHash: v.string(),
    fromAddress: v.string(),
    toAddress: v.string(),
    amount: v.number(),
    amountUsd: v.number(),
    token: v.string(),
    tokenSymbol: v.string(),
    chain: v.string(),
    timestamp: v.number(),
    transactionType: v.string(), // "transfer", "swap", "bridge", "stake"
    isExchange: v.boolean(),
    exchangeName: v.optional(v.string()),
  }).index("by_timestamp", ["timestamp"])
    .index("by_token", ["tokenSymbol"])
    .index("by_chain", ["chain"])
    .index("by_amount", ["amountUsd"]),

  // User's watchlist for tracking specific whales
  watchlist: defineTable({
    userId: v.id("users"),
    address: v.string(),
    label: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_address", ["address"]),

  // User alerts/notifications settings
  alerts: defineTable({
    userId: v.id("users"),
    minAmount: v.number(), // minimum USD amount to trigger
    tokens: v.array(v.string()), // which tokens to track (empty = all)
    chains: v.array(v.string()), // which chains to track (empty = all)
    enabled: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // User preferences/settings
  userSettings: defineTable({
    userId: v.id("users"),
    theme: v.string(), // "dark", "light", "system"
    minDisplayAmount: v.number(), // minimum amount to show in feed
    favoriteTokens: v.array(v.string()),
    favoriteChains: v.array(v.string()),
    soundEnabled: v.boolean(),
    compactView: v.boolean(),
  }).index("by_user", ["userId"]),
});
