import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

const AVAILABLE_TOKENS = ["ETH", "BTC", "USDC", "USDT", "SOL", "ARB", "LINK"];
const AVAILABLE_CHAINS = ["Ethereum", "Bitcoin", "Solana", "Arbitrum", "Base", "Polygon"];

export default function SettingsPanel() {
  const settings = useQuery(api.settings.get);
  const alerts = useQuery(api.settings.getAlerts);
  const updateSettings = useMutation(api.settings.update);
  const updateAlerts = useMutation(api.settings.updateAlerts);

  const [localSettings, setLocalSettings] = useState({
    minDisplayAmount: 100000,
    soundEnabled: true,
    compactView: false,
    favoriteTokens: [] as string[],
    favoriteChains: [] as string[],
  });

  const [localAlerts, setLocalAlerts] = useState({
    minAmount: 1000000,
    tokens: [] as string[],
    chains: [] as string[],
    enabled: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        minDisplayAmount: settings.minDisplayAmount,
        soundEnabled: settings.soundEnabled,
        compactView: settings.compactView,
        favoriteTokens: settings.favoriteTokens,
        favoriteChains: settings.favoriteChains,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (alerts) {
      setLocalAlerts({
        minAmount: alerts.minAmount,
        tokens: alerts.tokens,
        chains: alerts.chains,
        enabled: alerts.enabled,
      });
    }
  }, [alerts]);

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAlerts = async () => {
    await updateAlerts(localAlerts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleToken = (token: string, list: "settings" | "alerts") => {
    if (list === "settings") {
      setLocalSettings(s => ({
        ...s,
        favoriteTokens: s.favoriteTokens.includes(token)
          ? s.favoriteTokens.filter(t => t !== token)
          : [...s.favoriteTokens, token]
      }));
    } else {
      setLocalAlerts(a => ({
        ...a,
        tokens: a.tokens.includes(token)
          ? a.tokens.filter(t => t !== token)
          : [...a.tokens, token]
      }));
    }
  };

  const toggleChain = (chain: string, list: "settings" | "alerts") => {
    if (list === "settings") {
      setLocalSettings(s => ({
        ...s,
        favoriteChains: s.favoriteChains.includes(chain)
          ? s.favoriteChains.filter(c => c !== chain)
          : [...s.favoriteChains, chain]
      }));
    } else {
      setLocalAlerts(a => ({
        ...a,
        chains: a.chains.includes(chain)
          ? a.chains.filter(c => c !== chain)
          : [...a.chains, chain]
      }));
    }
  };

  if (settings === undefined) {
    return (
      <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-gray-400">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span>⚙️</span> Settings
        </h2>
        <p className="text-gray-500 text-sm mt-1">Customize your whale tracking experience</p>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="fixed top-4 right-4 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse z-50">
          <span>✓</span> Settings saved!
        </div>
      )}

      {/* Display Settings */}
      <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
          <span>🖥️</span> Display Settings
        </h3>

        <div className="space-y-6">
          {/* Minimum Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Minimum Display Amount
            </label>
            <select
              value={localSettings.minDisplayAmount}
              onChange={(e) => setLocalSettings(s => ({ ...s, minDisplayAmount: Number(e.target.value) }))}
              className="w-full sm:w-auto bg-[#0a0b0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value={50000}>$50,000+</option>
              <option value={100000}>$100,000+</option>
              <option value={500000}>$500,000+</option>
              <option value={1000000}>$1,000,000+</option>
              <option value={5000000}>$5,000,000+</option>
              <option value={10000000}>$10,000,000+</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-12 h-6 rounded-full transition-all ${localSettings.soundEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">Sound Alerts</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-12 h-6 rounded-full transition-all ${localSettings.compactView ? 'bg-cyan-500' : 'bg-white/10'}`}
                onClick={() => setLocalSettings(s => ({ ...s, compactView: !s.compactView }))}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${localSettings.compactView ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">Compact View</span>
            </label>
          </div>

          {/* Favorite Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Favorite Tokens
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOKENS.map((token) => (
                <button
                  key={token}
                  onClick={() => toggleToken(token, "settings")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    localSettings.favoriteTokens.includes(token)
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Chains */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Favorite Chains
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CHAINS.map((chain) => (
                <button
                  key={chain}
                  onClick={() => toggleChain(chain, "settings")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    localSettings.favoriteChains.includes(chain)
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/25"
          >
            Save Display Settings
          </button>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <span>🔔</span> Alert Settings
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-12 h-6 rounded-full transition-all ${localAlerts.enabled ? 'bg-green-500' : 'bg-white/10'}`}
              onClick={() => setLocalAlerts(a => ({ ...a, enabled: !a.enabled }))}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${localAlerts.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-gray-300 text-sm">{localAlerts.enabled ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        <div className={`space-y-6 ${!localAlerts.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Alert Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Alert Threshold (minimum amount)
            </label>
            <select
              value={localAlerts.minAmount}
              onChange={(e) => setLocalAlerts(a => ({ ...a, minAmount: Number(e.target.value) }))}
              className="w-full sm:w-auto bg-[#0a0b0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value={500000}>$500,000+</option>
              <option value={1000000}>$1,000,000+</option>
              <option value={5000000}>$5,000,000+</option>
              <option value={10000000}>$10,000,000+</option>
              <option value={50000000}>$50,000,000+</option>
            </select>
          </div>

          {/* Alert Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Alert for Tokens (empty = all)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOKENS.map((token) => (
                <button
                  key={token}
                  onClick={() => toggleToken(token, "alerts")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    localAlerts.tokens.includes(token)
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Chains */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Alert for Chains (empty = all)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CHAINS.map((chain) => (
                <button
                  key={chain}
                  onClick={() => toggleChain(chain, "alerts")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    localAlerts.chains.includes(chain)
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveAlerts}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/25"
          >
            Save Alert Settings
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <span>ℹ️</span> About WhaleDash
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          WhaleDash tracks large cryptocurrency transactions ("whale movements") across multiple blockchains in real-time.
          Monitor significant transfers, identify smart money movements, and stay ahead of market trends.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span>Powered by Convex</span>
          <span>•</span>
          <span>Real-time Updates</span>
        </div>
      </div>
    </div>
  );
}
