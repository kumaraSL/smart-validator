import React from 'react';
import { Applicant } from './ApplicantDetail';

interface ApplicantListProps {
  applicants: Applicant[];
  onSelect: (id: string) => void;
}

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

export const ApplicantList: React.FC<ApplicantListProps> = ({ applicants, onSelect }) => {
  if (applicants.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
        <div style={{ marginBottom: '16px', color: 'var(--border-hover)' }}><UserIcon /></div>
        <h3 style={{ marginBottom: '8px' }}>No Applicants Yet</h3>
        <p style={{ fontSize: '14px' }}>Upload and verify documents to create an applicant profile.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
      {applicants.map(applicant => {
        const latest = applicant.submissions[applicant.submissions.length - 1];
        const pct = latest.completion.percentage;
        const passed = latest.documents.filter(d => d.status === 'success').length;
        const failed = latest.documents.filter(d => d.status === 'error').length;
        const versionCount = applicant.submissions.length;

        return (
          <div
            key={applicant.id}
            className="card clickable"
            onClick={() => onSelect(applicant.id)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-4) var(--sp-5)' }}
          >
            {/* Left: Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'var(--color-green-light)',
                border: '2px solid var(--color-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '16px', color: 'var(--color-green)',
                flexShrink: 0,
              }}>
                {applicant.profile.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{applicant.profile.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {applicant.profile.passportNo} · {applicant.profile.nationality} · DOB: {applicant.profile.dob}
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-7)' }}>
              {/* Versions */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>{versionCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Version{versionCount > 1 ? 's' : ''}</div>
              </div>

              {/* Passed */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--success)' }}>{passed}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Passed</div>
              </div>

              {/* Failed */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '18px', color: failed > 0 ? 'var(--error)' : 'var(--success)' }}>{failed}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{failed > 0 ? 'Action Req.' : 'All Clear'}</div>
              </div>

              {/* Completion */}
              <div style={{ minWidth: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Completion</span>
                  <span style={{ fontWeight: 700, color: pct === 100 ? 'var(--success)' : 'var(--text-primary)' }}>{pct}%</span>
                </div>
                <div className="progress-container" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Arrow */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--border-hover)', flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};
