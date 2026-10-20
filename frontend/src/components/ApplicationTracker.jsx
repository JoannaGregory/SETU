import React, { useState } from 'react'
import { createCase, updateCaseStatus } from '../api'

export default function ApplicationTracker({ selectedScheme, profile, setTab, t, lang }) {
  const [checkedDocs, setCheckedDocs] = useState({})
  const [caseSubmitted, setCaseSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!selectedScheme) {
    return (
      <section className="section wrap">
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <h3>{lang === 'en' ? 'No Scheme Selected' : 'திட்டம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை'}</h3>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
            {lang === 'en' 
              ? 'Please select an eligible scholarship from the Eligibility Results tab first.' 
              : 'முதலில் தகுதி முடிவுகள் பக்கத்திலிருந்து ஒரு உதவித்தொகை திட்டத்தைத் தேர்ந்தெடுக்கவும்.'}
          </p>
          <button type="button" className="btn-primary" onClick={() => setTab('schemes')}>
            {t.nav.schemes} →
          </button>
        </div>
      </section>
    )
  }

  const docs = selectedScheme.documents || []
  const steps = selectedScheme.apply_steps || []
  const totalDocs = docs.length
  const readyCount = Object.values(checkedDocs).filter(Boolean).length
  const percent = totalDocs > 0 ? Math.round((readyCount / totalDocs) * 100) : 0

  function toggleDoc(docName) {
    setCheckedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName]
    }))
  }

  async function handleMarkSubmitted() {
    setLoading(true)
    await createCase({
      student_name: profile.name || 'Student Applicant',
      phone: '+91 94421 87654',
      state: profile.state || 'Tamil Nadu',
      scheme_id: selectedScheme.scheme_id,
      scheme_name: selectedScheme.name,
      notes: `Documentation ${percent}% complete. Submitted via SETU application guidance.`
    })
    setLoading(false)
    setCaseSubmitted(true)
  }

  return (
    <section className="section wrap">
      <div className="section-head">
        <h2>{t.tracker.title}</h2>
        <p>{t.tracker.subtitle}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
        {/* Left Side: Interactive Document Checklist */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF', background: '#DBEAFE', padding: '2px 8px', borderRadius: '4px' }}>
                {selectedScheme.scheme_id}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '6px' }}>
                {lang === 'ta' && selectedScheme.name_ta ? selectedScheme.name_ta : selectedScheme.name}
              </h3>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: '999px' }}>
              {percent}% {t.tracker.progress}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ background: '#E2E8F0', height: '10px', borderRadius: '999px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ background: percent === 100 ? '#10B981' : 'var(--primary)', height: '100%', width: `${percent}%`, transition: 'width 0.3s ease' }} />
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
            {lang === 'en' ? 'Mandatory Documents Checklist' : 'தேவையான சான்றிதழ்கள் பட்டியல்'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {docs.map((doc, idx) => {
              const isReady = !!checkedDocs[doc]
              return (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: isReady ? '#F0FDF4' : '#F8FAFC',
                    border: `1px solid ${isReady ? '#BBF7D0' : '#E2E8F0'}`,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isReady}
                    onChange={() => toggleDoc(doc)}
                    style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: isReady ? '#166534' : 'var(--text-main)' }}>
                      {doc}
                    </strong>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {doc.includes('Bank') || doc.includes('Aadhaar') 
                        ? 'Must be seeded with NPCI Aadhaar mapper for Direct Benefit Transfer'
                        : 'Available digitally via e-Sevai or DigiLocker'}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Official Helpline and Anti-fraud warning */}
          <div style={{ marginTop: '24px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px', fontSize: '0.82rem', color: '#991B1B' }}>
            <strong>🛡️ {t.tracker.freeWarning}</strong>
          </div>
        </div>

        {/* Right Side: Step-by-Step Walkthrough */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px' }}>
              {lang === 'en' ? 'Official Submission Steps' : 'அரசு தளத்தில் விண்ணப்பிக்கும் முறை'}
            </h4>

            <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              {steps.map((step, idx) => (
                <li key={idx} style={{ lineHeight: '1.5' }}>
                  {step}
                </li>
              ))}
            </ol>

            <div style={{ marginTop: '24px' }}>
              <a
                href={selectedScheme.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', marginBottom: '10px' }}
              >
                <span>🌐</span>
                <span>{lang === 'en' ? 'Open Official Web Portal' : 'அரசு தளத்தைத் திறக்க'} ↗</span>
              </a>

              {caseSubmitted ? (
                <div style={{ background: '#DCFCE7', color: '#166534', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                  ✓ {lang === 'en' ? 'Case Registered! Visible on Teacher Dashboard.' : 'விண்ணப்பம் பதிவு செய்யப்பட்டது! ஆசிரியர் பலகையில் கண்காணிக்கலாம்.'}
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleMarkSubmitted}
                  disabled={loading}
                >
                  {loading ? 'Registering Case...' : t.tracker.markApplied}
                </button>
              )}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>📞 {t.tracker.helpline}</h5>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              1800-425-1333 (Tamil Nadu e-Governance) • 0120-6619540 (National Scholarship Portal)
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
