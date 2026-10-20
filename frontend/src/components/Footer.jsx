import React from 'react'

export default function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-content">
          <div>
            <div className="footer-brand">
              <img src="/logo.svg" width={28} height={28} alt="" />
              <span>{t.brand}</span>
            </div>
            <p style={{ maxWidth: '540px', lineHeight: '1.6', marginBottom: '14px' }}>
              {t.footer.about}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
              🛡️ {t.footer.privacy}
            </p>
          </div>
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '12px', fontSize: '0.95rem' }}>Global & National Alignment</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              {t.footer.sdg}
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94A3B8' }}>
                Tamil Nadu e-Governance
              </span>
              <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94A3B8' }}>
                National Scholarship Portal
              </span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 SETU • Built for SASTRA / Temenos TEJAS 2026 Grand Finale • Team TEJAS022</p>
        </div>
      </div>
    </footer>
  )
}
