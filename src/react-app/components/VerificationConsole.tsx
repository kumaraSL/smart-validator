import React, { useEffect, useRef } from 'react';
import { StatusChip } from './StatusChip';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface VerificationConsoleProps {
  logs: LogEntry[];
  documentName?: string;
  status?: string;
}

const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <circle cx="12" cy="15" r="2"/>
  </svg>
);

export const VerificationConsole: React.FC<VerificationConsoleProps> = ({ logs, documentName, status }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const chipProps = (s?: string) => {
    if (!s) return null;
    switch (s) {
      case 'success': return { status: 'completed' as const, label: 'Passed' };
      case 'error': return { status: 'error' as const, label: 'Action Required' };
      default: return { status: 'neutral' as const, label: s };
    }
  };

  const chip = chipProps(status);

  return (
    <div className="console-container">
      <div className="console-header">
        <div>
          <h3 style={{ marginBottom: documentName ? '2px' : 0 }}>
            {documentName ? 'Document Analysis' : 'Verification Console'}
          </h3>
          {documentName && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{documentName}</p>}
        </div>
        {chip && <StatusChip status={chip.status} label={chip.label} />}
      </div>

      <div className="console-output" ref={scrollRef}>
        {logs.length === 0 ? (
          <div className="console-empty">
            <EmptyIcon />
            <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>No Document Selected</h3>
            <p style={{ fontSize: '13px' }}>Select a document from the list to view detailed AI analysis results.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`console-log-entry ${log.type}`}>
              <div className="console-timestamp">[{log.timestamp}]</div>
              <div className={`console-log-msg ${log.type === 'error' ? 'text-error' : log.type === 'success' ? 'text-success' : log.type === 'warning' ? 'text-warning' : 'text-info'}`}>
                {log.message}
              </div>
              {log.details && <div className="console-log-detail">↳ {log.details}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
