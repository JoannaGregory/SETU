import React, { useState, useEffect } from 'react'
import { fetchAdminSchemes, updateAdminScheme } from '../api'

export default function SchemeAdmin({ t, lang }) {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    loadSchemes()
  }, [])

  async function loadSchemes() {
    setLoading(true)
    const data = await fetchAdminSchemes()
    setSchemes(data || [])
    setLoading(false)
  }

  async function handleVerify(schemeId) {
    setLoading(true)
    const res = await updateAdminScheme(schemeId, {
      status: 'ACTIVE'
    })
    setLoading(false)
    if (res) {
      setNotification(`Scheme ${schemeId} re-verified and approved as ACTIVE for today.`)
      loadSchemes()
    }
  }

  async function handleExpire(schemeId) {
    setLoading(true)
    const res = await updateAdminScheme(schemeId, {
      status: 'EXPIRED'
    })
    setLoading(false)
    if (res) {
      setNotification(`Scheme ${schemeId} marked as EXPIRED. It will no longer be recommended to students.`)
      loadSchemes()
    }
  }

  return (
    <section className="section wrap">
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>{t.admin.title}</h2>
          <p>{t.admin.subtitle}</p>
        </div>
        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
          🔒 {t.admin.badgeSecurity}
        </span>
      </div>

      {notification && (
        <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', color: '#166534', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>✓ {notification}</span>
          <button type="button" onClick={() => setNotification(null)} style={{ background: 'transparent', border: 'none', color: '#166534', fontWeight: 700, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <strong style={{ fontSize: '0.95rem' }}>
            {lang === 'en' ? 'Database Audit Table (SQLite Seeded)' : 'அரசு திட்டங்கள் தணிக்கை அட்டவணை'}
          </strong>
          <button type="button" className="btn-secondary" onClick={loadSchemes} style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
            🔄 Refresh Schemes
          </button>
        </div>

        <table className="styled-table">
          <thead>
            <tr>
              <th>{t.admin.colId}</th>
              <th>{t.admin.colName}</th>
              <th>{t.admin.colLimit}</th>
              <th>{t.admin.colDeadline}</th>
              <th>{t.admin.colVerified}</th>
              <th>{t.admin.colStatus}</th>
              <th>{t.admin.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map((s) => (
              <tr key={s.scheme_id}>
                <td>
                  <code style={{ fontSize: '0.8rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                    {s.scheme_id}
                  </code>
                </td>
                <td>
                  <strong>{s.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.source_authority}</div>
                </td>
                <td>₹ {Number(s.income_limit).toLocaleString('en-IN')}</td>
                <td>{s.deadline}</td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                    📅 {s.last_verified}
                  </span>
                </td>
                <td>
                  <span className={`badge-status ${s.status === 'ACTIVE' ? 'ready' : 'stuck'}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#16A34A' }}
                      onClick={() => handleVerify(s.scheme_id)}
                      title="Verify and stamp with today's date"
                    >
                      ✓ {t.admin.btnVerify}
                    </button>
                    {s.status !== 'EXPIRED' && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#DC2626' }}
                        onClick={() => handleExpire(s.scheme_id)}
                      >
                        ✕ {t.admin.btnExpire}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
