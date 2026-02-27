import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get recent whale transactions with optional filters
export const getTransactions = query({
  args: {
    limit: v.optional(v.number()),
    minAmount: v.optional(v.number()),
    token: v.optional(v.string()),
    chain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const minAmount = args.minAmount ?? 100000;

    let transactions = await ctx.db
      .query("whaleTransactions")
      .withIndex("by_timestamp")
      .order("desc")
      .take(500);

    // Filter by minimum amount
    transactions = transactions.filter(tx => tx.amountUsd >= minAmount);

    // Filter by token if specified
    if (args.token && args.token !== "all") {
      transactions = transactions.filter(tx => tx.tokenSymbol === args.token);
    }

    // Filter by chain if specified
    if (args.chain && args.chain !== "all") {
      transactions = transactions.filter(tx => tx.chain === args.chain);
    }

    return transactions.slice(0, limit);
  },
});

// Get transaction stats for dashboard
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const recentTxs = await ctx.db
      .query("whaleTransactions")
      .withIndex("by_timestamp")
      .order("desc")
      .take(1000);

    const last24h = recentTxs.filter(tx => tx.timestamp > oneDayAgo);

    const totalVolume = last24h.reduce((sum, tx) => sum + tx.amountUsd, 0);
    const avgAmount = last24h.length > 0 ? totalVolume / last24h.length : 0;
    const largestTx = last24h.reduce((max, tx) => tx.amountUsd > max.amountUsd ? tx : max, last24h[0] || { amountUsd: 0 });

    // Count by chain
    const chainCounts: Record<string, number> = {};
    last24h.forEach(tx => {
      chainCounts[tx.chain] = (chainCounts[tx.chain] || 0) + 1;
    });

    // Count by token
    const tokenVolumes: Record<string, number> = {};
    last24h.forEach(tx => {
      tokenVolumes[tx.tokenSymbol] = (tokenVolumes[tx.tokenSymbol] || 0) + tx.amountUsd;
    });

    return {
      totalTransactions: last24h.length,
      totalVolume,
      avgAmount,
      largestTx,
      chainCounts,
      tokenVolumes,
    };
  },
});

// Seed some sample whale transactions
export const seedTransactions = mutation({
  args: {},
  handler: async (ctx) => {
    const tokens = [
      { token: "Ethereum", symbol: "ETH" },
      { token: "Bitcoin", symbol: "BTC" },
      { token: "USD Coin", symbol: "USDC" },
      { token: "Tether", symbol: "USDT" },
      { token: "Solana", symbol: "SOL" },
      { token: "Arbitrum", symbol: "ARB" },
      { token: "Chainlink", symbol: "LINK" },
    ];

    const chains = ["Ethereum", "Bitcoin", "Solana", "Arbitrum", "Polygon", "Base"];
    const exchanges = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit", null];
    const txTypes = ["transfer", "swap", "bridge", "stake"];

    const generateAddress = () => "0x" + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)).join("");

    const now = Date.now();

    for (let i = 0; i < 100; i++) {
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const chain = chains[Math.floor(Math.random() * chains.length)];
      const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
      const isExchange = exchange !== null;

      const amount = Math.random() * 10000 + 100;
      const priceMultiplier = token.symbol === "BTC" ? 67000 :
                              token.symbol === "ETH" ? 3500 :
                              token.symbol === "SOL" ? 180 : 1;

      await ctx.db.insert("whaleTransactions", {
        txHash: "0x" + Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)).join(""),
        fromAddress: generateAddress(),
        toAddress: generateAddress(),
        amount,
        amountUsd: amount * priceMultiplier,
        token: token.token,
        tokenSymbol: token.symbol,
        chain,
        timestamp: now - Math.floor(Math.random() * 24 * 60 * 60 * 1000),
        transactionType: txTypes[Math.floor(Math.random() * txTypes.length)],
        isExchange,
        exchangeName: exchange ?? undefined,
      });
    }
  },
});

// Add a new simulated transaction (for real-time demo)
export const addSimulatedTransaction = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tokens = [
      { token: "Ethereum", symbol: "ETH", price: 3500 },
      { token: "Bitcoin", symbol: "BTC", price: 67000 },
      { token: "USD Coin", symbol: "USDC", price: 1 },
      { token: "Tether", symbol: "USDT", price: 1 },
      { token: "Solana", symbol: "SOL", price: 180 },
    ];

    const chains = ["Ethereum", "Bitcoin", "Solana", "Arbitrum", "Base"];
    const exchanges = ["Binance", "Coinbase", "Kraken", null];
    const txTypes = ["transfer", "swap", "bridge"];

    const generateAddress = () => "0x" + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)).join("");

    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];

    const amount = Math.random() * 5000 + 500;

    await ctx.db.insert("whaleTransactions", {
      txHash: "0x" + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)).join(""),
      fromAddress: generateAddress(),
      toAddress: generateAddress(),
      amount,
      amountUsd: amount * token.price,
      token: token.token,
      tokenSymbol: token.symbol,
      chain,
      timestamp: Date.now(),
      transactionType: txTypes[Math.floor(Math.random() * txTypes.length)],
      isExchange: exchange !== null,
      exchangeName: exchange ?? undefined,
    });
  },
});
