import React from 'react'

export default function Home({ setTab, t, lang }) {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>{t.hero.title}</h1>
            <p className="hero-sub">{t.hero.subtitle}</p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setTab('intake')}
              >
                <span>🎙️</span>
                <span>{t.hero.btnStart}</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setTab('schemes')}
              >
                <span>🔍</span>
                <span>{t.hero.btnBrowse}</span>
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <h3>{t.hero.stat1}</h3>
                <p>{t.hero.stat1Label}</p>
              </div>
              <div className="stat-item">
                <h3>{t.hero.stat2}</h3>
                <p>{t.hero.stat2Label}</p>
              </div>
              <div className="stat-item">
                <h3>{t.hero.stat3}</h3>
                <p>{t.hero.stat3Label}</p>
              </div>
            </div>
          </div>

          {/* Quick Voice Intake Card */}
          <div className="quick-widget">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
              {lang === 'en' ? 'Voice-First Intake' : 'குரல்வழி சேர்க்கை'}
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              {t.hero.micCta}
            </p>

            <button
              type="button"
              className="mic-hero-btn"
              onClick={() => setTab('intake')}
              title={t.intake.micStart}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
              {lang === 'en' ? 'Tap to speak your details' : 'தொடங்கி உங்கள் விவரங்களை கூறவும்'}
            </p>

            <div style={{ marginTop: '24px', background: '#F8FAFC', padding: '14px', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <strong>💡 {lang === 'en' ? 'Example phrase:' : 'எடுத்துக்காட்டு:'}</strong>
              <p style={{ marginTop: '4px', fontStyle: 'italic' }}>
                {lang === 'en' 
                  ? '"Completed 12th in govt school, family income 1.5 lakhs, girl student, BC category"'
                  : '"அரசுப் பள்ளியில் 12-ம் வகுப்பு முடித்தேன், குடும்ப வருமானம் 1.5 லட்சம், மாணவி, BC பிரிவு"'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Agent System */}
      <section className="section wrap">
        <div className="section-head" style={{ textAlign: 'center' }}>
          <h2>{lang === 'en' ? 'The SETU 4-Agent Architecture' : 'சேது (SETU) 4-முகவர் கட்டமைப்பு'}</h2>
          <p>{lang === 'en' ? 'Seamless coordination from student intake to application completion' : 'மாணவர் விவரங்கள் முதல் விண்ணப்பம் முடியும் வரை முழு வழிகாட்டுதல்'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎙️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>1. Intake Agent</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {lang === 'en' 
                ? 'Engages via voice (Tamil/English), text, or keypad numbers. Extracts income, standard, category and verifies before checking.'
                : 'தமிழ் மற்றும் ஆங்கில குரல், உரை மற்றும் எண்களைப் புரிந்து கொண்டு மாணவர் விவரங்களைப் பிழையின்றி தொகுக்கிறது.'}
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚖️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>2. Eligibility Agent</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Zero hallucination. Deterministic Python rules evaluate active government schemes. Shows exact criteria met and official gazette source.'
                : '100% துல்லியமான விதிமுறைகள். அரசின் வழிகாட்டுதலின்படி தகுதியை மட்டும் உறுதிசெய்து அதிகாரப்பூர்வ இணைப்புகளை வழங்குகிறது.'}
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📑</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>3. Application Agent</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Transforms bureaucratic chaos into an interactive checklist with e-Sevai guidance, bank NPCI seeding, and official portal links.'
                : 'தேவையான சான்றிதழ்கள், வங்கி கணக்கு இணைப்பு மற்றும் இணையத்தில் விண்ணப்பிக்கும் படிநிலைகளை எளிய தமிழில் வழங்குகிறது.'}
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏰</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>4. Follow-up Agent</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Monitors case inactivity. If an application stalls for >5 days, it automatically dispatches reminders and escalates to the teacher.'
                : '5 நாட்களுக்கு மேல் விண்ணப்பம் தேங்கினால், தானாக மாணவருக்கு நினைவூட்டி ஆசிரியரின் கவனத்திற்கு எச்சரிக்கை அனுப்புகிறது.'}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Verified Schemes */}
      <section className="section" style={{ background: '#FFFFFF', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2>{lang === 'en' ? 'Verified Government Schemes in SETU' : 'சேதுவில் உள்ள அரசு உதவித்தொகை திட்டங்கள்'}</h2>
              <p>{lang === 'en' ? 'Direct Benefit Transfer (DBT) schemes supported for Tamil Nadu & National students' : 'தமிழ்நாடு மற்றும் மத்திய அரசு வழங்கும் நேரடி வங்கி பணப்பரிவர்த்தனை திட்டங்கள்'}</p>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setTab('schemes')}>
              {lang === 'en' ? 'View All Schemes →' : 'அனைத்து திட்டங்கள் →'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF', background: '#DBEAFE', padding: '2px 8px', borderRadius: '4px' }}>Tamil Nadu Govt</span>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>₹1,000 / month</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px' }}>Pudhumai Penn Scheme</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Higher education assurance for girl students from TN government schools entering college/polytechnic.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF', background: '#DBEAFE', padding: '2px 8px', borderRadius: '4px' }}>Tamil Nadu Welfare</span>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>100% Fee Waiver</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px' }}>Post-Matric Scholarship (BC/MBC/SC/ST)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Full tuition fee waiver & maintenance grants for Class 11, 12, ITI, Diploma, and Degree courses.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6D28D9', background: '#EDE9FE', padding: '2px 8px', borderRadius: '4px' }}>Central Ministry</span>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>₹50,000 / year</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px' }}>AICTE Pragati Scholarship for Girls</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Direct financial grant for girls pursuing technical degree and diploma education.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
