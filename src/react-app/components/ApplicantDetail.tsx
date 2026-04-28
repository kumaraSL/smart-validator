import React from 'react';
import { StatusChip } from './StatusChip';
import { DocumentList, DocumentData } from './DocumentList';
import { VerificationConsole } from './VerificationConsole';

export interface Submission {
  id: string;
  version: number;
  submittedAt: string;
  documents: DocumentData[];
  completion: { percentage: number; previousPercentage: number };
}

export interface Applicant {
  id: string;
  profile: {
    name: string;
    passportNo: string;
    nationality: string;
    dob: string;
    sponsorName: string;
  };
  submissions: Submission[];
}

type DetailTab = 'all' | 'individual' | 'history';

interface ApplicantDetailProps {
  applicant: Applicant;
  onUploadRevision: (applicantId: string) => void;
  onBack: () => void;
}

export const ApplicantDetail: React.FC<ApplicantDetailProps> = ({ applicant, onUploadRevision, onBack }) => {
  const [activeTab, setActiveTab] = React.useState<DetailTab>('all');
  const [selectedVersion, setSelectedVersion] = React.useState<number>(applicant.submissions.length);
  const [selectedDocId, setSelectedDocId] = React.useState<string | undefined>();

  const currentSubmission = applicant.submissions.find(s => s.version === selectedVersion)
    ?? applicant.submissions[applicant.submissions.length - 1];

  const allLogs = currentSubmission.documents.flatMap(d => d.logs);
  const selectedDoc = currentSubmission.documents.find(d => d.id === selectedDocId);
  const latestCompletion = applicant.submissions[applicant.submissions.length - 1].completion.percentage;

  const TABS: { id: DetailTab; label: string }[] = [
    { id: 'all', label: 'All Documents' },
    { id: 'individual', label: 'Individual Check' },
    { id: 'history', label: 'Version History' },
  ];

  const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

      {/* Back + Header */}
      <div>
        <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 'var(--sp-3)', paddingLeft: 0 }}>
          <ChevronLeft /> Back to User List
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ marginBottom: 'var(--sp-1)' }}>{applicant.profile.name}</h1>
            <div style={{ display: 'flex', gap: 'var(--sp-4)', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <span>Passport: <strong style={{ color: 'var(--text-primary)' }}>{applicant.profile.passportNo}</strong></span>
              <span>·</span>
              <span>DOB: <strong style={{ color: 'var(--text-primary)' }}>{applicant.profile.dob}</strong></span>
              <span>·</span>
              <span>Nationality: <strong style={{ color: 'var(--text-primary)' }}>{applicant.profile.nationality}</strong></span>
              <span>·</span>
              <span>Sponsor: <strong style={{ color: 'var(--text-primary)' }}>{applicant.profile.sponsorName}</strong></span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
            <button className="btn-primary" onClick={() => onUploadRevision(applicant.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
              </svg>
              Upload Revision
            </button>
          </div>
        </div>
      </div>

      {/* Profile + Completion Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>APPLICATION STATUS</div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: latestCompletion === 100 ? 'var(--success)' : 'var(--text-primary)' }}>
              {latestCompletion}%
            </span>
            {applicant.submissions.length > 1 && (
              <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                ↑ +{latestCompletion - applicant.submissions[0].completion.percentage}% from v1
              </span>
            )}
          </div>
        </div>
        <div style={{ minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Completeness</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>v{applicant.submissions.length} (latest)</span>
          </div>
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${latestCompletion}%` }} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', gap: 'var(--sp-1)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-green)' : '2px solid transparent',
              borderRadius: 0,
              padding: '10px 20px',
              marginBottom: '-2px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--color-green)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: All Documents (combined log view) */}
      {activeTab === 'all' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>All Document Results — v{currentSubmission.version}</h3>
            {/* Version picker */}
            <select
              className="search-input"
              value={selectedVersion}
              onChange={e => setSelectedVersion(Number(e.target.value))}
              style={{ width: 'auto', paddingLeft: '12px' }}
            >
              {applicant.submissions.map(s => (
                <option key={s.version} value={s.version}>Version {s.version} — {s.submittedAt}</option>
              ))}
            </select>
          </div>
          <div style={{ padding: 'var(--sp-5)', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', maxHeight: '420px', overflowY: 'auto' }}>
            {allLogs.map(log => (
              <div key={log.id} className={`console-log-entry ${log.type}`}>
                <div className="console-timestamp">[{log.timestamp}]</div>
                <div className={`console-log-msg ${log.type === 'error' ? 'text-error' : log.type === 'success' ? 'text-success' : log.type === 'warning' ? 'text-warning' : 'text-info'}`}>
                  {log.message}
                </div>
                {log.details && <div className="console-log-detail">↳ {log.details}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Individual Check */}
      {activeTab === 'individual' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)', minHeight: '400px' }}>
          <div className="card" style={{ overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
              <h3>Documents (v{currentSubmission.version})</h3>
              <select
                className="search-input"
                value={selectedVersion}
                onChange={e => { setSelectedVersion(Number(e.target.value)); setSelectedDocId(undefined); }}
                style={{ width: 'auto', paddingLeft: '12px' }}
              >
                {applicant.submissions.map(s => (
                  <option key={s.version} value={s.version}>v{s.version} — {s.submittedAt}</option>
                ))}
              </select>
            </div>
            <DocumentList
              documents={currentSubmission.documents}
              onSelectDocument={doc => setSelectedDocId(doc.id)}
              selectedDocId={selectedDocId}
            />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <VerificationConsole
              logs={selectedDoc?.logs ?? []}
              documentName={selectedDoc?.name}
              status={selectedDoc?.status}
            />
          </div>
        </div>
      )}

      {/* Tab: Version History */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {applicant.submissions.slice().reverse().map((sub, idx) => {
            const isLatest = idx === 0;
            const prevSub = applicant.submissions[applicant.submissions.length - 1 - idx - 1];
            const diff = prevSub ? sub.completion.percentage - prevSub.completion.percentage : 0;
            const passed = sub.documents.filter(d => d.status === 'success').length;
            const failed = sub.documents.filter(d => d.status === 'error').length;

            return (
              <div key={sub.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <span className="badge-version" style={{ fontSize: '13px', padding: '4px 12px' }}>v{sub.version}</span>
                    <span style={{ fontWeight: 600 }}>Submission v{sub.version}</span>
                    {isLatest && <span className="chip chip-completed">Latest</span>}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{sub.submittedAt}</span>
                </div>

                {/* Completion comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ textAlign: 'center', padding: 'var(--sp-3)', background: 'var(--surface-app)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: sub.completion.percentage === 100 ? 'var(--success)' : 'var(--text-primary)' }}>{sub.completion.percentage}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completion</div>
                    {diff > 0 && <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>↑ +{diff}%</div>}
                  </div>
                  <div style={{ textAlign: 'center', padding: 'var(--sp-3)', background: 'var(--color-green-light)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--success)' }}>{passed}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Passed</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 'var(--sp-3)', background: failed > 0 ? 'var(--error-bg)' : 'var(--color-green-light)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: failed > 0 ? 'var(--error)' : 'var(--success)' }}>{failed}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{failed > 0 ? 'Action Required' : 'Issues Cleared'}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${sub.completion.percentage}%` }} />
                </div>

                {/* Document list for this version */}
                <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {sub.documents.map(doc => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-2) var(--sp-3)', background: 'var(--surface-app)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{doc.category}</span>
                        <span style={{ fontWeight: 500 }}>{doc.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                        <span className="badge-version">v{doc.version}</span>
                        <StatusChip
                          status={doc.status === 'success' ? 'completed' : doc.status === 'error' ? 'error' : 'neutral'}
                          label={doc.status === 'success' ? 'Passed' : doc.status === 'error' ? 'Action Required' : 'Pending'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
