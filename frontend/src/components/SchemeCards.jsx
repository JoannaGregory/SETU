import React, { useState } from 'react'

export default function SchemeCards({ schemes, setSelectedScheme, setTab, t, lang }) {
  const [activeTab, setActiveTab] = useState('eligible')

  const eligibleSchemes = schemes.filter((s) => s.eligible)
  const displaySchemes = activeTab === 'eligible' ? eligibleSchemes : schemes

  return (
    <section className="section wrap">
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>{t.schemes.title}</h2>
          <p>{t.schemes.subtitle}</p>
        </div>

        {/* Filter Toggle */}
        <div style={{ display: 'flex', background: '#E2E8F0', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            className="nav-btn"
            style={{
              background: activeTab === 'eligible' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'eligible' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'eligible' ? 'var(--shadow)' : 'none'
            }}
            onClick={() => setActiveTab('eligible')}
          >
            <span>✨</span>
            <span>{t.schemes.eligibleTab} ({eligibleSchemes.length})</span>
          </button>
          <button
            type="button"
            className="nav-btn"
            style={{
              background: activeTab === 'all' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'all' ? 'var(--shadow)' : 'none'
            }}
            onClick={() => setActiveTab('all')}
          >
            <span>📚</span>
            <span>{t.schemes.allTab} ({schemes.length})</span>
          </button>
        </div>
      </div>

      {displaySchemes.length === 0 ? (
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {t.schemes.noMatches}
          </p>
          <button type="button" className="btn-secondary" onClick={() => setActiveTab('all')}>
            {t.schemes.allTab}
          </button>
        </div>
      ) : (
        <div className="schemes-grid">
          {displaySchemes.map((scheme) => (
            <article
              key={scheme.scheme_id}
              className={`scheme-card ${scheme.eligible ? 'eligible' : 'ineligible'}`}
            >
              <div>
                <div className="scheme-card-top">
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px' }}>
                    {scheme.state === 'ALL' ? 'National / Central' : scheme.state}
                  </span>
                  <span className={scheme.eligible ? 'badge-complete' : 'badge-incomplete'}>
                    {scheme.eligible ? t.schemes.badgeEligible : t.schemes.badgeIneligible}
                  </span>
                </div>

                <h3 className="scheme-title">
                  {lang === 'ta' && scheme.name_ta ? scheme.name_ta : scheme.name}
                </h3>

                <div className="scheme-benefit">
                  💰 {lang === 'ta' && scheme.benefit_amount_ta ? scheme.benefit_amount_ta : scheme.benefit_amount}
                </div>

                {/* Criteria Conditions breakdown */}
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                  {t.schemes.conditionsTitle}
                </h4>
                <ul className="criteria-list">
                  {scheme.conditions.map((cond, i) => (
                    <li key={i} className={`criteria-item ${cond.met ? 'met' : 'unmet'}`}>
                      <span>{cond.met ? '✓' : '✗'}</span>
                      <span>{cond.description}</span>
                    </li>
                  ))}
                </ul>

                {/* Required Documents Pill Preview */}
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                  {t.schemes.docsTitle}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {scheme.documents.slice(0, 3).map((doc, idx) => (
                    <span key={idx} style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                      📄 {doc}
                    </span>
                  ))}
                  {scheme.documents.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '3px 4px' }}>
                      +{scheme.documents.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="scheme-meta">
                  <div><strong>{t.schemes.deadline}:</strong> {scheme.deadline}</div>
                  <div><strong>{t.schemes.source}:</strong> {scheme.source_authority}</div>
                  <div><strong>{t.schemes.lastVerified}:</strong> {scheme.last_verified}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  {scheme.eligible ? (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem', padding: '10px' }}
                      onClick={() => {
                        setSelectedScheme(scheme)
                        setTab('tracker')
                      }}
                    >
                      {t.schemes.btnApply}
                    </button>
                  ) : null}

                  <a
                    href={scheme.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ flex: scheme.eligible ? 'initial' : 1, textAlign: 'center', fontSize: '0.88rem', padding: '10px 14px', textDecoration: 'none' }}
                  >
                    {t.schemes.btnVisit} ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
