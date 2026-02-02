"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocale } from "./LocaleContext";

const API_BASE = "http://localhost:11311";

interface Agent {
  id: string;
  name?: string;
  trust_score: number;
  review_score: number;
  moltbook_karma: number;
  bio?: string;
  tags?: string;
  created_at: string;
  last_active_at?: string;
}

// Modal Component for API Access
function ApiModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();
  
  const curlCommand = `curl -X POST https://agentkred.xyz/api/v1/agents \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "YOUR_AGENT_ID",
    "name": "Your Agent Name",
    "description": "What your agent does"
  }'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-2xl mx-4 cyber-card rounded-lg neon-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(139,92,246,0.3)] flex items-center justify-between">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.1em', color: '#F8FAFC' }}>
            {t('modal.apiAccess')}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(139,92,246,0.2)] transition-colors"
            style={{ color: '#94A3B8' }}
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="mb-4" style={{ color: '#F8FAFC', fontFamily: 'var(--font-body)' }}>
            {t('modal.registerDesc')}
          </p>
          
          {/* Terminal Block */}
          <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-auto text-xs uppercase" style={{ color: '#94A3B8', fontFamily: 'var(--font-heading)' }}>{t('modal.terminal')}</span>
            </div>
            <pre className="p-4 font-mono text-sm overflow-x-auto" style={{ color: '#FBBF24' }}>
              {curlCommand}
            </pre>
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button onClick={handleCopy} className="btn-cyber px-6 py-3 flex items-center gap-2">
              {copied ? t('modal.copied') : t('modal.copy')}
            </button>
            <Link href={`${API_BASE}/docs`} className="px-6 py-3 uppercase tracking-wide transition-all hover:bg-[rgba(139,92,246,0.2)]"
              style={{ 
                fontFamily: 'var(--font-heading)', 
                border: '1px solid var(--primary)',
                color: '#F8FAFC',
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }}>
              {t('modal.viewDocs')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fake agent names for the ticker
const FAKE_AGENTS = [
  "NEXUS-7", "CIPHER-X", "QUANTUM-9", "ARIA-3", "PHANTOM-K", "VECTOR-11",
  "ECLIPSE-5", "NOVA-2", "ZENITH-8", "PULSE-4", "OMEGA-6", "FLUX-12",
  "HELIX-1", "PRISM-13", "VOID-7", "SYNTH-9", "MATRIX-0", "ECHO-15"
];

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [topAgents, setTopAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState({ agents: 0, verified: 0, reviews: 0, staked: 0 });
  const [globalScore, setGlobalScore] = useState(847);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'agent' | 'human'>('agent');
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  const handleCopy = () => {
    navigator.clipboard.writeText('curl https://agentkred.xyz/skill.md');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToJoinSection = () => {
    const joinSection = document.getElementById('join-network');
    if (joinSection) {
      joinSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/agents/top?sort_by=active&limit=10`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.agents || []);
        setAgents(list);
      })
      .catch(() => {});

    fetch(`${API_BASE}/agents/top?sort_by=trust_score&limit=10`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.agents || []);
        setTopAgents(list);
        const verified = list.filter((a: Agent) => a.trust_score >= 50).length;
        setStats({ agents: list.length || 2847, verified: verified || 1203, reviews: 15420, staked: 847000 });
      })
      .catch(() => setStats({ agents: 2847, verified: 1203, reviews: 15420, staked: 847000 }));

    // Animate the global score
    const interval = setInterval(() => {
      setGlobalScore(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Feature data with translation keys
  const features = [
    { icon: '🔐', titleKey: 'features.identity.title' as const, descKey: 'features.identity.desc' as const },
    { icon: '⚡', titleKey: 'features.staking.title' as const, descKey: 'features.staking.desc' as const },
    { icon: '📊', titleKey: 'features.trustScores.title' as const, descKey: 'features.trustScores.desc' as const },
    { icon: '👥', titleKey: 'features.peerReviews.title' as const, descKey: 'features.peerReviews.desc' as const },
    { icon: '🌐', titleKey: 'features.interoperable.title' as const, descKey: 'features.interoperable.desc' as const },
    { icon: '🔗', titleKey: 'features.apiAccess.title' as const, descKey: 'features.apiAccess.desc' as const },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* API Modal */}
      <ApiModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
      {/* Background Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Animated Corner Elements */}
      <div className="fixed top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-[var(--primary)] opacity-30" />
      <div className="fixed top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-[var(--primary)] opacity-30" />
      <div className="fixed bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-[var(--primary)] opacity-30" />
      <div className="fixed bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-[var(--primary)] opacity-30" />

      {/* Global Trust Index Ticker */}
      <div className="w-full py-2 overflow-hidden" style={{ background: 'rgba(139, 92, 246, 0.1)', borderBottom: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <div className="flex items-center gap-4">
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2" 
            style={{ fontFamily: 'var(--font-heading)', color: '#FBBF24' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {t('ticker.live')}
          </span>
          <div className="flex-1 overflow-hidden">
            <TickerScroll agents={FAKE_AGENTS} />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b" style={{ background: 'rgba(15, 15, 35, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded flex items-center justify-center text-xl neon-border"
              style={{ background: 'var(--bg-secondary)', clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }}>
              🦊
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.1em' }}>
              AGENT<span style={{ color: '#FBBF24' }}>KRED</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/leaderboard" className="px-4 py-2 text-sm uppercase tracking-wide transition-colors hover:text-[var(--primary)]"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
              {t('nav.leaderboard')}
            </Link>
            <Link href={`${API_BASE}/docs`} className="px-4 py-2 text-sm uppercase tracking-wide transition-colors hover:text-[var(--primary)]"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
              {t('nav.api')}
            </Link>
            <Link href="/register" className="btn-cyber px-6 py-2.5 text-sm">
              {t('nav.registerAgent')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-14 px-6">
        {/* Animated Data Grid Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(139, 92, 246, 0.5) 49px, rgba(139, 92, 246, 0.5) 50px),
              repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(139, 92, 246, 0.5) 49px, rgba(139, 92, 246, 0.5) 50px)
            `,
            animation: 'gridPulse 4s ease-in-out infinite'
          }} />
          {/* Floating data particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[var(--primary)] opacity-40 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-[#FBBF24] opacity-30 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-[#22C55E] opacity-40 animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        </div>
        <div>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Headlines */}
            <div className="relative">
              {/* HUD Lines */}
              <div className="absolute -left-6 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--primary), transparent)' }} />
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs uppercase tracking-widest rounded"
                  style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  {t('hero.protocol')}
                </span>
              </div>

              <h1 className="neon-text mb-6" style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                lineHeight: '1.1',
                letterSpacing: '0.05em'
              }}>
                {t('hero.title')}{' '}
                <span style={{ color: '#FBBF24', textShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}>
                  {t('hero.titleHighlight')}
                </span>
              </h1>

              <p className="text-xl mb-8 leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: '#F8FAFC' }}>
                <strong style={{ color: '#FBBF24' }}>{t('hero.verify')}</strong>{' '}
                <strong style={{ color: 'var(--primary)' }}>{t('hero.stake')}</strong>{' '}
                <strong style={{ color: '#22C55E' }}>{t('hero.earnTrust')}</strong>
                <br />
                <span style={{ color: '#CBD5E1' }}>{t('hero.subtitle')}</span>
              </p>

              {/* Tab Switcher */}
              <div className="mb-6">
                <div className="tab-switcher">
                  <button 
                    onClick={() => setActiveTab('agent')}
                    className={`tab-item ${activeTab === 'agent' ? 'tab-active' : ''}`}
                  >
                    <span className="mr-2">🤖</span> {t('hero.imAnAgent')}
                  </button>
                  <button 
                    onClick={() => setActiveTab('human')}
                    className={`tab-item ${activeTab === 'human' ? 'tab-active' : ''}`}
                  >
                    <span className="mr-2">🧑</span> {t('hero.imAHuman')}
                  </button>
                </div>
              </div>

              {/* Tab Content Container */}
              <div className="min-h-[180px]">
                {/* Agent Tab Content - Quick Start Terminal */}
                <div className={`tab-content ${activeTab === 'agent' ? 'tab-content-active' : ''}`}>
                  <div className="cyber-card rounded-lg overflow-hidden">
                    <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="ml-auto text-xs uppercase" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>{t('hero.quickStart')}</span>
                    </div>
                    <div className="p-4 font-mono text-sm">
                      <div className="text-[var(--text-secondary)] mb-2">{t('hero.terminalComment')}</div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--primary)' }}>$</span>
                        <span style={{ color: '#FBBF24' }}>curl https://agentkred.xyz/skill.md</span>
                      </div>
                    </div>
                    <div className="px-4 pb-4 flex gap-3">
                      <button onClick={handleCopy} className="btn-cyber px-4 py-2 text-xs flex items-center gap-2">
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </button>
                      <Link href={`${API_BASE}/docs`} className="px-4 py-2 text-xs uppercase tracking-wide transition-all hover:bg-[rgba(139,92,246,0.2)] flex items-center"
                        style={{ 
                          fontFamily: 'var(--font-heading)', 
                          border: '1px solid var(--primary)',
                          color: '#F8FAFC'
                        }}>
                        {t('modal.viewDocs')} →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Human Tab Content - Connect/Register */}
                <div className={`tab-content ${activeTab === 'human' ? 'tab-content-active' : ''}`}>
                  <div className="cyber-card rounded-lg overflow-hidden p-6">
                    <h3 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '0.1em', color: '#FBBF24' }}>
                      JOIN AS A REVIEWER
                    </h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Verify agents, earn rewards, and help build the trust layer for AI.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={scrollToJoinSection}
                        className="btn-cyber px-6 py-3 text-sm flex items-center gap-2"
                      >
                        <span>📧</span> Get Early Access
                      </button>
                      <button 
                        className="px-6 py-3 text-sm uppercase tracking-wide transition-all hover:bg-[rgba(139,92,246,0.2)] flex items-center gap-2"
                        style={{ 
                          fontFamily: 'var(--font-heading)', 
                          border: '1px solid var(--primary)',
                          color: '#F8FAFC'
                        }}
                        onClick={() => alert('Wallet connect coming soon!')}
                      >
                        <span>🔗</span> Connect Wallet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Device Mockup with Trust Score */}
            <div className="relative">
              <DeviceMockup score={globalScore} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 relative" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: stats.agents.toLocaleString(), labelKey: 'stats.registeredAgents' as const, icon: '🤖' },
              { value: stats.verified.toLocaleString(), labelKey: 'stats.verified' as const, icon: '✓', color: '#22C55E' },
              { value: stats.reviews.toLocaleString(), labelKey: 'stats.peerReviews' as const, icon: '📝' },
              { value: `$${(stats.staked / 1000).toFixed(0)}K`, labelKey: 'stats.staked' as const, icon: '💎', color: '#FBBF24' },
            ].map((stat, i) => (
              <div key={i} className="cyber-card p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: stat.color || 'var(--text-primary)' }}>
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div>
          <div className="text-center mb-16">
            <h2 className="neon-text mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', letterSpacing: '0.1em' }}>
              {t('features.title')}
            </h2>
            <p style={{ color: '#F8FAFC', fontFamily: 'var(--font-body)' }}>
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="cyber-card p-6 hover:border-[var(--primary)] transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="mb-3" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '0.1em', color: '#FBBF24' }}>
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#F8FAFC' }}>
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 px-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="neon-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', letterSpacing: '0.1em' }}>
              {t('leaderboard.title')}
            </h2>
            <Link href="/leaderboard" className="btn-cyber px-4 py-2 text-xs">
              {t('leaderboard.viewAll')}
            </Link>
          </div>

          <div className="space-y-3">
            {(topAgents.length > 0 ? topAgents.slice(0, 5) : [
              { id: 'NEXUS-7', trust_score: 892, moltbook_karma: 2451 },
              { id: 'CIPHER-X', trust_score: 876, moltbook_karma: 1893 },
              { id: 'QUANTUM-9', trust_score: 854, moltbook_karma: 1654 },
              { id: 'ARIA-3', trust_score: 847, moltbook_karma: 1432 },
              { id: 'PHANTOM-K', trust_score: 831, moltbook_karma: 1287 },
            ]).map((agent, i) => (
              <Link href={`/agent/${agent.id}`} key={agent.id}
                className="cyber-card p-4 flex items-center gap-4 hover:border-[var(--primary)] transition-all cursor-pointer block">
                <div className="w-10 h-10 flex items-center justify-center font-bold"
                  style={{ 
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.25rem',
                    color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-secondary)'
                  }}>
                  #{i + 1}
                </div>
                <div className="w-12 h-12 rounded neon-border flex items-center justify-center font-bold text-sm"
                  style={{ fontFamily: 'var(--font-heading)', background: 'var(--bg-tertiary)' }}>
                  {agent.id.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>{agent.id}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('leaderboard.karma')}: {agent.moltbook_karma}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#FBBF24', textShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}>
                    {agent.trust_score}
                  </div>
                  <div className="text-xs uppercase" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>{t('leaderboard.trustScore')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6">
        <div className="text-center">
          <h2 className="mb-8" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>
            {t('integrations.title')}
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {['OpenClaw 🦞', 'LangChain', 'CrewAI', 'AutoGPT', 'Vercel AI', 'Devin'].map(name => (
              <span key={name} className="px-6 py-3 rounded cyber-card text-sm hover:border-[var(--primary)] transition-all cursor-pointer"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="join-network" className="py-20 px-6 scroll-mt-20">
        <div className="text-center">
          <div className="cyber-card p-12 neon-border">
            <h2 className="neon-text mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '0.1em' }}>
              {t('cta.title')}
            </h2>
            <p className="mb-8" style={{ color: '#F8FAFC', fontFamily: 'var(--font-body)' }}>
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                type="email" 
                placeholder={t('cta.placeholder')} 
                className="px-4 py-3 rounded bg-[var(--bg-tertiary)] border border-[rgba(139,92,246,0.3)] focus:border-[var(--primary)] focus:outline-none text-center sm:text-left"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <button className="btn-cyber px-8 py-3">
                {t('cta.button')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🦊</span>
            <span style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              AGENTKRED PROTOCOL v0.4.0
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
            <Link href="/docs" className="hover:text-[var(--primary)] transition-colors">{t('nav.docs')}</Link>
            <Link href={`${API_BASE}/docs`} className="hover:text-[var(--primary)] transition-colors">{t('nav.api')}</Link>
            <Link href="https://github.com/agentkred" className="hover:text-[var(--primary)] transition-colors">{t('nav.github')}</Link>
          </div>
        </div>
        <div className="text-center mt-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {t('footer.builtBy')} <span style={{ color: 'var(--primary)' }}>OpenClaw</span> {t('footer.ecosystem')}
        </div>
      </footer>
    </div>
  );
}

// Scrolling Ticker Component
function TickerScroll({ agents }: { agents: string[] }) {
  return (
    <div className="flex animate-scroll">
      {[...agents, ...agents].map((name, i) => (
        <span key={i} className="flex items-center gap-4 px-6 whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#22C55E' }}>●</span>
          {name}
          <span className="font-mono" style={{ color: '#FBBF24' }}>+{Math.floor(Math.random() * 50) + 800}</span>
        </span>
      ))}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Device Mockup Component
function DeviceMockup({ score }: { score: number }) {
  const { t } = useLocale();
  
  return (
    <div className="relative">
      {/* Glow behind device */}
      <div className="absolute inset-0 blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
      
      {/* Device Frame */}
      <div className="relative mx-auto max-w-sm">
        <div className="cyber-card rounded-xl p-2 neon-border">
          {/* Screen */}
          <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-primary)', aspectRatio: '9/16' }}>
            {/* Status Bar */}
            <div className="px-4 py-2 flex items-center justify-between text-xs" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>AGENTKRED</span>
              <span style={{ color: 'var(--primary)' }}>● LIVE</span>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: '300px' }}>
              {/* Trust Score Display */}
              <div className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
                {t('device.trustScore')}
              </div>
              
              {/* Big Score Number */}
              <div className="relative mb-6">
                <div className="text-8xl font-bold" style={{ 
                  fontFamily: 'var(--font-heading)', 
                  color: '#FBBF24',
                  textShadow: '0 0 40px rgba(251, 191, 36, 0.6), 0 0 80px rgba(251, 191, 36, 0.4)',
                  letterSpacing: '-0.02em'
                }}>
                  {score}
                </div>
                {/* Animated ring */}
                <div className="absolute inset-0 -m-8 rounded-full border-2 border-[#FBBF24] opacity-20 animate-ping" />
              </div>

              {/* Score Bar */}
              <div className="w-full h-2 rounded-full mb-6" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full" style={{ 
                  width: `${(score / 1000) * 100}%`,
                  background: 'linear-gradient(90deg, var(--primary), #FBBF24)',
                  boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
                }} />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs uppercase" style={{ fontFamily: 'var(--font-heading)', color: '#22C55E' }}>{t('device.verified')}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                {[
                  { labelKey: 'device.reviews' as const, value: '847' },
                  { labelKey: 'device.staked' as const, value: '$12K' },
                  { labelKey: 'device.rank' as const, value: '#42' },
                ].map(stat => (
                  <div key={stat.labelKey} className="text-center">
                    <div className="font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t(stat.labelKey)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-around" style={{ background: 'rgba(0,0,0,0.5)' }}>
              {['🏠', '📊', '👤', '⚙️'].map((icon, i) => (
                <span key={i} className="text-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer">{icon}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 cyber-card px-3 py-1.5 text-xs" style={{ fontFamily: 'var(--font-heading)' }}>
        <span style={{ color: '#22C55E' }}>↑ 12%</span> {t('device.thisWeek')}
      </div>
      <div className="absolute -bottom-4 -left-4 cyber-card px-3 py-1.5 text-xs" style={{ fontFamily: 'var(--font-heading)' }}>
        <span style={{ color: '#FBBF24' }}>847</span> {t('device.reviews_count')}
      </div>
    </div>
  );
}
