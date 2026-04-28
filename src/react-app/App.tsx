import { useState, useEffect, useCallback, ReactElement } from 'react';
import { Dropzone } from './components/Dropzone';
import { ApplicantList } from './components/ApplicantList';
import { ApplicantDetail, Applicant } from './components/ApplicantDetail';
import './index.css';

type NavView = 'upload' | 'users';

const NAV: { id: NavView; label: string; icon: ReactElement }[] = [
  {
    id: 'upload',
    label: 'Upload Documents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
        <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Applicants',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

// ── Spinner ─────────────────────────────────────────────────────
const Spinner = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

function App() {
  const [activeView, setActiveView] = useState<NavView>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Which applicant to revise (null = new applicant)
  const [revisingApplicantId, setRevisingApplicantId] = useState<string | null>(null);

  // All applicants from DB
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  // User list → detail navigation
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  // ── Load applicants from API ───────────────────────────────
  const fetchApplicants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/applicants');
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const data: Applicant[] = await res.json();
      setApplicants(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load applicants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  // ── File handlers ──────────────────────────────────────────
  const handleFilesAdded = (newFiles: File[]) => setFiles(prev => [...prev, ...newFiles]);
  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  // ── Run Verification ───────────────────────────────────────
  const runVerification = async () => {
    if (!files.length) return;
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => f.name),
          applicantId: revisingApplicantId,
        }),
      });
      if (!res.ok) throw new Error(`Verification failed: ${res.status}`);
      const data = await res.json();

      // Refresh applicants from DB
      await fetchApplicants();

      setRevisingApplicantId(null);
      setFiles([]);
      setSelectedApplicantId(data.applicantId);
      setActiveView('users');
    } catch (e: any) {
      setError(e.message ?? 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Upload Revision ────────────────────────────────────────
  const handleUploadRevision = (applicantId: string) => {
    setRevisingApplicantId(applicantId);
    setSelectedApplicantId(null);
    setActiveView('upload');
  };

  // ── Delete Applicant ───────────────────────────────────────
  const handleDeleteApplicant = async (applicantId: string) => {
    if (!confirm('Delete this applicant and all their documents?')) return;
    try {
      await fetch(`/api/applicants/${applicantId}`, { method: 'DELETE' });
      setSelectedApplicantId(null);
      await fetchApplicants();
    } catch (e) {
      console.error(e);
    }
  };

  const revisingApplicant = revisingApplicantId
    ? applicants.find(a => a.id === revisingApplicantId)
    : null;

  const selectedApplicant = selectedApplicantId
    ? applicants.find(a => a.id === selectedApplicantId)
    : null;

  return (
    <div className="app-root">
      {/* ── Top Nav ── */}
      <nav className="topnav">
        <div className="topnav-brand">
          <div className="topnav-logo">S</div>
          Smart Validator
        </div>
        <div className="topnav-actions">
          <button className="topnav-icon-btn" title="Refresh" onClick={fetchApplicants}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button className="topnav-icon-btn" title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="topnav-dot"></span>
          </button>
          <button className="topnav-icon-btn" title="Profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M20 21a8 8 0 1 0-16 0"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="app-body">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-section-label">Navigation</div>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`sidebar-item${activeView === item.id ? ' active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                if (item.id === 'users') setRevisingApplicantId(null);
              }}
            >
              <span className="sidebar-item-icon" style={{ color: activeView === item.id ? 'var(--color-green)' : 'var(--text-secondary)' }}>
                {item.icon}
              </span>
              {item.label}
              {item.id === 'users' && applicants.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--color-green)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  padding: '1px 7px',
                  lineHeight: '18px',
                }}>
                  {applicants.length}
                </span>
              )}
            </button>
          ))}

          <div style={{ marginTop: 'auto', padding: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <div className="status-dot"></div>
            Online
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content">

          {/* Global error banner */}
          {error && (
            <div style={{
              background: 'var(--error-bg)', border: '1px solid var(--error)',
              borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)',
              color: 'var(--error)', fontSize: '14px', display: 'flex',
              alignItems: 'center', gap: 'var(--sp-2)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
              <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* ── VIEW: Upload ── */}
          {activeView === 'upload' && (
            <>
              <div className="page-header">
                <div>
                  {revisingApplicant ? (
                    <>
                      <h1 className="page-title">Upload Revised Documents</h1>
                      <p className="page-subtitle">
                        Applicant: <strong>{revisingApplicant.profile.name}</strong> — will be verified as v{revisingApplicant.submissions.length + 1}
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="page-title">Upload &amp; Verify Documents</h1>
                      <p className="page-subtitle">Upload PDF documents to run AI verification</p>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                  {revisingApplicant && (
                    <button className="btn-ghost" onClick={() => { setRevisingApplicantId(null); setActiveView('users'); }}>
                      Cancel
                    </button>
                  )}
                  <button className="btn-primary" onClick={runVerification} disabled={isVerifying || !files.length}>
                    {isVerifying ? (
                      <><Spinner size={16} /> Processing...</>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        {revisingApplicant ? 'Re-run Verification' : 'Run Verification'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {revisingApplicant && (
                <div style={{
                  background: 'var(--info-bg)', border: '1px solid var(--info)',
                  borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)',
                  fontSize: '14px', color: 'var(--info)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Uploading revised documents for <strong style={{ marginLeft: '4px' }}>{revisingApplicant.profile.name}</strong>. Current version: v{revisingApplicant.submissions.length}
                </div>
              )}

              <Dropzone onFilesAdded={handleFilesAdded} files={files} onRemoveFile={removeFile} />
            </>
          )}

          {/* ── VIEW: Users ── */}
          {activeView === 'users' && (
            <>
              {selectedApplicant ? (
                <ApplicantDetail
                  applicant={selectedApplicant}
                  onUploadRevision={handleUploadRevision}
                  onBack={() => setSelectedApplicantId(null)}
                  onDelete={handleDeleteApplicant}
                />
              ) : (
                <>
                  <div className="page-header">
                    <div>
                      <h1 className="page-title">Applicant List</h1>
                      <p className="page-subtitle">Click on an applicant to view their documents and verification results</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                      <button className="btn-ghost" onClick={fetchApplicants} disabled={isLoading}>
                        {isLoading ? <Spinner size={14} /> : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                          </svg>
                        )}
                        Refresh
                      </button>
                      <button className="btn-primary" onClick={() => setActiveView('upload')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add New Applicant
                      </button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <Spinner size={32} />
                        <span>Loading applicants from database...</span>
                      </div>
                    </div>
                  ) : (
                    <ApplicantList applicants={applicants} onSelect={setSelectedApplicantId} />
                  )}
                </>
              )}
            </>
          )}

        </main>
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default App;
