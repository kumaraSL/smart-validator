import { useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { ApplicantList } from './components/ApplicantList';
import { ApplicantDetail, Applicant, Submission } from './components/ApplicantDetail';
import { DocumentData } from './components/DocumentList';
import './index.css';

type NavView = 'upload' | 'users';

const NAV: { id: NavView; label: string; icon: JSX.Element }[] = [
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

// ── Helpers ────────────────────────────────────────
let applicantSeq = 0;
const genId = () => `app-${++applicantSeq}-${Date.now()}`;

function App() {
  const [activeView, setActiveView] = useState<NavView>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  // Which applicant to revise (null = new applicant)
  const [revisingApplicantId, setRevisingApplicantId] = useState<string | null>(null);

  // All applicants
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  // User list → detail navigation
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  // ── File handlers ──────────────────────────────
  const handleFilesAdded = (newFiles: File[]) => setFiles(prev => [...prev, ...newFiles]);
  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  // ── Run Verification ───────────────────────────
  const runVerification = async () => {
    if (!files.length) return;
    setIsVerifying(true);
    try {
      // Determine version number
      let existingVersion = 0;
      if (revisingApplicantId) {
        const existing = applicants.find(a => a.id === revisingApplicantId);
        existingVersion = existing ? existing.submissions.length : 0;
      }
      const version = existingVersion + 1;

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: files.map(f => f.name), version }),
      });
      const data = await res.json();

      const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        version,
        submittedAt: new Date().toLocaleString('ja-JP'),
        documents: data.documents as DocumentData[],
        completion: data.completion,
      };

      if (revisingApplicantId) {
        // Add new submission to existing applicant
        setApplicants(prev =>
          prev.map(a =>
            a.id === revisingApplicantId
              ? { ...a, submissions: [...a.submissions, newSubmission] }
              : a
          )
        );
        setSelectedApplicantId(revisingApplicantId);
      } else {
        // Create new applicant
        const newApplicant: Applicant = {
          id: genId(),
          profile: data.profile,
          submissions: [newSubmission],
        };
        setApplicants(prev => [...prev, newApplicant]);
        setSelectedApplicantId(newApplicant.id);
      }

      setRevisingApplicantId(null);
      setFiles([]);
      setActiveView('users');
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Upload Revision handler from ApplicantDetail ──
  const handleUploadRevision = (applicantId: string) => {
    setRevisingApplicantId(applicantId);
    setSelectedApplicantId(null);
    setActiveView('upload');
  };

  const revisingApplicant = revisingApplicantId
    ? applicants.find(a => a.id === revisingApplicantId)
    : null;

  const selectedApplicant = selectedApplicantId
    ? applicants.find(a => a.id === selectedApplicantId)
    : null;

  return (
    <div className="app-root">
      {/* ── Top Nav ─────────────────────────────── */}
      <nav className="topnav">
        <div className="topnav-brand">
          <div className="topnav-logo">S</div>
          Smart Validator
        </div>
        <div className="topnav-actions">
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

      {/* ── Body ────────────────────────────────── */}
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
                // When switching back to upload, clear revision context if going to users
                if (item.id === 'users') setRevisingApplicantId(null);
              }}
            >
              <span className="sidebar-item-icon" style={{ color: activeView === item.id ? 'var(--color-green)' : 'var(--text-secondary)' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}

          {/* Applicant count badge */}
          {applicants.length > 0 && (
            <div style={{ marginTop: 'var(--sp-3)', padding: '0 var(--sp-3)' }}>
              <div style={{
                background: 'var(--color-green-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-2) var(--sp-3)',
                fontSize: '12px',
                color: 'var(--color-green)',
                fontWeight: 600,
              }}>
                {applicants.length} applicant{applicants.length > 1 ? 's' : ''} registered
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', padding: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <div className="status-dot"></div>
            Online
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="main-content">

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
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Processing...
                      </>
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

              {/* Revision banner */}
              {revisingApplicant && (
                <div style={{
                  background: 'var(--info-bg)',
                  border: '1px solid var(--info)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  fontSize: '14px',
                  color: 'var(--info)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-2)',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Uploading revised documents for <strong>{revisingApplicant.profile.name}</strong>. Current latest version: v{revisingApplicant.submissions.length}
                </div>
              )}

              <Dropzone onFilesAdded={handleFilesAdded} files={files} onRemoveFile={removeFile} />
            </>
          )}

          {/* ── VIEW: Users (List or Detail) ── */}
          {activeView === 'users' && (
            <>
              {selectedApplicant ? (
                <ApplicantDetail
                  applicant={selectedApplicant}
                  onUploadRevision={handleUploadRevision}
                  onBack={() => setSelectedApplicantId(null)}
                />
              ) : (
                <>
                  <div className="page-header">
                    <div>
                      <h1 className="page-title">Applicant List</h1>
                      <p className="page-subtitle">Click on an applicant to view their documents and verification results</p>
                    </div>
                    <button className="btn-primary" onClick={() => setActiveView('upload')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add New Applicant
                    </button>
                  </div>
                  <ApplicantList applicants={applicants} onSelect={setSelectedApplicantId} />
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
