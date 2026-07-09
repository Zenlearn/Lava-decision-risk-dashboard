import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

interface TabCoachingProps {
  data: any;
  isMounted: boolean;
  cLevel: 'busm' | 'asm' | 'asp';
  setCLevel: (level: 'busm' | 'asm' | 'asp') => void;
  cActor: string;
  setCActor: (actor: string) => void;
  nominated: Map<string, any>;
  handleNominate: (actor: string, card: any) => void;
  handleBulkNominate: () => void;
  handleDownloadNominations: () => void;
  setNominated: (map: Map<string, any>) => void;
  triggerCoachingJump: (flag: string, actor: string) => void;
}

const STD_SCRIPTS = {
  ghost: {
    title: 'Same-day board swap (walk-in)',
    open: '"On these jobs, a high-value board part (PCBA/LCD) was billed on a walk-in and closed the same day. Walk me through how that\'s possible in one visit."',
    ask: [
      'Do you stock LCD/PCB boards at this centre? Show me the stock register.',
      'For these workorders, where is the defective board that was removed - is it in the return batch to Lava?',
      'Was the customer\'s device opened, diagnosed, and the board fitted in a single sitting? Who did it?'
    ],
    good: 'A genuine case: the ASP stocks the board, the old board is in the return log, and the repair is documented. That is fast, good service - acknowledge it.',
    watch: 'A concern: board billed, no matching return, no local stock. That needs escalation to the audit desk before any conclusion.'
  },
  home: {
    title: 'Board repair at home',
    open: '"Policy says major / board-level repairs go back to the ASP workshop - software and L1-L2 only at the doorstep. These were board jobs logged at home. Help me understand."',
    ask: [
      'Which technician logged the board replacement at the customer\'s address?',
      'Was the device actually carried back to the ASP and the system entry just made under a home visit?',
      'Do field kits at this centre carry board-level spares? They are not supposed to.'
    ],
    good: 'Sometimes the entry is a tagging error - the job was done at the ASP but logged under the home channel. Fixable with correct tagging.',
    watch: 'If boards are genuinely being swapped in the field without workshop tools, repair quality and warranty integrity are both at risk.'
  },
  cross: {
    title: 'Cross-ASP device collision',
    open: '"The same device (same IMEI) appears at two different service centres. Let\'s look at why a customer would go to two ASPs."',
    ask: [
      'Did the customer visit a second centre because the first repair did not hold?',
      'Or was the same IMEI used to book claims at two centres? Pull both workorders.',
      'Are both entries for the same genuine fault, or different symptoms?'
    ],
    good: 'Legitimate: a customer travelled, or sought a second opinion after an unresolved fault. That points to a quality issue at the first centre, not misconduct.',
    watch: 'Concern: same IMEI used to draw parts or claims at multiple centres. Cross-check the part-return log for both.'
  },
  bounce: {
    title: 'Repeat bounce (same device returns)',
    open: '"This device came back again after we said it was fixed. A repeat visit costs us money and annoys the customer. What happened on the first repair?"',
    ask: [
      'Was the root cause actually identified the first time, or was it a hit-and-trial part swap?',
      'Did the same technician handle both visits? What did they change the second time?',
      'Is this model showing a pattern of repeat bounces here?'
    ],
    good: 'A genuinely new, unrelated fault on the second visit is not a skill issue - confirm the symptoms differ.',
    watch: 'Same symptom bouncing back means the first diagnosis was wrong. This is a training signal - route to the Judgment Uplift Program.'
  },
  mmb: {
    title: 'Mismatch that bounced',
    open: '"A hardware symptom was closed with a software-only action, and then the device came back. The software fix did not hold. Let\'s review the diagnosis."',
    ask: [
      'What was the actual root cause? Was a hardware check (e.g. PCB resistance) done before closing on software?',
      'Was this a real No-Fault-Found, or was a hardware fault missed?',
      'Would a root-cause check (per the training: camera fault to IC short) have caught it?'
    ],
    good: 'A software fix for a software-rooted symptom is correct even if labelled hardware - confirm the root cause was genuinely software.',
    watch: 'If a hardware fault was closed on software and bounced, that is a diagnostic gap - the exact thing structured training fixes.'
  },
  det: {
    title: 'Detractor ratings (1-3)',
    open: '"These customers rated us 1 to 3 after the service. Let\'s look at what drove the low scores at this centre."',
    ask: [
      'Is there a common theme - delay, behaviour, repair not fixing the issue?',
      'Were these the repeat-visit customers, or first-time?',
      'What did the closing remarks say on these jobs?'
    ],
    good: 'A low score from an out-of-scope or out-of-warranty expectation gap is a communication fix, not a repair-quality one.',
    watch: 'Clustered detractors on one technician or one symptom point to a specific, coachable behaviour.'
  },
  doa: {
    title: 'DOA (dead on arrival)',
    open: '"These were logged as dead-on-arrival - failed at first use out of the box. This is a product/supply signal, not a service one, but we track it."',
    ask: [
      'Were these confirmed as true out-of-box failures, or later failures mis-tagged as DOA?',
      'Is one model or batch over-represented?'
    ],
    good: 'Genuine DOA is a manufacturing matter - route the pattern to the product/quality team, not the technician.',
    watch: 'If non-DOA failures are being tagged DOA to speed replacement, that is a process-discipline issue worth a quiet check.'
  }
};

