'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Ticket {
  id: string;
  name: string;
  email: string;
  institution?: string;
  message: string;
  status: 'pendente' | 'em_atendimento' | 'finalizado';
  createdAt: string;
  adminReply?: string;
}

interface Stats {
  total: number;
  pendente: number;
  emAtendimento: number;
  finalizado: number;
}

interface AudioTrack {
  id: string;
  title: string;
  fileUrl: string;
  emoji?: string;
}

const STATUS_CONFIG = {
  pendente:       { label: 'Pendente',        color: '#b45309', bg: 'rgba(217,119,6,0.10)',   icon: '🕐' },
  em_atendimento: { label: 'Em atendimento',  color: '#7A4BB7', bg: 'rgba(122,75,183,0.12)', icon: '⚡' },
  finalizado:     { label: 'Finalizado',      color: '#0bab96', bg: 'rgba(18,201,176,0.12)',  icon: '✓'  },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [audios, setAudios] = useState<AudioTrack[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'audios'>('tickets');

  async function loadTickets() {
    const response = await fetch('/api/tickets');
    if (response.status === 401) { router.push('/admin/login'); return; }
    const data = await response.json();
    setTickets(data.tickets ?? []);
    setStats(data.stats ?? null);
  }

  async function loadAudios() {
    const response = await fetch('/api/audios');
    const data = await response.json();
    setAudios(data.audios ?? []);
  }

  useEffect(() => {
    Promise.all([loadTickets(), loadAudios()]).finally(() => setLoading(false));
  }, []);

  async function handleStart(id: string) {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'iniciar' })
    });
    loadTickets();
  }

  async function handleFinalize(id: string) {
    const reply = replyDrafts[id]?.trim();
    if (!reply) return;
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'finalizar', reply })
    });
    setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
    loadTickets();
  }

  async function handleAudioUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch('/api/audios', { method: 'POST', body: formData });
    if (response.ok) { form.reset(); loadAudios(); }
    else {
      const data = await response.json().catch(() => null);
      alert(data?.error ?? 'Não foi possível cadastrar o áudio.');
    }
  }

  async function handleAudioDelete(id: string) {
    if (!confirm('Remover este áudio?')) return;
    await fetch(`/api/audios/${id}`, { method: 'DELETE' });
    loadAudios();
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-spinner" />
        <p>Carregando painel...</p>
      </div>
    );
  }

  return (
    <main className="admin-dashboard">

      {/* ── Header ── */}
      <header className="admin-dashboard-header">
        <div className="dash-header-brand">
          <img src="/imagens/logo_neurovian_principal.png" alt="Neurovian" className="dash-header-logo" />
          <div>
            <span className="dash-header-label">Painel Admin</span>
            <h1 className="dash-header-title">Neurovian</h1>
          </div>
        </div>
        <button type="button" className="dash-logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </header>

      {/* ── Stats ── */}
      <section className="admin-stats">
        <div className="admin-stat-card">
          <div className="stat-icon stat-icon--total">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <strong>{stats?.total ?? 0}</strong>
          <p>Total de solicitações</p>
        </div>
        <div className="admin-stat-card admin-stat-card--pending">
          <div className="stat-icon stat-icon--pending">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <strong>{stats?.pendente ?? 0}</strong>
          <p>Pendentes</p>
        </div>
        <div className="admin-stat-card admin-stat-card--progress">
          <div className="stat-icon stat-icon--progress">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <strong>{stats?.emAtendimento ?? 0}</strong>
          <p>Em atendimento</p>
        </div>
        <div className="admin-stat-card admin-stat-card--done">
          <div className="stat-icon stat-icon--done">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <strong>{stats?.finalizado ?? 0}</strong>
          <p>Finalizadas</p>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="dash-tabs">
        <button
          className={`dash-tab${activeTab === 'tickets' ? ' dash-tab--active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
            <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
          </svg>
          Solicitações
          {(stats?.pendente ?? 0) > 0 && (
            <span className="dash-tab-badge">{stats!.pendente}</span>
          )}
        </button>
        <button
          className={`dash-tab${activeTab === 'audios' ? ' dash-tab--active' : ''}`}
          onClick={() => setActiveTab('audios')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          Áudios
          <span className="dash-tab-badge dash-tab-badge--neutral">{audios.length}</span>
        </button>
      </div>

      {/* ── Tickets ── */}
      {activeTab === 'tickets' && (
        <section className="admin-section">
          <div className="admin-section-header">
            <h2>Solicitações recebidas</h2>
            <span className="admin-section-count">{tickets.length} no total</span>
          </div>

          <div className="admin-ticket-list">
            {tickets.length === 0 && (
              <div className="dash-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.35}}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <p>Nenhuma solicitação recebida ainda.</p>
              </div>
            )}

            {tickets.map((ticket) => {
              const cfg = STATUS_CONFIG[ticket.status];
              return (
                <article key={ticket.id} className={`admin-ticket admin-ticket--${ticket.status}`}>
                  <div className="admin-ticket-top">
                    <div className="admin-ticket-who">
                      <div className="admin-ticket-avatar">
                        {ticket.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="admin-ticket-name">{ticket.name}</h3>
                        <p className="admin-ticket-meta">
                          {ticket.email}
                          {ticket.institution ? ` · ${ticket.institution}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="admin-ticket-right">
                      <span
                        className="admin-ticket-status"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="admin-ticket-date">
                        {new Date(ticket.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="admin-ticket-message">{ticket.message}</p>

                  {ticket.status === 'pendente' && (
                    <button type="button" className="dash-btn dash-btn--start" onClick={() => handleStart(ticket.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Iniciar atendimento
                    </button>
                  )}

                  {ticket.status === 'em_atendimento' && (
                    <div className="admin-ticket-reply">
                      <textarea
                        placeholder="Escreva a resposta que será enviada por e-mail ao usuário..."
                        value={replyDrafts[ticket.id] ?? ''}
                        onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                      />
                      <button type="button" className="dash-btn dash-btn--finalize" onClick={() => handleFinalize(ticket.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Finalizar e enviar e-mail
                      </button>
                    </div>
                  )}

                  {ticket.status === 'finalizado' && ticket.adminReply && (
                    <div className="admin-ticket-resolved">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <span><strong>Resposta enviada:</strong> {ticket.adminReply}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Áudios ── */}
      {activeTab === 'audios' && (
        <section className="admin-section">
          <div className="admin-section-header">
            <h2>Áudios para os usuários</h2>
            <span className="admin-section-count">{audios.length} cadastrados</span>
          </div>

          <div className="dash-audio-upload">
            <h3 className="dash-audio-upload-title">Adicionar novo áudio</h3>
            <form className="admin-audio-form" onSubmit={handleAudioUpload}>
              <input type="text" name="title" placeholder="Título do ambiente sonoro" required />
              <input type="text" name="emoji" placeholder="Emoji (ex: 🌲)" maxLength={4} />
              <label className="dash-file-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Escolher arquivo
                <input type="file" name="file" accept="audio/mpeg,audio/wav,audio/ogg" required style={{display:'none'}} />
              </label>
              <button type="submit" className="dash-btn dash-btn--finalize">
                Adicionar áudio
              </button>
            </form>
          </div>

          <ul className="admin-audio-list">
            {audios.length === 0 && (
              <div className="dash-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.35}}>
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                <p>Nenhum áudio cadastrado ainda.</p>
              </div>
            )}
            {audios.map((audio) => (
              <li key={audio.id} className="dash-audio-item">
                <div className="dash-audio-emoji">{audio.emoji || '🎵'}</div>
                <div className="dash-audio-info">
                  <span className="dash-audio-title">{audio.title}</span>
                  <audio controls src={audio.fileUrl} className="dash-audio-player" />
                </div>
                <button type="button" className="dash-btn dash-btn--delete" onClick={() => handleAudioDelete(audio.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function statusLabel(status: Ticket['status']) {
  return STATUS_CONFIG[status].label;
}
