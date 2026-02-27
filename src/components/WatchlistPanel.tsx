import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface WatchlistItem {
  _id: Id<"watchlist">;
  userId: Id<"users">;
  address: string;
  label: string;
  notes?: string;
  createdAt: number;
}

export default function WatchlistPanel() {
  const watchlist = useQuery(api.watchlist.get);
  const addToWatchlist = useMutation(api.watchlist.add);
  const removeFromWatchlist = useMutation(api.watchlist.remove);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newAddress.trim() || !newLabel.trim()) {
      setError("Address and label are required");
      return;
    }

    try {
      await addToWatchlist({
        address: newAddress.trim(),
        label: newLabel.trim(),
        notes: newNotes.trim() || undefined,
      });
      setNewAddress("");
      setNewLabel("");
      setNewNotes("");
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to add address");
    }
  };

  const handleRemove = async (id: Id<"watchlist">) => {
    if (confirm("Remove this address from your watchlist?")) {
      await removeFromWatchlist({ id });
    }
  };

  if (watchlist === undefined) {
    return (
      <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-gray-400">Loading watchlist...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>⭐</span> Your Watchlist
          </h2>
          <p className="text-gray-500 text-sm mt-1">Track specific whale addresses</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl transition-all font-medium"
        >
          <span>{showAddForm ? "✕" : "+"}</span>
          {showAddForm ? "Cancel" : "Add Address"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-[#12131a]/60 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Add New Address</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 tracking-wider">
                WALLET ADDRESS
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 tracking-wider">
                LABEL
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Giant Whale, Smart Money..."
                className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 tracking-wider">
                NOTES (OPTIONAL)
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/25"
            >
              Add to Watchlist
            </button>
          </form>
        </div>
      )}

      {/* Watchlist Items */}
      {watchlist.length === 0 ? (
        <div className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-white font-semibold text-lg mb-2">Your Watchlist is Empty</h3>
          <p className="text-gray-400 text-sm mb-4">Add whale addresses to track their activity</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl transition-all font-medium"
          >
            <span>+</span> Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {watchlist.map((item: WatchlistItem) => (
            <div
              key={item._id}
              className="bg-[#12131a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4 md:p-6 hover:border-cyan-500/20 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {item.label.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{item.label}</h3>
                      <code className="text-cyan-400/70 text-xs font-mono break-all">
                        {item.address}
                      </code>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-gray-400 text-sm mt-2 pl-[52px]">{item.notes}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-2 pl-[52px]">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                  title="Remove from watchlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
