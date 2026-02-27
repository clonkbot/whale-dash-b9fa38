import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

export default function StatsPanel() {
  const stats = useQuery(api.whales.getStats);

  if (stats === undefined) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4 md:p-6 animate-pulse">
            <div className="h-3 bg-white/5 rounded w-20 mb-3" />
            <div className="h-8 bg-white/5 rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: "24h Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: "📊",
      color: "cyan",
    },
    {
      label: "24h Volume",
      value: formatAmount(stats.totalVolume),
      icon: "💰",
      color: "green",
    },
    {
      label: "Avg Transaction",
      value: formatAmount(stats.avgAmount),
      icon: "📈",
      color: "purple",
    },
    {
      label: "Largest TX",
      value: stats.largestTx ? formatAmount(stats.largestTx.amountUsd) : "$0",
      icon: "🐋",
      color: "yellow",
      subtext: stats.largestTx?.tokenSymbol,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={`bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4 md:p-6 hover:border-${stat.color}-500/20 transition-all group`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-gray-500 text-xs md:text-sm font-medium tracking-wide uppercase">{stat.label}</span>
            </div>
            <div className={`text-xl md:text-2xl lg:text-3xl font-bold text-${stat.color === "cyan" ? "cyan-400" : stat.color === "green" ? "green-400" : stat.color === "purple" ? "purple-400" : "yellow-400"}`}>
              {stat.value}
            </div>
            {stat.subtext && (
              <div className="text-gray-500 text-xs mt-1">{stat.subtext}</div>
            )}
          </div>
        ))}
      </div>

      {/* Token & Chain Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Tokens */}
        <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4 md:p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>🪙</span> Top Tokens by Volume
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.tokenVolumes as Record<string, number>)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([token, volume]) => {
                const maxVolume = Math.max(...Object.values(stats.tokenVolumes as Record<string, number>));
                const percentage = ((volume as number) / maxVolume) * 100;

                return (
                  <div key={token} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">{token}</span>
                      <span className="text-gray-400">{formatAmount(volume as number)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Chain Activity */}
        <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4 md:p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>⛓️</span> Chain Activity
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.chainCounts as Record<string, number>)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([chain, count]) => {
                const maxCount = Math.max(...Object.values(stats.chainCounts as Record<string, number>));
                const percentage = ((count as number) / maxCount) * 100;

                const chainColors: Record<string, string> = {
                  Ethereum: "from-blue-500 to-purple-500",
                  Bitcoin: "from-orange-500 to-yellow-500",
                  Solana: "from-purple-500 to-pink-500",
                  Arbitrum: "from-blue-600 to-indigo-500",
                  Base: "from-blue-400 to-cyan-500",
                  Polygon: "from-purple-600 to-violet-500",
                };

                return (
                  <div key={chain} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">{chain}</span>
                      <span className="text-gray-400">{count as number} txs</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${chainColors[chain] || "from-gray-500 to-gray-400"} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
