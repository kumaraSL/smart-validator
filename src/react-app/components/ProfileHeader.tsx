import React from 'react';

interface Profile {
  name: string;
  passportNo: string;
  nationality: string;
  dob: string;
  sponsorName: string;
}

interface Completion {
  percentage: number;
  previousPercentage: number;
}

interface ProfileHeaderProps {
  profile: Profile | null;
  completion: Completion | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, completion }) => {
  if (!profile || !completion) {
    return (
      <div className="profile-bar">
        <div className="profile-info">
          <h2>Welcome to Smart Validator</h2>
          <div className="profile-meta">Upload documents to begin verification</div>
        </div>
      </div>
    );
  }

  const diff = completion.percentage - completion.previousPercentage;

  return (
    <div className="profile-bar">
      <div className="profile-info">
        <h2>{profile.name}</h2>
        <div className="profile-meta">
          <span>Passport: <strong>{profile.passportNo}</strong></span>
          <span>·</span>
          <span>Nationality: <strong>{profile.nationality}</strong></span>
          <span>·</span>
          <span>DOB: <strong>{profile.dob}</strong></span>
          <span>·</span>
          <span>Sponsor: <strong>{profile.sponsorName}</strong></span>
        </div>
      </div>

      <div className="completion-widget">
        <div className="completion-header">
          <span className="completion-label">Application Completeness</span>
          <div>
            <span className="completion-value">{completion.percentage}%</span>
            {diff !== 0 && (
              <span className={`completion-diff ${diff > 0 ? 'text-success' : 'text-error'}`}>
                {diff > 0 ? `↑ +${diff}%` : `↓ ${diff}%`}
              </span>
            )}
          </div>
        </div>
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${completion.percentage}%` }} />
        </div>
      </div>
    </div>
  );
};
