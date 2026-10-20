import React, { useState, useEffect } from 'react'
import { fetchCases, triggerSkipDays, updateCaseStatus } from '../api'

export default function TeacherDashboard({ t, lang }) {
  const [cases, setCases] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [simulationLog, setSimulationLog] = useState(null)

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    setLoading(true)
    const data = await fetchCases()
    setCases(data || [])
    setLoading(false)
  }

  async function handleFastForward() {
    setLoading(true)
    const res = await triggerSkipDays(5)
    setLoading(false)

    if (res) {
      setSimulationLog(res)
      loadCases()
    }
  }

  async function handleAssist(caseId) {
    await updateCaseStatus(caseId, {
      status: 'DOCUMENTS_READY',
      notes: 'Teacher assisted with e-Sevai income certificate verification.',
      reset_inactivity: true
    })
    loadCases()
  }

  const stuckCases = cases.filter((c) => c.status === 'STUCK' || c.teacher_alert || c.days_inactive >= 5)
  const appliedCases = cases.filter((c) => c.status === 'APPLIED')

  const filteredCases = filter === 'ALL'
    ? cases
    : filter === 'STUCK'
    ? stuckCases
    : cases.filter((c) => c.status === filter)

  return (
    <section className="section wrap">
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>{t.dashboard.title}</h2>
          <p>{t.dashboard.subtitle}</p>
        </div>

        {/* Hackathon Judge Feature: Fast-Forward 5 Days */}
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            ⚡ {t.dashboard.badgeJudge}
          </span>
          <button
            type="button"
            className="btn-fast-forward"
            onClick={handleFastForward}
            disabled={loading}
          >
            <span>⏩</span>
            <span>{loading ? 'Simulating...' : t.dashboard.btnSkip}</span>
          </button>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      {simulationLog && (
        <div className="alert-banner">
          <div>
            <strong style={{ color: '#991B1B', fontSize: '0.95rem' }}>
              🚨 Follow-up Agent Wakeup Triggered: {simulationLog.message}
            </strong>
            <p style={{ fontSize: '0.82rem', color: '#B91C1C', marginTop: '4px' }}>
              {simulationLog.stuck_cases_count} cases now flagged as stuck (&gt;5 days inactive). {simulationLog.new_teacher_alerts} new teacher alerts dispatched.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSimulationLog(null)}
            style={{ background: 'transparent', border: 'none', color: '#991B1B', fontWeight: 700, cursor: 'pointer' }}
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t.dashboard.stuckCount}</span>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
            {stuckCases.length}
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: '4px' }}>
            Immediate teacher follow-up required
          </p>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t.dashboard.totalCount}</span>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            {cases.length}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across 5 schools in Thanjavur district
          </p>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t.dashboard.appliedCount}</span>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
            {appliedCases.length}
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#16A34A', marginTop: '4px' }}>
            Submitted to official portal
          </p>
        </div>
      </div>

      {/* Case Monitoring Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'STUCK', 'DOCUMENTS_PENDING', 'DOCUMENTS_READY', 'APPLIED'].map((st) => (
              <button
                key={st}
                type="button"
                className={`nav-btn ${filter === st ? 'active' : ''}`}
                onClick={() => setFilter(st)}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                {st}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadCases}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            🔄 Refresh
          </button>
        </div>

        <table className="styled-table">
          <thead>
            <tr>
              <th>{t.dashboard.colStudent}</th>
              <th>{t.dashboard.colScheme}</th>
              <th>{t.dashboard.colStatus}</th>
              <th>{t.dashboard.colInactive}</th>
              <th>{t.dashboard.colAlert}</th>
              <th>{t.dashboard.colAction}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => {
              const isStuck = c.status === 'STUCK' || c.teacher_alert || c.days_inactive >= 5
              return (
                <tr key={c.case_id} style={{ background: isStuck ? '#FEF2F2' : 'transparent' }}>
                  <td>
                    <strong>{c.student_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.scheme_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.case_id}</div>
                  </td>
                  <td>
                    <span className={`badge-status ${c.status.toLowerCase().replace('_', '')}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: c.days_inactive >= 5 ? '#DC2626' : 'inherit' }}>
                      {c.days_inactive} days
                    </strong>
                  </td>
                  <td>
                    {isStuck ? (
                      <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⚠️ {t.dashboard.alertActive}
                      </span>
                    ) : (
                      <span style={{ color: '#16A34A', fontSize: '0.8rem' }}>
                        ✓ {t.dashboard.alertNormal}
                      </span>
                    )}
                  </td>
                  <td>
                    {isStuck ? (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ fontSize: '0.78rem', padding: '6px 10px', background: '#DC2626' }}
                        onClick={() => handleAssist(c.case_id)}
                      >
                        {t.dashboard.btnResolve}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
