import React, { useState } from 'react';
import { StatusChip } from './StatusChip';

export interface DocumentData {
  id: string;
  name: string;
  category: string;
  status: 'success' | 'error' | 'in_progress' | 'neutral';
  version: number;
  logs: any[];
}

interface DocumentListProps {
  documents: DocumentData[];
  onSelectDocument: (doc: DocumentData) => void;
  selectedDocId?: string;
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onSelectDocument, selectedDocId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDocs = documents.filter(doc => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = doc.name.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const chipProps = (status: DocumentData['status']) => {
    switch (status) {
      case 'success': return { status: 'completed' as const, label: 'Passed' };
      case 'error': return { status: 'error' as const, label: 'Action Required' };
      case 'in_progress': return { status: 'in-progress' as const, label: 'In Progress' };
      default: return { status: 'neutral' as const, label: 'Pending' };
    }
  };

  return (
    <>
      <div className="toolbar">
        <div className="search-bar-wrapper">
          <span className="search-bar-icon"><SearchIcon /></span>
          <input
            type="text"
            className="search-input"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <select
          className="search-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto', paddingLeft: '12px' }}
        >
          <option value="all">All Status</option>
          <option value="success">Passed</option>
          <option value="error">Action Required</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      <div className="document-grid">
        {filteredDocs.map(doc => {
          const { status, label } = chipProps(doc.status);
          return (
            <div
              key={doc.id}
              className={`card clickable${selectedDocId === doc.id ? ' active' : ''}`}
              onClick={() => onSelectDocument(doc)}
            >
              <div className="doc-card-header">
                <span className="doc-card-title" title={doc.name}>{doc.name}</span>
                <StatusChip status={status} label={label} />
              </div>
              <div className="doc-card-meta">
                <span className="doc-category">{doc.category}</span>
                <span className="badge-version">v{doc.version}</span>
              </div>
            </div>
          );
        })}
        {filteredDocs.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
            No documents match your filters.
          </div>
        )}
      </div>
    </>
  );
};
