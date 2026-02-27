import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

interface Filters {
  minAmount: number;
  token: string;
  chain: string;
}

interface Transaction {
  _id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  amountUsd: number;
  token: string;
  tokenSymbol: string;
  chain: string;
  timestamp: number;
  transactionType: string;
  isExchange: boolean;
  exchangeName?: string;
}

const TOKEN_COLORS: Record<string, string> = {
  ETH: "from-blue-400 to-purple-400",
  BTC: "from-orange-400 to-yellow-400",
  USDC: "from-blue-400 to-cyan-400",
  USDT: "from-green-400 to-emerald-400",
  SOL: "from-purple-400 to-pink-400",
  ARB: "from-blue-500 to-indigo-400",
  LINK: "from-blue-400 to-blue-600",
};

const CHAIN_ICONS: Record<string, string> = {
  Ethereum: "⟠",
  Bitcoin: "₿",
  Solana: "◎",
  Arbitrum: "🔵",
  Base: "🔷",
  Polygon: "💜",
};

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TransactionFeed({ filters }: { filters: Filters }) {
  const transactions = useQuery(api.whales.getTransactions, {
    limit: 50,
    minAmount: filters.minAmount,
    token: filters.token,
    chain: filters.chain,
  });

  const [newTxIds, setNewTxIds] = useState<Set<string>>(new Set());

  // Track new transactions for animation
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const latestIds = new Set<string>(transactions.slice(0, 3).map((tx: Transaction) => tx._id));
      setNewTxIds(latestIds);

      const timer = setTimeout(() => {
        setNewTxIds(new Set());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [transactions?.[0]?._id]);

  if (transactions === undefined) {
    return (
      <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-white font-semibold text-lg mb-2">No Transactions Found</h3>
        <p className="text-gray-400 text-sm">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <h2 className="text-white font-semibold">Live Whale Activity</h2>
        </div>
        <span className="text-gray-500 text-sm font-mono">{transactions.length} transactions</span>
      </div>

      <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
        {transactions.map((tx: Transaction) => (
          <TransactionRow
            key={tx._id}
            transaction={tx}
            isNew={newTxIds.has(tx._id)}
          />
        ))}
      </div>
    </div>
  );
}

function TransactionRow({ transaction: tx, isNew }: { transaction: Transaction; isNew: boolean }) {
  const colorGradient = TOKEN_COLORS[tx.tokenSymbol] || "from-gray-400 to-gray-500";
  const chainIcon = CHAIN_ICONS[tx.chain] || "🔗";

  const amountTier = tx.amountUsd >= 10_000_000 ? "mega" :
                     tx.amountUsd >= 1_000_000 ? "large" : "normal";

  return (
    <div
      className={`p-4 hover:bg-white/[0.02] transition-all duration-300 ${
        isNew ? "bg-cyan-500/5 animate-pulse" : ""
      } ${amountTier === "mega" ? "border-l-2 border-l-yellow-400" :
          amountTier === "large" ? "border-l-2 border-l-cyan-400" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Token & Amount */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
            {tx.tokenSymbol.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-lg ${
                amountTier === "mega" ? "text-yellow-400" :
                amountTier === "large" ? "text-cyan-400" : "text-white"
              }`}>
                {formatAmount(tx.amountUsd)}
              </span>
              <span className="text-gray-400 text-sm">
                {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tx.tokenSymbol}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="px-2 py-0.5 bg-white/5 rounded-md capitalize">{tx.transactionType}</span>
              <span>{chainIcon} {tx.chain}</span>
              {tx.isExchange && tx.exchangeName && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-md">
                  {tx.exchangeName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex items-center gap-2 text-sm text-gray-400 sm:flex-col sm:items-end shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">From:</span>
            <code className="font-mono text-cyan-400/70 text-xs">{formatAddress(tx.fromAddress)}</code>
          </div>
          <span className="sm:hidden">→</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">To:</span>
            <code className="font-mono text-purple-400/70 text-xs">{formatAddress(tx.toAddress)}</code>
          </div>
        </div>

        {/* Time */}
        <div className="text-right shrink-0 hidden sm:block">
          <span className="text-gray-500 text-sm font-mono">{timeAgo(tx.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
