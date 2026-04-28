import React, { useEffect } from 'react';
import { DocumentData } from './DocumentList';
import { Checklist, ChecklistItem } from './Checklist';
import { StatusChip } from './StatusChip';

interface DocumentReviewModalProps {
  document: DocumentData;
  onClose: () => void;
}

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({ document, onClose }) => {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Convert logs to checklist items
  const checklistItems: ChecklistItem[] = document.logs.map((log, index) => ({
    id: `${document.id}-log-${index}`,
    title: log.message,
    details: log.details,
    status: log.type as any,
  }));

  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'success': return { status: 'completed' as const, label: 'Passed' };
      case 'error': return { status: 'error' as const, label: 'Action Required' };
      case 'in_progress': return { status: 'in-progress' as const, label: 'In Progress' };
      default: return { status: 'neutral' as const, label: 'Pending' };
    }
  };

  const statusProps = getStatusProps(document.status);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--sp-4)'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-bg)',
        width: '100%',
        maxWidth: '1400px',
        height: 'calc(100vh - 40px)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{document.name}</h2>
              <StatusChip status={statusProps.status} label={statusProps.label} />
              <span className="badge-version">v{document.version}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {document.category} Document
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '8px', minWidth: 'auto' }}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content (Split View) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Pane: PDF Viewer Placeholder */}
          <div style={{ 
            flex: 6, 
            backgroundColor: '#E5E7EB', 
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Toolbar for PDF */}
            <div style={{ padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button className="btn-ghost" style={{ padding: '4px 8px', minWidth: 'auto' }}>-</button>
              <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', fontWeight: 500 }}>100%</span>
              <button className="btn-ghost" style={{ padding: '4px 8px', minWidth: 'auto' }}>+</button>
            </div>
            
            {/* PDF Canvas Placeholder */}
            <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{ 
                width: '100%', 
                maxWidth: '800px', 
                height: '1100px', // A4 aspect ratio approximation
                backgroundColor: 'white', 
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                padding: '48px',
                textAlign: 'center'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Document Preview Not Available</h3>
                <p style={{ maxWidth: '400px', fontSize: '14px' }}>
                  This is a mock placeholder for the PDF viewer. In a real environment, the actual PDF file for <strong>{document.name}</strong> would be rendered here for side-by-side verification.
                </p>
              </div>
            </div>
          </div>

          {/* Right Pane: Interactive Checklist */}
          <div style={{ 
            flex: 4, 
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', backgroundColor: '#F9FAFB' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Verification Checklist</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Review the AI findings and manually check off each requirement.
              </p>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {checklistItems.length > 0 ? (
                <Checklist items={checklistItems} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No verification items found for this document.
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={onClose}>Save & Close</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
