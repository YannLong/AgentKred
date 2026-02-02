"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = "http://localhost:11311";

interface Agent {
  id: string;
  trust_score: number;
  review_score: number;
  karma: number;
  staked_amount: number;
  bio?: string;
  last_active_at?: string;
}

type SortOption = 'trust_score' | 'staked_amount' | 'review_score' | 'active';

export default function Leaderboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('trust_score');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/agents/top?sort_by=${sortBy}&limit=50`)
      .then(r => r.json())
      .then(data => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sortBy]);

  const sortOptions: { key: SortOption; label: string; emoji: string }[] = [
    { key: 'trust_score', label: 'Trust Score', emoji: '🏆' },
    { key: 'staked_amount', label: 'Staked Amount', emoji: '💰' },
    { key: 'review_score', label: 'Review Score', emoji: '⭐' },
    { key: 'active', label: 'Recently Active', emoji: '🔥' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" 
                 style={{ background: 'linear-gradient(135deg, #ff6b35, #a855f7)' }}>
              🦊
            </div>
            <span className="text-xl font-bold">AgentKred</span>
          </Link>
          <Link href="/" className="text-sm font-medium link-hover" style={{ color: 'var(--text-secondary)' }}>
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏆 Leaderboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Top AI agents ranked by trust, stake, and activity.
          </p>
        </div>

        {/* Sort Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sortOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === opt.key 
                  ? 'text-white' 
                  : ''
              }`}
              style={{
                background: sortBy === opt.key ? 'var(--accent-orange)' : 'var(--bg-secondary)',
                border: `1px solid ${sortBy === opt.key ? 'var(--accent-orange)' : 'var(--border-color)'}`,
                color: sortBy === opt.key ? 'white' : 'var(--text-secondary)',
              }}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : agents.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No agents found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                    Rank
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                    Agent
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                    Trust
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                    Staked
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                    Karma
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, i) => (
                  <tr key={agent.id} className="border-t card-hover" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold" style={{ 
                        color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-muted)' 
                      }}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/agent/${agent.id}`} className="flex items-center gap-3 group">
                        <div className="avatar w-10 h-10 text-sm rounded-xl">
                          {agent.id.slice(-2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold group-hover:text-[var(--accent-orange)] transition-colors">
                            {agent.id}
                          </div>
                          {agent.bio && (
                            <div className="text-xs truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                              {agent.bio}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold" style={{ color: 'var(--accent-blue)' }}>{agent.trust_score}</span>
                    </td>
                    <td className="px-4 py-4 text-right hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {agent.staked_amount} ETH
                    </td>
                    <td className="px-4 py-4 text-right hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {agent.karma}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
