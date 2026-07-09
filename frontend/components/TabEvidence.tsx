import React, { useState } from 'react';

interface TabEvidenceProps {
  data: any;
  uniqueMonths: string[];
  webhookStatus: string;
  handleSlackPush: () => void;
  evF: {
    flag: string;
    busm: string;
    asm: string;
    asp: string;
    month: string;
    search: string;
  };
  setEvF: (filters: any) => void;
}

export default function TabEvidence({
  data,
  uniqueMonths,
  webhookStatus,
  handleSlackPush,
  evF,
  setEvF
}: TabEvidenceProps) {
  return (
    <div className="view-mock on">
      <div className="controls-mock">
        <div className="ctrl-mock">
          <label>Filter Flag</label>
          <select className="filter-select" value={evF.flag} onChange={(e) => setEvF({ ...evF, flag: e.target.value })}>
            <option value="">All Anomalies</option>
            <option value="Same-day board swap (walk-in)">Same-day swaps</option>
            <option value="Board repair at home">Board at home</option>
            <option value="Cross-ASP IMEI">Cross-ASP</option>
            <option value="Mismatch that bounced">Mismatch bounced</option>
            <option value="Symptom-action mismatch">Symptom-action mismatch</option>
            <option value="Repeat bounce">Repeat Bounces</option>
          </select>
        </div>

        <div className="ctrl-mock">
          <label>Filter BUSM</label>
          <select className="filter-select" value={evF.busm} onChange={(e) => setEvF({ ...evF, busm: e.target.value, asm: '', asp: '' })}>
            <option value="">All</option>
            {Object.keys(data.hier).sort().map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="ctrl-mock">
          <label>Filter ASM</label>
          <select className="filter-select" value={evF.asm} onChange={(e) => setEvF({ ...evF, asm: e.target.value, asp: '' })}>
            <option value="">All</option>
            {evF.busm ? (
              Object.keys(data.hier[evF.busm] || {}).sort().map((name) => (
                <option key={name} value={name}>{name}</option>
              ))
            ) : (
              [...new Set(data.evidence.map((r: any) => r.asm))].sort().map((name: any) => (
                <option key={name} value={name}>{name}</option>
              ))
            )}
          </select>
        </div>

        <div className="ctrl-mock">
          <label>Filter ASP</label>
          <select className="filter-select" value={evF.asp} onChange={(e) => setEvF({ ...evF, asp: e.target.value })}>
            <option value="">All</option>
            {evF.asm ? (
              (data.hier[evF.busm]?.[evF.asm] || []).sort().map((name: string) => (
                <option key={name} value={name}>{name}</option>
              ))
            ) : (
              [...new Set(data.evidence.map((r: any) => r.asp))].sort().map((name: any) => (
                <option key={name} value={name}>{name}</option>
              ))
            )}
          </select>
        </div>

        <div className="ctrl-mock">
          <label>Filter Month</label>
          <select className="filter-select" value={evF.month} onChange={(e) => setEvF({ ...evF, month: e.target.value })}>
            <option value="">All Months</option>
            {uniqueMonths.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="ctrl-mock">
          <label>Text Search</label>
          <input 
            type="text" 
            value={evF.search} 
            onChange={(e) => setEvF({ ...evF, search: e.target.value })} 
            placeholder="Search workorder/model..." 
            style={{ minWidth: '180px' }} 
          />
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button 
            onClick={handleSlackPush} 
            className="btn-primary" 
            style={{ background: webhookStatus === 'success' ? 'var(--good)' : 'var(--cobalt)' }}
            disabled={webhookStatus === 'sending'}
          >
            {webhookStatus === 'idle' && 'Push Outliers to Slack'}
            {webhookStatus === 'sending' && 'Pushing...'}
            {webhookStatus === 'success' && 'Exceptions Pushed! ✅'}
          </button>
        </div>
      </div>

      {/* Evidence Logs Table */}
      {(() => {
        const rows = data.evidence.filter((r: any) => {
          if (evF.flag && r.flag !== evF.flag) return false;
          if (evF.busm && r.busm !== evF.busm) return false;
          if (evF.asm && r.asm !== evF.asm) return false;
          if (evF.asp && r.asp !== evF.asp) return false;
          if (evF.month && r.month !== evF.month) return false;
          if (evF.search) {
            const s = evF.search.toLowerCase();
            return (
              r.wo.toLowerCase().includes(s) ||
              r.model.toLowerCase().includes(s) ||
              r.symptom.toLowerCase().includes(s) ||
              r.asp.toLowerCase().includes(s) ||
              r.city.toLowerCase().includes(s)
            );
          }
          return true;
        });

        return (
          <div className="table-card">
            <div className="table-header-bar">
              <h3 className="chart-title">Anomalous Exception Workorders ({rows.length.toLocaleString('en-IN')} rows found)</h3>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Excel Row</th>
                    <th>Workorder ID</th>
                    <th>Anomaly Category</th>
                    <th>ASP Centre</th>
                    <th>Supervisor (ASM)</th>
                    <th>BUSM</th>
                    <th>Customer City</th>
                    <th>Created</th>
                    <th>Delivered</th>
                    <th>Mo</th>
                    <th>Device Model</th>
                    <th>Symptom</th>
                    <th>Action Taken</th>
                    <th>Part Swapped</th>
                    <th>TAT</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={15} style={{ textAlign: 'center', padding: '30px' }}>No exception rows matched active filters.</td></tr>
                  ) : (
                    rows.slice(0, 500).map((r: any, i: number) => {
                      const tagClass = r.flag.includes('Same-day') ? 'f-ghost' : (r.flag.includes('home') ? 'f-home' : 'f-cross');
                      return (
                        <tr key={i}>
                          <td><b>{r.row}</b></td>
                          <td style={{ fontWeight: 600, color: 'var(--cobalt)' }}>{r.wo}</td>
                          <td><span className={`flag-tag-mock ${tagClass}`}>{r.flag}</span></td>
                          <td>{r.asp}</td>
                          <td>{r.asm}</td>
                          <td>{r.busm}</td>
                          <td>{r.city}</td>
                          <td>{r.created || '–'}</td>
                          <td>{r.delivered || '–'}</td>
                          <td>{r.month}</td>
                          <td>{r.model}</td>
                          <td>{r.symptom}</td>
                          <td>{r.action}</td>
                          <td>{r.part || '–'}</td>
                          <td>{r.tat !== null ? `${r.tat} d` : '–'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {rows.length > 500 && (
              <div className="note-mock" style={{ padding: '12px', background: 'var(--ice)', margin: 0, borderRadius: '0 0 12px 12px' }}>
                Showing first 500 of {rows.length.toLocaleString('en-IN')} matches. Refine filter selections to view specific cohorts.
              </div>
            )}
          </div>
        );
      })()}

      <div className="glossary-mock">
        <b>TAT</b> = Turnaround Time in days (creation to delivery) &bull; 
        <b> Excel Row</b> = Row index in source Excel spreadsheet for auditing &bull; 
        <b> Same-day board swap</b> = Board swap Consumed on same day walk-in visit.
      </div>
    </div>
  );
}
