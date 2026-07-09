import React from 'react';
import { UploadCloud, FileSpreadsheet, ChevronRight, RefreshCw } from 'lucide-react';

interface TabIngestProps {
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  uploading: boolean;
  uploadProgress: number;
  uploadResult: any;
  setUploadResult: (res: any) => void;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  triggerUpload: () => void;
  setActiveTab: (tab: string) => void;
}

export default function TabIngest({
  uploadFile,
  setUploadFile,
  uploading,
  uploadProgress,
  uploadResult,
  setUploadResult,
  dragActive,
  handleDrag,
  handleDrop,
  triggerUpload,
  setActiveTab
}: TabIngestProps) {
  return (
    <div className="view-mock on">
      <div className="sec-title">
        <div className="bar"></div>
        <span>Upload Month spreadsheet files</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', alignItems: 'center' }}>
        {!uploadResult && !uploading && (
          <div className="upload-card" style={{ marginTop: '1rem', width: '100%' }}>
            <div 
              className={`dropzone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <UploadCloud className="upload-icon" />
              <h3 className="upload-title">Drag and drop raw Excel/CSV file</h3>
              <p className="upload-subtitle">Upload spreadsheet file to update calculations.</p>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>or</span>
                <label className="btn-primary" style={{ cursor: 'pointer', margin: 0, backgroundColor: 'var(--cobalt)' }}>
                  Browse Files
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls" 
                    style={{ display: 'none' }} 
                    onChange={(e) => { if (e.target.files && e.target.files[0]) setUploadFile(e.target.files[0]); }}
                  />
                </label>
              </div>
            </div>

            {uploadFile && (
              <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: '8px', width: '100%', border: '1px solid var(--color-border)', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', textAlign: 'left' }}>
                  <FileSpreadsheet style={{ color: 'var(--cobalt)' }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{uploadFile.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={triggerUpload} className="btn-primary" style={{ backgroundColor: 'var(--cobalt)' }}>
                  Ingest & Score
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {uploading && (
          <div className="upload-card" style={{ marginTop: '1rem', width: '100%' }}>
            <RefreshCw className="upload-icon animate-spin" style={{ color: 'var(--cobalt)' }} />
            <h3 className="upload-title" style={{ marginTop: '0.5rem' }}>Processing Ingestion & Executing Rule Engine</h3>
            <p className="upload-subtitle" style={{ maxWidth: '450px', margin: '0 auto 1rem' }}>
              Parsing Excel rows, mapping fields, executing exception checking, and committing transaction logs.
            </p>
            <div className="upload-progress-bar">
              <div className="upload-progress-fill" style={{ width: `${uploadProgress}%`, backgroundColor: 'var(--cobalt)' }}></div>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cobalt)', marginTop: '0.5rem' }}>
              {uploadProgress}% Complete
            </span>
          </div>
        )}

        {uploadResult && !uploading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px' }}>
            <div className="upload-card" style={{ maxWidth: '100%', margin: 0, width: '100%' }}>
              <div className="success-overlay">
                <div className="success-icon" style={{ backgroundColor: 'rgba(31, 158, 107, 0.1)', color: 'var(--good)' }}>✔</div>
                <div style={{ textAlign: 'center' }}>
                  <h3 className="upload-title" style={{ fontSize: '1.3rem' }}>File Ingested Successfully</h3>
                  <p className="upload-subtitle">PostgreSQL database tables updated.</p>
                </div>

                <div className="success-grid">
                  <div className="success-item">
                    <span className="success-item-label">Dataset Filename</span>
                    <span className="success-item-val" style={{ fontSize: '0.95rem', wordBreak: 'break-all' }}>{uploadResult.filename}</span>
                  </div>
                  <div className="success-item">
                    <span className="success-item-label">Processed Workorders</span>
                    <span className="success-item-val">{(uploadResult?.validCount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="success-item">
                    <span className="success-item-label">High-Risk Anomalies</span>
                    <span className="success-item-val" style={{ color: 'var(--bad)' }}>{(uploadResult?.hitListCount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="success-item">
                    <span className="success-item-label">Total Execution Time</span>
                    <span className="success-item-val">{(uploadResult.processingMs / 1000).toFixed(2)}s</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setUploadResult(null);
                    setUploadFile(null);
                    setActiveTab('exec');
                  }} 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--cobalt)' }}
                >
                  Open Dashboard Panels
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
