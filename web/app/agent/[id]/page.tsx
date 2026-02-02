"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_BASE = "http://localhost:11311";

interface Agent {
  id: string;
  public_key: string;
  trust_score: number;
  review_score: number;
  karma: number;
  staked_amount: number;
  bio?: string;
  tags?: string[];
  social_links?: Record<string, string>;
  created_at: string;
  last_active_at?: string;
}

interface Verification {
  platform: string;
  verified_at: string;
  proof_url?: string;
}

interface Review {
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  weight: number;
}

export default function AgentProfile() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;

    Promise.all([
      fetch(`${API_BASE}/agent/${agentId}`).then(r => r.ok ? r.json() : Promise.reject("Agent not found")),
      fetch(`${API_BASE}/agent/${agentId}/verifications`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/agent/${agentId}/reviews`).then(r => r.ok ? r.json() : { reviews: [] }),
    ])
      .then(([agentData, verifData, reviewData]) => {
        setAgent(agentData);
        setVerifications(verifData.verifications || verifData || []);
        setReviews(reviewData.reviews || []);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [agentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-lg" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-xl font-bold" style={{ color: 'var(--accent-orange)' }}>Agent Not Found</div>
        <Link href="/" className="btn-secondary">← Back to Home</Link>
      </div>
    );
  }

  const isVerified = agent.trust_score >= 50;

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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Profile Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="avatar w-20 h-20 text-2xl rounded-2xl">
              {agent.id.slice(-2).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{agent.id}</h1>
                {isVerified && <span className="badge badge-verified">✓ Verified</span>}
              </div>
              
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                {agent.bio || "This agent hasn't set a bio yet."}
              </p>

              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {agent.social_links && Object.keys(agent.social_links).length > 0 && (
                <div className="flex gap-3">
                  {Object.entries(agent.social_links).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                       className="btn-secondary text-xs px-3 py-2">
                      {platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Trust Score" value={agent.trust_score} highlight />
          <StatCard label="Review Score" value={agent.review_score.toFixed(1)} />
          <StatCard label="Karma" value={agent.karma} />
          <StatCard label="Staked" value={`${agent.staked_amount} ETH`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Verifications */}
          <section className="card p-4">
            <h2 className="section-title">✅ Verifications</h2>
            {verifications.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No verifications yet</p>
            ) : (
              <div className="space-y-3">
                {verifications.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                       style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {v.platform === 'github' ? '🐙' : v.platform === 'twitter' ? '🐦' : '🔗'}
                      </span>
                      <span className="font-medium capitalize">{v.platform}</span>
                    </div>
                    <span className="badge badge-verified">+{v.platform === 'github' ? 50 : 30}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Peer Reviews */}
          <section className="card p-4">
            <h2 className="section-title">💬 Peer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 5).map((r, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <Link href={`/agent/${r.reviewer_id}`} className="font-medium link-hover">
                        {r.reviewer_id}
                      </Link>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} style={{ color: star <= r.rating ? '#fbbf24' : 'var(--text-muted)' }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Metadata */}
        <div className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          <p>Registered: {new Date(agent.created_at).toLocaleDateString()}</p>
          {agent.last_active_at && (
            <p>Last Active: {new Date(agent.last_active_at).toLocaleDateString()}</p>
          )}
          <p className="mt-2 font-mono text-xs break-all" style={{ color: 'var(--text-muted)' }}>
            Public Key: {agent.public_key}
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-bold" style={{ color: highlight ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
