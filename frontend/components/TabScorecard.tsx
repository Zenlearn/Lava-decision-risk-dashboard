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

            // Weighted (by WO) average, null-safe — a metric with no data for
            // some months just doesn't contribute to that average instead of
            // corrupting it.
            const wavg = (key: 'process' | 'skill' | 'audit' | 'overall') => {
              const valid = filteredRows.filter((r: any) => r[key] !== null && r[key] !== undefined);
              const w = valid.reduce((sum: number, r: any) => sum + r.wo, 0);
              return w > 0 ? valid.reduce((sum: number, r: any) => sum + r[key] * r.wo, 0) / w : null;
            };
            const totalWo = filteredRows.reduce((sum: number, r: any) => sum + r.wo, 0);
            const processAvg = wavg('process');
            const skillAvg = wavg('skill');
            const auditAvg = wavg('audit');
            const overallAvg = wavg('overall');
            const fmt1 = (v: number | null) => (v === null ? '—' : v.toFixed(1));

            return (
              <>
                <div className="grid-mock k4">
                  <div className="card-mock kpi-mock" style={{ borderTop: '3px solid #0f172a' }}>
                    <h3>Overall Score (Avg)</h3>
                    <div className="big">{fmt1(overallAvg)}</div>
                    <div className="sub">across period, {totalWo} WO</div>
                  </div>
                  <div className="card-mock kpi-mock">
                    <h3>Skill Score (Avg)</h3>
                    <div className="big">{fmt1(skillAvg)}</div>
                    <div className="sub">FTFR, MTTR, CPC, repeat-rate</div>
                  </div>
                  <div className="card-mock kpi-mock">
                    <h3>Process Score (Avg)</h3>
                    <div className="big">{fmt1(processAvg)}</div>
                    <div className="sub">TAT, S@H, MSM</div>
                  </div>
                  <div className="card-mock kpi-mock">
                    <h3>Audit Score (Avg)</h3>
                    <div className="big">{fmt1(auditAvg)}</div>
                    <div className="sub">Compliance, NPS, leakage flags</div>
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
                            <YAxis domain={[0, 100]} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="overall" name="Overall Score" stroke="#0f172a" strokeWidth={4} />
                            <Line type="monotone" dataKey="process" name="Process Score" stroke="#4E67EB" strokeWidth={2} />
                            <Line type="monotone" dataKey="skill" name="Skill Score" stroke="#294D89" strokeWidth={2} />
                            <Line type="monotone" dataKey="audit" name="Audit Score" stroke="#C0392B" strokeWidth={2} />
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

            // Null-safe, WO-weighted average — a score missing for some months
            // (e.g. no MSM data yet) just doesn't drag the average toward 0.
            const wavgList = (list: any[], key: 'process' | 'skill' | 'audit' | 'overall'): number | null => {
              const valid = list.filter((r) => r[key] !== null && r[key] !== undefined);
              const w = valid.reduce((s, r) => s + r.wo, 0);
              return w > 0 ? valid.reduce((s, r) => s + r[key] * r.wo, 0) / w : null;
            };

            const aggData = Array.from(groupedActors.entries()).map(([actName, list]) => {
              const totalWo = list.reduce((sum, r) => sum + r.wo, 0);
              return {
                actor: actName,
                wo: totalWo,
                process: wavgList(list, 'process'),
                skill: wavgList(list, 'skill'),
                audit: wavgList(list, 'audit'),
                overall: wavgList(list, 'overall'),
                ghost: list.reduce((sum, r) => sum + r.ghost, 0),
                home_board: list.reduce((sum, r) => sum + r.home_board, 0),
                cross: list.reduce((sum, r) => sum + r.cross, 0),
                bounce: list.reduce((sum, r) => sum + r.bounce, 0),
                mismatch: list.reduce((sum, r) => sum + r.mismatch, 0),
                detractor: list.reduce((sum, r) => sum + r.detractor, 0),
                doa: list.reduce((sum, r) => sum + r.doa, 0),
                conf: list.some((r) => r.conf === 'LOW') ? 'LOW' : 'OK',
              };
            }).sort((x, y) => (x.overall ?? 0) - (y.overall ?? 0));

            if (aggData.length === 0) {
              return <div className="card-mock">No comparative cohort data matching active filters.</div>;
            }

            const wAvgProcess = wavgList(aggData, 'process');
            const wAvgSkill = wavgList(aggData, 'skill');
            const wAvgAudit = wavgList(aggData, 'audit');
            const wAvgOverall = wavgList(aggData, 'overall');

            const rankDataSlice = aggData.slice(0, 12);
            const minScore = Math.min(...rankDataSlice.map((r) => r.overall ?? 0));

            return (
              <>
                <div className="grid-mock k2">
                  <div className="card-mock">
                    <h3>Cohort Average Standings</h3>
                    <div className="chart-box-mock">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Overall', score: wAvgOverall ?? 0 },
                            { name: 'Skill', score: wAvgSkill ?? 0 },
                            { name: 'Process', score: wAvgProcess ?? 0 },
                            { name: 'Audit', score: wAvgAudit ?? 0 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                            <XAxis dataKey="name" tickLine={false} />
                            <YAxis domain={[0, 100]} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                              <Cell fill="#0f172a" />
                              <Cell fill="#294D89" />
                              <Cell fill="#4E67EB" />
                              <Cell fill="#C0392B" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="card-mock">
                    <h3>Worst 12 Outliers by Overall Score</h3>
                    <div className="chart-box-mock">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={rankDataSlice}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line)" />
                            <XAxis type="number" domain={[Math.max(0, Math.floor(minScore - 3)), 100]} tickLine={false} />
                            <YAxis type="category" dataKey="actor" tickLine={false} width={130} />
                            <Tooltip />
                            <Bar dataKey="overall" radius={[0, 4, 4, 0]}>
                              {rankDataSlice.map((entry: any, index: number) => {
                                const v = entry.overall ?? 0;
                                const fill = v >= 70 ? '#1F9E6B' : v >= 50 ? '#D98A1F' : '#C0392B';
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
                          <th>Overall</th>
                          <th>Skill</th>
                          <th>Process</th>
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
                        {aggData.map((r, idx) => {
                          const pill = (v: number | null) => v === null
                            ? <span className="score-pill">—</span>
                            : <span className={`score-pill ${v >= 70 ? 's-good' : v >= 50 ? 's-warn' : 's-bad'}`}>{v.toFixed(1)}</span>;
                          return (
                            <tr key={idx}>
                              <td><b>{r.actor}</b></td>
                              <td>{pill(r.overall)}</td>
                              <td>{pill(r.skill)}</td>
                              <td>{pill(r.process)}</td>
                              <td>{pill(r.audit)}</td>
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
                          );
                        })}
                        {/* Highlighted Total Summary Row */}
                        {(() => {
                          const totWo = aggData.reduce((sum, r) => sum + r.wo, 0);
                          const totGhost = aggData.reduce((sum, r) => sum + r.ghost, 0);
                          const totHomeBoard = aggData.reduce((sum, r) => sum + r.home_board, 0);
                          const totCross = aggData.reduce((sum, r) => sum + r.cross, 0);
                          const totBounce = aggData.reduce((sum, r) => sum + r.bounce, 0);
                          const totMismatch = aggData.reduce((sum, r) => sum + r.mismatch, 0);
                          const totDetractor = aggData.reduce((sum, r) => sum + r.detractor, 0);
                          const totDoa = aggData.reduce((sum, r) => sum + r.doa, 0);
                          const avgOverall = wavgList(aggData, 'overall');
                          const avgSk = wavgList(aggData, 'skill');
                          const avgProc = wavgList(aggData, 'process');
                          const avgAud = wavgList(aggData, 'audit');
                          const fmt1 = (v: number | null) => (v === null ? '—' : v.toFixed(1));
                          return (
                            <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                              <td style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>TOTAL / AVERAGE</td>
                              <td><span className="score-pill s-good">{fmt1(avgOverall)}</span></td>
                              <td><span className="score-pill s-good">{fmt1(avgSk)}</span></td>
                              <td><span className="score-pill s-good">{fmt1(avgProc)}</span></td>
                              <td><span className="score-pill s-good">{fmt1(avgAud)}</span></td>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{totWo.toLocaleString('en-IN')}</td>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{totGhost}</td>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{totHomeBoard}</td>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{totCross}</td>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{totBounce}</td>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{totMismatch}</td>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{totDetractor}</td>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{totDoa}</td>
                              <td style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>AGGREGATE</td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Scoring methodology — replaces the old ad-hoc anomaly-threshold footer */}
      <div className="sec-title">
        <div className="bar"></div>
        <span>Scoring Methodology</span>
      </div>

      <div className="card-mock">
        <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
          Every BUSM, ASM, and ASP is scored monthly on three pillars, each built entirely from metrics already tracked
          elsewhere in this dashboard — nothing here is a separate, independently-collected number. Each pillar metric is
          converted to a <b>national percentile rank</b> (this ASP vs. every other ASP with data that month, 0–100, where
          100 means it outperformed the entire national cohort), then averaged into the pillar score. ASM and BUSM scores
          are the WO-weighted average of their constituent ASPs/ASMs for that month — not re-ranked independently — so a
          5-WO outlier can't move an ASM's number as much as a 500-WO center. A metric with no data for an ASP that month
          (e.g. MSM not yet imported) is simply left out of that ASP's average, never defaulted to 0 or 100.
        </p>

        <div className="tbl-wrap-mock">
          <table>
            <thead>
              <tr>
                <th>Pillar</th>
                <th>What it means</th>
                <th>Metric</th>
              </tr>
            </thead>
            <tbody>
              <tr><td rowSpan={4}><b>Skill</b><br /><span style={{ fontSize: '11px', color: '#64748b' }}>can this ASP actually fix the device?</span></td><td>Fixed right</td><td>FTFR (First-Time-Fix Rate)</td></tr>
              <tr><td>Fixed fast</td><td>MTTR (Mean Time to Repair)</td></tr>
              <tr><td>Fixed cheaply</td><td>CPC (Cost Per Call)</td></tr>
              <tr><td>Didn't come back</td><td>Repeat / bounce-IMEI rate</td></tr>

              <tr><td rowSpan={3} style={{ borderTop: '2px solid #e2e8f0' }}><b>Process</b><br /><span style={{ fontSize: '11px', color: '#64748b' }}>is the shop run the way Lava requires?</span></td><td style={{ borderTop: '2px solid #e2e8f0' }}>Closed on time</td><td style={{ borderTop: '2px solid #e2e8f0' }}>TAT 1–2 day closure %</td></tr>
              <tr><td>Kept appointments</td><td>S@H cancellation % / reschedule %</td></tr>
              <tr><td>Stayed within financial limits</td><td>MSM Achievement % (deposit/stock compliance)</td></tr>

              <tr><td rowSpan={3} style={{ borderTop: '2px solid #e2e8f0' }}><b>Audit</b><br /><span style={{ fontSize: '11px', color: '#64748b' }}>can we trust what this ASP reports?</span></td><td style={{ borderTop: '2px solid #e2e8f0' }}>Passed internal compliance checks</td><td style={{ borderTop: '2px solid #e2e8f0' }}>Compliance QC / ELS DOA / DEF(S+D) pass rate</td></tr>
              <tr><td>Told the truth (external, independent)</td><td>NPS</td></tr>
              <tr><td>No leakage / fraud red flags</td><td>Ghost-swap / Home-board / Cross-ASP flag rate</td></tr>
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '16px', marginBottom: 0 }}>
          <b>Overall Score = (Skill + Process + Audit) / 3</b> — the single number to track for standings and outlier review above.
        </p>
      </div>
    </div>
  );
}
