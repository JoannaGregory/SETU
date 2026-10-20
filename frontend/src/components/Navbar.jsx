import React from 'react'

export default function Navbar({ currentTab, setTab, lang, setLang, t }) {
  const tabs = [
    { id: 'home', label: t.nav.home, icon: '🏠' },
    { id: 'intake', label: t.nav.intake, icon: '🎙️' },
    { id: 'schemes', label: t.nav.schemes, icon: '🎓' },
    { id: 'tracker', label: t.nav.tracker, icon: '📋' },
    { id: 'dashboard', label: t.nav.dashboard, icon: '📊' },
    { id: 'admin', label: t.nav.admin, icon: '⚙️' }
  ]

  return (
    <header className="header">
      <div className="wrap nav-container">
        <a href="#home" onClick={(e) => { e.preventDefault(); setTab('home') }} className="brand">
          <img src="/logo.svg" width={38} height={38} alt="SETU Logo" />
          <span>{t.brand}</span>
          <span className="brand-badge">TEJAS 2026</span>
        </a>

        <ul className="nav-links">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className={`nav-btn ${currentTab === tab.id ? 'active' : ''}`}
                onClick={() => setTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <button
            type="button"
            className="lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            title="Toggle English / தமிழ்"
          >
            <span>🌐</span>
            <strong>{lang === 'en' ? 'தமிழ்' : 'English'}</strong>
          </button>
        </div>
      </div>
    </header>
  )
}
