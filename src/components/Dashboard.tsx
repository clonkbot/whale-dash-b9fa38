import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import TransactionFeed from "./TransactionFeed";
import StatsPanel from "./StatsPanel";
import SettingsPanel from "./SettingsPanel";
import WatchlistPanel from "./WatchlistPanel";

type Tab = "feed" | "watchlist" | "settings";

export default function Dashboard() {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [filters, setFilters] = useState({
    minAmount: 100000,
    token: "all",
    chain: "all",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const settings = useQuery(api.settings.get);
  const seedTransactions = useMutation(api.whales.seedTransactions);

  // Seed data on first load if needed
  useEffect(() => {
    const hasSeeded = localStorage.getItem("whale-dash-seeded");
    if (!hasSeeded) {
      seedTransactions().then(() => {
        localStorage.setItem("whale-dash-seeded", "true");
      });
    }
  }, [seedTransactions]);

  // Update filters from settings
  useEffect(() => {
    if (settings?.minDisplayAmount) {
      setFilters(f => ({ ...f, minAmount: settings.minDisplayAmount }));
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col">
      {/* Subtle background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-cyan-500/3 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-purple-500/3 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0b0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl md:text-4xl">🐋</span>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">WHALE</span>
                  <span className="text-white/90">DASH</span>
                </h1>
                <p className="text-[10px] text-gray-500 font-mono tracking-wider hidden sm:block">LIVE TRACKER</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {[
                { id: "feed" as Tab, label: "Live Feed", icon: "📡" },
                { id: "watchlist" as Tab, label: "Watchlist", icon: "⭐" },
                { id: "settings" as Tab, label: "Settings", icon: "⚙️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut()}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm"
              >
                <span>🚪</span>
                <span className="hidden lg:inline">Sign Out</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 pb-2 border-t border-white/5 pt-3 flex flex-col gap-1">
              {[
                { id: "feed" as Tab, label: "Live Feed", icon: "📡" },
                { id: "watchlist" as Tab, label: "Watchlist", icon: "⭐" },
                { id: "settings" as Tab, label: "Settings", icon: "⚙️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => signOut()}
                className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm flex items-center gap-3"
              >
                <span className="text-lg">🚪</span>
                Sign Out
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === "feed" && (
          <div className="space-y-6">
            <StatsPanel />

            {/* Filters */}
            <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-gray-400 text-sm font-medium">Filters:</span>

                <select
                  value={filters.minAmount}
                  onChange={(e) => setFilters(f => ({ ...f, minAmount: Number(e.target.value) }))}
                  className="bg-[#0a0b0f] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value={50000}>$50K+</option>
                  <option value={100000}>$100K+</option>
                  <option value={500000}>$500K+</option>
                  <option value={1000000}>$1M+</option>
                  <option value={5000000}>$5M+</option>
                  <option value={10000000}>$10M+</option>
                </select>

                <select
                  value={filters.token}
                  onChange={(e) => setFilters(f => ({ ...f, token: e.target.value }))}
                  className="bg-[#0a0b0f] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="all">All Tokens</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="SOL">SOL</option>
                </select>

                <select
                  value={filters.chain}
                  onChange={(e) => setFilters(f => ({ ...f, chain: e.target.value }))}
                  className="bg-[#0a0b0f] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="all">All Chains</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Bitcoin">Bitcoin</option>
                  <option value="Solana">Solana</option>
                  <option value="Arbitrum">Arbitrum</option>
                  <option value="Base">Base</option>
                  <option value="Polygon">Polygon</option>
                </select>
              </div>
            </div>

            <TransactionFeed filters={filters} />
          </div>
        )}

        {activeTab === "watchlist" && <WatchlistPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center border-t border-white/5">
        <p className="text-gray-600 text-xs font-mono">
          Requested by <span className="text-gray-500">@modzzdude</span> · Built by <span className="text-gray-500">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
