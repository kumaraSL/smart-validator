import { useState, useEffect, useCallback } from 'react';

type FileRecord = {
  documentId: string;
  name: string;
  category: string;
  storage_path: string;
  status: string;
  applicantName: string;
  date: string;
  raw_text?: string;
};

// ── Spinner ─────────────────────────────────────────────────────
const Spinner = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export function FileList() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/files');
      if (!res.ok) {
        const text = await res.text();
        let errMsg = `Failed to load: ${res.status}`;
        try {
          const json = JSON.parse(text);
          if (json.error) errMsg += ` - ${json.error}`;
        } catch {
          errMsg += ` - ${text}`;
        }
        throw new Error(errMsg);
      }
      const data: FileRecord[] = await res.json();
      setFiles(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (selectedFile) {
      setIsLoadingFile(true);
      setFileError(null);
      
      const url = `/api/files/download?path=${encodeURIComponent(selectedFile.storage_path)}`;
      fetch(url)
        .then(async res => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Failed to load file: HTTP ${res.status}`);
          }
          const blob = await res.blob();
          setFileUrl(URL.createObjectURL(blob));
        })
        .catch(e => {
          setFileError(e instanceof Error ? e.message : 'Unknown error');
        })
        .finally(() => {
          setIsLoadingFile(false);
        });
    } else {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
    }
    // Cleanup on unmount
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">ファイル一覧</h1>
          <p className="page-subtitle">アップロードされたすべての書類を一覧表示します</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <button className="btn-ghost" onClick={fetchFiles} disabled={isLoading}>
            {isLoading ? <Spinner size={14} /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Spinner size={32} />
            <span>Loading files...</span>
          </div>
        </div>
      ) : error ? (
        <div style={{
          background: 'var(--error-bg)', border: '1px solid var(--error)',
          borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)',
          color: 'var(--error)', fontSize: '14px', display: 'flex',
          alignItems: 'center', gap: 'var(--sp-2)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      ) : files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: '16px' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <p>保存されているファイルはありません。</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--sp-4)'
        }}>
          {files.map(file => (
            <div 
              key={file.documentId}
              onClick={() => setSelectedFile(file)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--sp-4)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-green)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                <div style={{ 
                  background: 'var(--info-bg)', 
                  color: 'var(--info)', 
                  padding: '10px', 
                  borderRadius: 'var(--radius-md)' 
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '15px', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    color: 'var(--text-primary)'
                  }} title={file.name}>
                    {file.name}
                  </h3>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{
                      background: 'var(--bg-body)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)'
                    }}>{file.category}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                marginTop: 'auto',
                paddingTop: 'var(--sp-3)', 
                borderTop: '1px solid var(--border)',
                fontSize: '13px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Applicant:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{file.applicantName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Date:</span>
                  <span>{new Date(file.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── File Viewer Modal ── */}
      {selectedFile && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--sp-4)'
        }} onClick={() => setSelectedFile(null)}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '1200px',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: 'var(--sp-4)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px' }}>{selectedFile.name}</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Applicant: {selectedFile.applicantName}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <a 
                  href={`/api/files/download?path=${encodeURIComponent(selectedFile.storage_path)}`}
                  download={selectedFile.name}
                  className="btn-ghost"
                  style={{ textDecoration: 'none' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download
                </a>
                <button 
                  onClick={() => setSelectedFile(null)}
                  style={{
                    border: 'none', cursor: 'pointer',
                    width: '36px', height: '36px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-body)', color: 'var(--text-primary)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: 1, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border)' }}>
                {isLoadingFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
                    <Spinner size={32} />
                    <span>Loading file content...</span>
                  </div>
                ) : fileError ? (
                  <div style={{ color: 'var(--error)', padding: '24px', textAlign: 'center' }}>
                    <h3>Failed to display file</h3>
                    <p>{fileError}</p>
                  </div>
                ) : fileUrl ? (
                  <iframe 
                    src={fileUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={selectedFile.name}
                  />
                ) : null}
              </div>
              <div style={{ width: '400px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--border)', background: 'var(--bg-body)', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  抽出テキスト (Extracted Text)
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4)', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                  {selectedFile.raw_text ? (
                    selectedFile.raw_text
                  ) : (
                    <div style={{ textAlign: 'center', marginTop: '40px', fontStyle: 'italic', opacity: 0.7 }}>
                      テキスト情報がありません。<br/>(No text extracted for this file)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
