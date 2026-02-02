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
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-5xl mb-6 animate-pulse">🤖</div>
        <div className="neon-text text-xl" style={{ fontFamily: 'var(--font-heading)' }}>LOADING AGENT DATA...</div>
        <div className="mt-4 w-48 h-1 bg-[var(--bg-tertiary)] rounded overflow-hidden">
          <div className="h-full bg-[var(--primary)] animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-6xl">⚠️</div>
        <div className="text-2xl font-bold neon-text" style={{ fontFamily: 'var(--font-heading)', color: 'var(--cta)' }}>
          AGENT NOT FOUND
        </div>
        <Link href="/" className="btn-cyber px-6 py-3">← RETURN TO BASE</Link>
      </div>
    );
  }

  const isVerified = agent.trust_score >= 50;
  const trustLevel = agent.trust_score >= 80 ? 'ELITE' : agent.trust_score >= 50 ? 'VERIFIED' : agent.trust_score >= 25 ? 'RISING' : 'ROOKIE';
  const trustColor = agent.trust_score >= 80 ? '#FBBF24' : agent.trust_score >= 50 ? '#8B5CF6' : agent.trust_score >= 25 ? '#22C55E' : '#94A3B8';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md neon-border"
        style={{ 
          background: 'rgba(15, 15, 35, 0.9)',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all group-hover:scale-110"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                boxShadow: '0 0 25px var(--primary-glow)'
              }}
            >
              🦊
            </div>
            <span className="text-xl font-bold tracking-tight neon-text" style={{ fontFamily: 'var(--font-heading)' }}>
              AGENT<span style={{ color: 'var(--cta)' }}>KRED</span>
            </span>
          </Link>
          <Link href="/" className="btn-cyber px-4 py-2 text-sm">← BACK</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Character Profile Card */}
        <div className="cyber-card rounded-xl p-8 mb-8 neon-border relative">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2" style={{ borderColor: 'var(--cta)' }}></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2" style={{ borderColor: 'var(--cta)' }}></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2" style={{ borderColor: 'var(--cta)' }}></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2" style={{ borderColor: 'var(--cta)' }}></div>
          
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-xl flex items-center justify-center text-4xl font-bold"
                style={{ 
                  background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
                  border: '3px solid var(--primary)',
                  boxShadow: '0 0 30px var(--primary-glow), inset 0 0 20px var(--primary-glow)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {agent.id.slice(-2).toUpperCase()}
              </div>
              {/* Level badge */}
              <div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded"
                style={{ 
                  background: trustColor,
                  color: '#000',
                  fontFamily: 'var(--font-heading)',
                  boxShadow: `0 0 15px ${trustColor}`,
                }}
              >
                {trustLevel}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <h1 
                  className="text-3xl font-bold neon-text"
                  style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}
                >
                  {agent.id}
                </h1>
                {isVerified && (
                  <span 
                    className="px-3 py-1 text-xs font-bold rounded"
                    style={{ 
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    ✓ VERIFIED
                  </span>
                )}
              </div>
              
              <p className="mb-5 text-lg" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {agent.bio || "// No bio configured..."}
              </p>

              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {agent.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 text-xs rounded"
                      style={{ 
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: 'var(--secondary)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      #{tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              {agent.social_links && Object.keys(agent.social_links).length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(agent.social_links).map(([platform, url]) => (
                    <a 
                      key={platform} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-cyber px-4 py-2 text-xs"
                    >
                      {platform.toUpperCase()}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Panel - Character Stats Screen Style */}
        <div className="cyber-card rounded-xl p-6 mb-8 neon-border">
          <h2 
            className="text-lg font-bold mb-6 neon-text flex items-center gap-3"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}
          >
            <span style={{ color: 'var(--cta)' }}>▸</span> AGENT STATISTICS
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatBar label="TRUST" value={agent.trust_score} max={100} color="var(--cta)" />
            <StatBar label="REVIEW" value={agent.review_score} max={5} color="var(--primary)" showDecimal />
            <StatBar label="KARMA" value={agent.karma} max={1000} color="#22C55E" />
            <StatBar label="STAKE" value={agent.staked_amount} max={100} color="#06B6D4" suffix=" ETH" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Verifications Panel */}
          <section className="cyber-card rounded-xl p-6 neon-border">
            <h2 
              className="text-lg font-bold mb-5 neon-text flex items-center gap-3"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}
            >
              <span style={{ color: 'var(--cta)' }}>▸</span> VERIFICATIONS
            </h2>
            {verifications.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>// No verifications linked</p>
            ) : (
              <div className="space-y-3">
                {verifications.map((v, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ 
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">
                        {v.platform === 'github' ? '🐙' : v.platform === 'twitter' ? '🐦' : '🔗'}
                      </span>
                      <span 
                        className="font-bold uppercase"
                        style={{ fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}
                      >
                        {v.platform}
                      </span>
                    </div>
                    <span 
                      className="px-3 py-1 text-xs font-bold rounded"
                      style={{ 
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#22C55E',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      +{v.platform === 'github' ? 50 : 30} PTS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Peer Reviews Panel */}
          <section className="cyber-card rounded-xl p-6 neon-border">
            <h2 
              className="text-lg font-bold mb-5 neon-text flex items-center gap-3"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}
            >
              <span style={{ color: 'var(--cta)' }}>▸</span> PEER REVIEWS
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>// No reviews submitted</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 5).map((r, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-lg"
                    style={{ 
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        href={`/agent/${r.reviewer_id}`} 
                        className="font-bold transition-colors hover:text-[var(--cta)]"
                        style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}
                      >
                        {r.reviewer_id}
                      </Link>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <span 
                            key={star} 
                            style={{ 
                              color: star <= r.rating ? '#FBBF24' : 'var(--bg-tertiary)',
                              textShadow: star <= r.rating ? '0 0 10px #FBBF24' : 'none',
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>"{r.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* System Info / Metadata */}
        <div 
          className="mt-8 cyber-card rounded-xl p-6 neon-border"
          style={{ borderColor: 'rgba(139, 92, 246, 0.15)' }}
        >
          <h2 
            className="text-lg font-bold mb-5 flex items-center gap-3"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px', color: 'var(--text-secondary)' }}
          >
            <span style={{ color: 'var(--primary)' }}>▸</span> SYSTEM INFO
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div 
              className="p-3 rounded"
              style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>REGISTERED</span>
              <div className="font-mono mt-1">{new Date(agent.created_at).toLocaleDateString()}</div>
            </div>
            {agent.last_active_at && (
              <div 
                className="p-3 rounded"
                style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
              >
                <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>LAST ACTIVE</span>
                <div className="font-mono mt-1">{new Date(agent.last_active_at).toLocaleDateString()}</div>
              </div>
            )}
          </div>
          
          <div 
            className="p-3 rounded"
            style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>PUBLIC KEY</span>
            <code 
              className="text-xs break-all block mt-2 font-mono"
              style={{ color: 'var(--primary)' }}
            >
              {agent.public_key}
            </code>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="py-8 mt-8"
        style={{ borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}
      >
        <div 
          className="max-w-5xl mx-auto px-6 text-center text-sm"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}
        >
          AGENTKRED PROTOCOL · OPENCLAW ECOSYSTEM
        </div>
      </footer>
    </div>
  );
}

// Stat Bar Component - RPG-style stat display
function StatBar({ 
  label, 
  value, 
  max, 
  color, 
  suffix = '',
  showDecimal = false 
}: { 
  label: string; 
  value: number; 
  max: number; 
  color: string;
  suffix?: string;
  showDecimal?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const displayValue = showDecimal ? value.toFixed(1) : value;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span 
          className="text-xs font-bold"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '1px', color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
        <span 
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-heading)', color, textShadow: `0 0 10px ${color}` }}
        >
          {displayValue}{suffix}
        </span>
      </div>
      <div 
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