export default function TabCoaching({
  data,
  isMounted,
  cLevel,
  setCLevel,
  cActor,
  setCActor,
  nominated,
  handleNominate,
  handleBulkNominate,
  handleDownloadNominations,
  setNominated,
  triggerCoachingJump
}: TabCoachingProps) {
  const card = data.coaching[cLevel].cards[cActor];
  if (!card) return <div className="card-mock">No coaching details loaded.</div>;

  const avgAudit = card.trend.reduce((sum: number, r: any) => sum + r.audit, 0) / card.trend.length;
  const avgSkill = card.trend.reduce((sum: number, r: any) => sum + r.skill, 0) / card.trend.length;
  const avgProcess = card.trend.reduce((sum: number, r: any) => sum + r.process, 0) / card.trend.length;

  const isNominated = nominated.has(`${cLevel}:${cActor}`);

  return (
    <div className="view-mock on">
      <div className="controls-mock">
        <div className="ctrl-mock">
          <label>Coaching Focus</label>
          <div className="seg-mock">
            <button className={cLevel === 'asm' ? 'on' : ''} onClick={() => { setCLevel('asm'); const keys = Object.keys(data.coaching.asm.cards).sort(); setCActor(keys[0] || ''); }}>ASM</button>
            <button className={cLevel === 'asp' ? 'on' : ''} onClick={() => { setCLevel('asp'); const keys = Object.keys(data.coaching.asp.cards).sort(); setCActor(keys[0] || ''); }}>ASP</button>
            <button className={cLevel === 'busm' ? 'on' : ''} onClick={() => { setCLevel('busm'); const keys = Object.keys(data.coaching.busm.cards).sort(); setCActor(keys[0] || ''); }}>BUSM</button>
          </div>
        </div>

        <div className="ctrl-mock">
          <label>Select Staff Member</label>
          <select className="filter-select" value={cActor} onChange={(e) => setCActor(e.target.value)}>
            {Object.keys(data.coaching[cLevel].cards).sort().map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button onClick={handleBulkNominate} className="btn-primary" style={{ background: 'var(--deep)' }}>Bulk Nominate P90+ Outliers</button>
        </div>
      </div>

      <div id="coachCard">
        <div className="grid-mock k2">
          <div className="card-mock">
            <h3>{cActor} &mdash; Score Trend Summary</h3>
            <div className="chart-box-mock" style={{ height: '240px' }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={card.trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="month" tickLine={false} />
                    <YAxis domain={[80, 100]} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="audit" name="Audit" stroke="#C0392B" strokeWidth={3} />
                    <Line type="monotone" dataKey="skill" name="Skill" stroke="#294D89" strokeWidth={3} />
                    <Line type="monotone" dataKey="process" name="Process" stroke="#4E67EB" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            {!card.qualifies && (
              <div className="note-mock" style={{ color: 'var(--bad)' }}>Low volume ({card.wo} WO) &mdash; ranking percentile values suppressed.</div>
            )}
          </div>

          <div className="card-mock">
            <h3>How {cActor} Compares to Cohort Average</h3>
            {[
              { label: 'Audit Score', val: avgAudit, mean: card.cohort_mean.audit, pct: card.pct.audit },
              { label: 'Skill Score', val: avgSkill, mean: card.cohort_mean.skill, pct: card.pct.skill },
              { label: 'Process Score', val: avgProcess, mean: card.cohort_mean.process, pct: card.pct.process },
            ].map((bar, i) => {
              const scorePct = Math.max(0, Math.min(100, (bar.val - 80) / 20 * 100));
              const meanPct = Math.max(0, Math.min(100, (bar.mean - 80) / 20 * 100));
              const barColor = bar.val >= 95 ? 'var(--good)' : (bar.val >= 90 ? 'var(--warn)' : 'var(--bad)');

              return (
                <div key={i} style={{ margin: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                    <span><b>{bar.label}:</b> {bar.val.toFixed(1)}</span>
                    <span style={{ color: 'var(--muted)' }}>cohort average {bar.mean.toFixed(1)} &bull; better than {bar.pct}% of peers</span>
                  </div>
                  <div style={{ position: 'relative', height: '14px', background: '#EEF2FC', borderRadius: '7px' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '14px', width: `${scorePct}%`, backgroundColor: barColor, borderRadius: '7px' }}></div>
                    <div style={{ position: 'absolute', left: `${meanPct}%`, top: '-3px', height: '20px', width: '2px', backgroundColor: 'var(--ink)' }} title="cohort average"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flag highlights panel */}
        <div className="card-mock" style={{ marginTop: '16px' }}>
          <h3>Anomalous Flag Highlights &mdash; Click arrows to drill down in Evidence Logs</h3>
          <div className="grid-mock k4">
            {[
              { label: 'Same-day swaps', count: card.flags.ghost, flagName: 'Same-day board swap (walk-in)' },
              { label: 'Board repairs at home', count: card.flags.home, flagName: 'Board repair at home' },
              { label: 'Cross-ASP device collisions', count: card.flags.cross, flagName: 'Cross-ASP IMEI' },
              { label: 'Repeat bounces', count: card.flags.bounce, flagName: 'Repeat bounce' },
              { label: 'Mismatch bounced', count: card.flags.mmb, flagName: 'Mismatch that bounced' },
              { label: 'NPS Detractors', count: card.flags.det },
              { label: 'DOA cases', count: card.flags.doa },
            ].map((f, i) => (
              <div className="card-mock kpi-mock" key={i} style={{ padding: '13px 15px' }}>
                <div className="big" style={{ fontSize: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {f.count}
                  {f.flagName && f.count > 0 && (
                    <button 
                      onClick={() => triggerCoachingJump(f.flagName, cActor)} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--cobalt)', fontWeight: 800 }}
                    >
                      &rarr;
                    </button>
                  )}
                </div>
                <div className="sub">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Talk tracks */}
        <div className="card-mock" style={{ marginTop: '16px' }}>
          <h3>Target Talking Points for 1:1 Review Sessions</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {card.talking_points.map((tp: any, idx: number) => {
              const borderCol = tp.sev === 'high' ? 'var(--bad)' : (tp.sev === 'mid' ? 'var(--warn)' : 'var(--good)');
              return (
                <li key={idx} style={{ padding: '9px 12px', margin: '6px 0', borderLeft: `4px solid ${borderCol}`, background: 'var(--ice)', borderRadius: '0 7px 7px 0', fontSize: '13px' }}>
                  {tp.text}
                </li>
              );
            })}
          </ul>
          <button 
            onClick={() => handleNominate(cActor, card)} 
            className="btn-primary" 
            style={{ marginTop: '12px', background: isNominated ? 'var(--bad)' : 'var(--mid)', color: '#fff' }}
          >
            {isNominated ? `Remove ${cActor} from Uplift Program` : `Nominate ${cActor} for Judgment Uplift Program`}
          </button>
        </div>
      </div>

      {/* Reusable standard conversation scripts */}
      <div className="card-mock" style={{ marginTop: '16px' }}>
        <h3>Standard Coaching Playbooks &mdash; How to address anomalous metrics with ASPs</h3>
        <p className="note-mock">Use these playbooks as starting talk tracks when discussing flagged workorders.</p>
        
        {Object.entries(STD_SCRIPTS).map(([key, s]) => (
          <details key={key} style={{ margin: '8px 0', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--deep)' }}>{s.title}</summary>
            <div style={{ fontSize: '13px', lineHeight: 1.7, marginTop: '8px' }}>
              <p><b>Opening script line:</b> <span style={{ color: 'var(--muted)' }}>{s.open}</span></p>
              <p><b>Verification questions:</b></p>
              <ul style={{ marginLeft: '18px' }}>
                {s.ask.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
              <p style={{ color: 'var(--good)' }}><b>Action track if valid:</b> {s.good}</p>
              <p style={{ color: 'var(--bad)' }}><b>Action track if suspect:</b> {s.watch}</p>
            </div>
          </details>
        ))}
      </div>

      {/* Nominations tracker */}
      <div className="sec-title">
        <div className="bar"></div>
        <span>Uplift Program Nominations Tracker ({nominated.size})</span>
      </div>

      <div className="card-mock">
        <p className="note-mock" style={{ marginBottom: '12px' }}>Track outliers designated for custom training. Nominated list is exportable.</p>
        
        {nominated.size > 0 ? (
          <>
            <div style={{ marginBottom: '12px' }}>
              <button onClick={handleDownloadNominations} className="btn-primary" style={{ marginRight: '8px' }}>Export List (CSV)</button>
              <button onClick={() => setNominated(new Map())} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--bad)', color: 'var(--bad)' }}>Reset Tracker</button>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Staff Level</th>
                  <th>Name</th>
                  <th>Designated Exception Gaps</th>
                  <th>Audit Avg</th>
                  <th>Skill Avg</th>
                  <th>Process Avg</th>
                  <th>WO Volume</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {Array.from(nominated.values()).map((x, idx) => (
                  <tr key={idx}>
                    <td>{x.level}</td>
                    <td><b>{x.actor}</b></td>
                    <td>{x.reason}</td>
                    <td>{x.audit}</td>
                    <td>{x.skill}</td>
                    <td>{x.process}</td>
                    <td>{x.wo}</td>
                    <td>
                      <button onClick={() => {
                        const nextMap = new Map(nominated);
                        nextMap.delete(`${x.level.toLowerCase()}:${x.actor}`);
                        setNominated(nextMap);
                      }} style={{ background: 'transparent', border: 'none', color: 'var(--bad)', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="note-mock" style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>No active nominations. Use the action button inside any staff member's coaching card to register them for training.</p>
        )}
      </div>
    </div>
  );
}
