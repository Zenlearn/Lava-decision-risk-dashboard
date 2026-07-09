import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, ResponsiveContainer 
} from 'recharts';

interface TabScorecardProps {
  data: any;
  isMounted: boolean;
  uniqueMonths: string[];
}

export default function TabScorecard({ data, isMounted, uniqueMonths }: TabScorecardProps) {
  const [scMode, setScMode] = useState<'single' | 'cohort'>('single');
  const [scLevel, setScLevel] = useState<'busm' | 'asm' | 'asp'>('busm');
  const [actorSel, setActorSel] = useState<string>(data.busm[0]?.actor || '');
  const [fb, setFb] = useState<string>(''); // Filter by BUSM (cohort mode)
  const [fa, setFa] = useState<string>(''); // Filter by ASM (cohort mode)
  const [fm, setFm] = useState<string>(''); // Filter by month
  const [thrDrawer, setThrDrawer] = useState<{
    open: boolean;
    title: string;
    overStrict: any[];
    overP90: any[];
  }>({
    open: false,
    title: '',
    overStrict: [],
    overP90: [],
  });

  return (
    <div className="view-mock on">
      <div className="controls-mock">
        <div className="ctrl-mock">
          <label>View Mode</label>
          <div className="seg-mock">
            <button className={scMode === 'single' ? 'on' : ''} onClick={() => setScMode('single')}>Single Actor 360</button>
            <button className={scMode === 'cohort' ? 'on' : ''} onClick={() => setScMode('cohort')}>Compare Cohort</button>
          </div>
        </div>

        <div className="ctrl-mock">
          <label>Hierarchy Level</label>
          <div className="seg-mock">
            <button className={scLevel === 'busm' ? 'on' : ''} onClick={() => { setScLevel('busm'); setActorSel(data.busm[0]?.actor || ''); }}>BUSM</button>
            <button className={scLevel === 'asm' ? 'on' : ''} onClick={() => { setScLevel('asm'); setActorSel(data.asm[0]?.actor || ''); }}>ASM</button>
            <button className={scLevel === 'asp' ? 'on' : ''} onClick={() => { setScLevel('asp'); setActorSel(data.asp[0]?.actor || ''); }}>ASP</button>
          </div>
        </div>

        {scMode === 'single' ? (
          <div className="ctrl-mock">
            <label>Select Actor</label>
            <select className="filter-select" value={actorSel} onChange={(e) => setActorSel(e.target.value)}>
              {[...new Set(data[scLevel].map((r: any) => r.actor))].sort().map((name: any) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="ctrl-mock">
              <label>Filter by BUSM</label>
              <select className="filter-select" value={fb} onChange={(e) => { setFb(e.target.value); setFa(''); }}>
                <option value="">All</option>
                {Object.keys(data.hier).sort().map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="ctrl-mock">
              <label>Filter by ASM</label>
              <select className="filter-select" value={fa} onChange={(e) => setFa(e.target.value)}>
                <option value="">All</option>
                {fb && Object.keys(data.hier[fb] || {}).sort().map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="ctrl-mock">
          <label>Filter by Month</label>
          <select className="filter-select" value={fm} onChange={(e) => setFm(e.target.value)}>
            <option value="">All Months</option>
            {uniqueMonths.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Render Single Actor 360 View */}
      {scMode === 'single' && (
        <div id="singleView">
          {(() => {
            const actRows = data[scLevel].filter((r: any) => r.actor === actorSel);
            const filteredRows = fm ? actRows.filter((r: any) => r.month === fm) : actRows;
            if (filteredRows.length === 0) {
              return <div className="card-mock">No data available for this selection.</div>;
            }

            const totalWo = filteredRows.reduce((sum: number, r: any) => sum + r.wo, 0);
            const processAvg = filteredRows.reduce((sum: number, r: any) => sum + r.process * r.wo, 0) / totalWo;
            const skillAvg = filteredRows.reduce((sum: number, r: any) => sum + r.skill * r.wo, 0) / totalWo;
            const auditAvg = filteredRows.reduce((sum: number, r: any) => sum + r.audit * r.wo, 0) / totalWo;

            return (
              <>
                <div className="grid-mock k3">
                  <div className="card-mock kpi-mock">
                    <h3>Process Score (Avg)</h3>
                    <div className="big">{processAvg.toFixed(1)}</div>
                    <div className="sub">across period, {totalWo} WO</div>
                  </div>
                  <div className="card-mock kpi-mock">
                    <h3>Skill Score (Avg)</h3>
                    <div className="big">{skillAvg.toFixed(1)}</div>
                    <div className="sub">across period, {totalWo} WO</div>
                  </div>
                  <div className="card-mock kpi-mock">
                    <h3>Audit Score (Avg)</h3>
                    <div className="big">{auditAvg.toFixed(1)}</div>
                    <div className="sub">across period, {totalWo} WO</div>
                  </div>
                </div>

                <div className="grid-mock k2" style={{ marginTop: '16px' }}>
                  <div className="card-mock">
                    <h3>Score Trend - {actorSel}</h3>
                    <div className="chart-box-mock">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={actRows}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                            <XAxis dataKey="month" tickLine={false} />
                            <YAxis domain={[70, 100]} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="process" name="Process Score" stroke="#4E67EB" strokeWidth={3} />
                            <Line type="monotone" dataKey="skill" name="Skill Score" stroke="#294D89" strokeWidth={3} />
                            <Line type="monotone" dataKey="audit" name="Audit Score" stroke="#C0392B" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="card-mock">
                    <h3>Anomalous Flag Counts by Month</h3>
                    <div className="tbl-wrap-mock">
                      <table>
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>WO</th>
                            <th>Same-day Swap</th>
                            <th>Board@Home</th>
                            <th>Cross-ASP</th>
                            <th>Bounce</th>
                            <th>Mismatch</th>
                            <th>Detractor</th>
                            <th>DOA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRows.map((r: any, idx: number) => (
                            <tr key={idx}>
                              <td><b>{r.month}</b></td>
                              <td>{r.wo}</td>
                              <td>{r.ghost}</td>
                              <td>{r.home_board}</td>
                              <td>{r.cross}</td>
                              <td>{r.bounce}</td>
                              <td>{r.mismatch}</td>
                              <td>{r.detractor}</td>
                              <td>{r.doa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Render Cohort Comparative View */}
      {scMode === 'cohort' && (
        <div id="cohortView">
          {(() => {
            let filteredStats = data[scLevel].slice();
            if (fb) {
              if (scLevel === 'busm') filteredStats = filteredStats.filter((r: any) => r.actor === fb);
              else if (scLevel === 'asm') {
                const allowedAsms = Object.keys(data.hier[fb] || {});
                filteredStats = filteredStats.filter((r: any) => allowedAsms.includes(r.actor));
              } else {
                const allowedAsps: string[] = [];
                Object.values(data.hier[fb] || {}).forEach((arr: any) => allowedAsps.push(...arr));
                filteredStats = filteredStats.filter((r: any) => allowedAsps.includes(r.actor));
              }
            }
            if (fa && scLevel !== 'busm') {
              if (scLevel === 'asm') filteredStats = filteredStats.filter((r: any) => r.actor === fa);
              else {
                let allowedAsps: string[] = [];
                if (fb) allowedAsps = data.hier[fb]?.[fa] || [];
                else {
                  Object.keys(data.hier).forEach((b) => {
                    if (data.hier[b]?.[fa]) allowedAsps.push(...data.hier[b]![fa]!);
                  });
                }
                filteredStats = filteredStats.filter((r: any) => allowedAsps.includes(r.actor));
              }
            }
            if (fm) {
              filteredStats = filteredStats.filter((r: any) => r.month === fm);
            }

            // Group by Actor to aggregate multiple months
            const groupedActors = new Map<string, any[]>();
            filteredStats.forEach((r: any) => {
              const list = groupedActors.get(r.actor) || [];
              list.push(r);
              groupedActors.set(r.actor, list);
            });

            const aggData = Array.from(groupedActors.entries()).map(([actName, list]) => {
              const totalWo = list.reduce((sum, r) => sum + r.wo, 0);
              return {
                actor: actName,
                wo: totalWo,
                process: list.reduce((sum, r) => sum + r.process * r.wo, 0) / totalWo,
                skill: list.reduce((sum, r) => sum + r.skill * r.wo, 0) / totalWo,
                audit: list.reduce((sum, r) => sum + r.audit * r.wo, 0) / totalWo,
                ghost: list.reduce((sum, r) => sum + r.ghost, 0),
                home_board: list.reduce((sum, r) => sum + r.home_board, 0),
                cross: list.reduce((sum, r) => sum + r.cross, 0),
                bounce: list.reduce((sum, r) => sum + r.bounce, 0),
                mismatch: list.reduce((sum, r) => sum + r.mismatch, 0),
                detractor: list.reduce((sum, r) => sum + r.detractor, 0),
                doa: list.reduce((sum, r) => sum + r.doa, 0),
                conf: list.some((r) => r.conf === 'LOW') ? 'LOW' : 'OK',
              };
            }).sort((x, y) => x.audit - y.audit);

            if (aggData.length === 0) {
              return <div className="card-mock">No comparative cohort data matching active filters.</div>;
            }

            const totalCohortWo = aggData.reduce((sum, r) => sum + r.wo, 0);
            const wAvgProcess = aggData.reduce((sum, r) => sum + r.process * r.wo, 0) / totalCohortWo;
            const wAvgSkill = aggData.reduce((sum, r) => sum + r.skill * r.wo, 0) / totalCohortWo;
            const wAvgAudit = aggData.reduce((sum, r) => sum + r.audit * r.wo, 0) / totalCohortWo;

            const rankDataSlice = aggData.slice(0, 12);
            const minScore = Math.min(...rankDataSlice.map((r) => r.audit));

            return (
              <>
                <div className="grid-mock k2">
                  <div className="card-mock">
                    <h3>Cohort Average Standings</h3>
                    <div className="chart-box-mock">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Process', score: wAvgProcess },
                            { name: 'Skill', score: wAvgSkill },
                            { name: 'Audit', score: wAvgAudit }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                            <XAxis dataKey="name" tickLine={false} />
                            <YAxis domain={[75, 100]} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                              <Cell fill="#4E67EB" />
                              <Cell fill="#294D89" />
                              <Cell fill="#C0392B" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="card-mock">
                    <h3>Worst 12 Outliers by Audit Score</h3>
                    <div className="chart-box-mock">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={rankDataSlice}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line)" />
                            <XAxis type="number" domain={[Math.max(0, Math.floor(minScore - 3)), 100]} tickLine={false} />
                            <YAxis type="category" dataKey="actor" tickLine={false} width={130} />
                            <Tooltip />
                            <Bar dataKey="audit" radius={[0, 4, 4, 0]}>
                              {rankDataSlice.map((entry: any, index: number) => {
                                const fill = entry.audit >= 95 ? '#1F9E6B' : entry.audit >= 90 ? '#D98A1F' : '#C0392B';
                                return <Cell key={`cell-${index}`} fill={fill} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-mock" style={{ marginTop: '16px' }}>
                  <h3>{scLevel.toUpperCase()} Scorecard</h3>
                  <div className="tbl-wrap-mock">
                    <table>
                      <thead>
                        <tr>
                          <th>{scLevel.toUpperCase()} Name</th>
                          <th>Process</th>
                          <th>Skill</th>
                          <th>Audit</th>
                          <th>WO Count</th>
                          <th>Same-day Swap</th>
                          <th>Board@Home</th>
                          <th>Cross-ASP</th>
                          <th>Bounce</th>
                          <th>Mismatch</th>
                          <th>Detractor</th>
                          <th>DOA</th>
                          <th>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aggData.map((r, idx) => (
                          <tr key={idx}>
                            <td><b>{r.actor}</b></td>
                            <td><span className={`score-pill ${r.process >= 95 ? 's-good' : r.process >= 90 ? 's-warn' : 's-bad'}`}>{r.process.toFixed(1)}</span></td>
                            <td><span className={`score-pill ${r.skill >= 95 ? 's-good' : r.skill >= 90 ? 's-warn' : 's-bad'}`}>{r.skill.toFixed(1)}</span></td>
                            <td><span className={`score-pill ${r.audit >= 95 ? 's-good' : r.audit >= 90 ? 's-warn' : 's-bad'}`}>{r.audit.toFixed(1)}</span></td>
                            <td>{r.wo.toLocaleString('en-IN')}</td>
                            <td>{r.ghost}</td>
                            <td>{r.home_board}</td>
                            <td>{r.cross}</td>
                            <td>{r.bounce}</td>
                            <td>{r.mismatch}</td>
                            <td>{r.detractor}</td>
                            <td>{r.doa}</td>
                            <td>{r.conf === 'LOW' ? <span style={{ color: 'var(--bad)', fontWeight: 700 }}>LOW</span> : 'OK'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Outlier thresholds list drawer panel */}
      <div className="sec-title">
        <div className="bar"></div>
        <span>Cohort Risk Threshold Configurations</span>
      </div>
      
      <div className="card-mock">
        <table>
          <thead>
            <tr>
              <th>Anomalous Indicator</th>
              <th>Mean Rate (Typical)</th>
              <th>Spread (StdDev)</th>
              <th>Strict Threshold (Mean + 2SD)</th>
              <th>Watch Threshold (P90)</th>
              <th>Actors Over Strict Line</th>
              <th>Actors Over Watch Line</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.coaching[scLevel].thresholds).map(([key, t]: [string, any]) => (
              <tr key={key} style={{ cursor: 'pointer' }} onClick={() => setThrDrawer({ open: true, title: t.indicator, overStrict: t.over_strict, overP90: t.over_p90 })}>
                <td><b>{t.indicator}</b></td>
                <td>{t.mean}%</td>
                <td>{t.sd}</td>
                <td>{t.strict}%</td>
                <td>{t.p90}%</td>
                <td style={{ color: 'var(--bad)', fontWeight: 700 }}>{t.over_strict.length}</td>
                <td style={{ color: 'var(--warn)', fontWeight: 700 }}>{t.over_p90.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {thrDrawer.open && (
        <div className="drawer-mock open" style={{ marginTop: '16px', background: 'var(--ice)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <b style={{ color: 'var(--deep)', fontSize: '14px' }}>Outlier Details &mdash; {thrDrawer.title}</b>
            <button onClick={() => setThrDrawer({ open: false, title: '', overStrict: [], overP90: [] })} style={{ background: 'transparent', border: 'none', color: 'var(--bad)', cursor: 'pointer', fontWeight: 700 }}>[Close Details]</button>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <b style={{ fontSize: '12px', color: 'var(--bad)' }}>Over Strict Investigation Limit ({thrDrawer.overStrict.length})</b>
              <table style={{ marginTop: '8px' }}>
                <thead>
                  <tr><th>Name</th><th>Flagged Rate</th></tr>
                </thead>
                <tbody>
                  {thrDrawer.overStrict.length === 0 ? (
                    <tr><td colSpan={2}>None in this category.</td></tr>
                  ) : (
                    thrDrawer.overStrict.map((x: any, i: number) => (
                      <tr key={i}><td><b>{x.asm}</b></td><td>{x.rate}%</td></tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <b style={{ fontSize: '12px', color: 'var(--warn)' }}>Over P90 Watch Limit ({thrDrawer.overP90.length})</b>
              <table style={{ marginTop: '8px' }}>
                <thead>
                  <tr><th>Name</th><th>Flagged Rate</th></tr>
                </thead>
                <tbody>
                  {thrDrawer.overP90.length === 0 ? (
                    <tr><td colSpan={2}>None in this category.</td></tr>
                  ) : (
                    thrDrawer.overP90.map((x: any, i: number) => (
                      <tr key={i}><td><b>{x.asm}</b></td><td>{x.rate}%</td></tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
