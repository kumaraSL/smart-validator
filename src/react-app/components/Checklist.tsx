import React, { useState } from 'react';

export interface ChecklistItem {
  id: string;
  title: string;
  details?: string;
  status: 'pending' | 'success' | 'error' | 'warning' | 'info';
}

interface ChecklistProps {
  items: ChecklistItem[];
}

export const Checklist: React.FC<ChecklistProps> = ({ items }) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedIds);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIds(newChecked);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the checkbox when clicking expand
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'var(--success)';
      case 'error': return 'var(--error)';
      case 'warning': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item) => {
        const isChecked = checkedIds.has(item.id);
        const isExpanded = expandedIds.has(item.id);

        return (
          <div 
            key={item.id} 
            style={{ 
              border: `1px solid ${isChecked ? 'var(--color-green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              background: isChecked ? 'var(--color-green-light)' : 'var(--surface-app)',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Header Row */}
            <div 
              style={{ 
                padding: '12px 16px', 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer'
              }}
              onClick={() => toggleCheck(item.id)}
            >
              {/* Checkbox */}
              <div style={{ 
                marginTop: '2px',
                width: '20px', 
                height: '20px', 
                borderRadius: '4px',
                border: `2px solid ${isChecked ? 'var(--color-green)' : 'var(--border-dark)'}`,
                background: isChecked ? 'var(--color-green)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isChecked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>

              {/* Title & Status Indicator */}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: isChecked ? 'var(--text-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {item.title}
                  {item.status !== 'pending' && item.status !== 'info' && (
                    <span style={{ 
                      display: 'inline-block',
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%',
                      background: getStatusColor(item.status)
                    }} />
                  )}
                </div>
              </div>

              {/* Expand Toggle */}
              {item.details && (
                <button 
                  onClick={(e) => toggleExpand(item.id, e)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                >
                  <svg 
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              )}
            </div>

            {/* Details Section */}
            {isExpanded && item.details && (
              <div style={{ 
                padding: '12px 16px', 
                borderTop: '1px solid var(--border)',
                background: 'var(--surface-bg)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                <div style={{ marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  AI Verification Details
                </div>
                {item.details}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
