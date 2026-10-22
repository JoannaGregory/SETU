import React, { useState, useEffect, useRef } from 'react'
import { sendIntakeMessage, confirmProfile, matchSchemes } from '../api'

export default function ChatIntake({ profile, setProfile, setMatchedSchemes, setTab, t, lang }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [listening, setListening] = useState(false)
  const [currentOptions, setCurrentOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [readyToConfirm, setReadyToConfirm] = useState(false)
  const chatEndRef = useRef(null)

  // Initialize session on mount
  useEffect(() => {
    initChat()
  }, [lang])

  // Auto‑scroll to latest bubble
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function initChat() {
    setLoading(true)
    const res = await sendIntakeMessage({
      sessionId: 'user-session',
      message: '',
      language: lang
    })
    setLoading(false)

    if (res) {
      setMessages([
        {
          sender: 'agent',
          text: lang === 'ta' ? res.reply_ta : res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
      setCurrentOptions(res.menu_options || [])
      setProfile(res.profile)
      setReadyToConfirm(res.ready_for_confirmation)
    }
  }

  // Whisper‑based audio capture (replaces Web Speech API)
  async function handleWhisper() {
    try {
      setListening(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []
      mediaRecorder.ondataavailable = e => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const form = new FormData()
        form.append('file', blob, 'audio.webm')
        form.append('language', lang)
        const resp = await fetch('/api/whisper', {
          method: 'POST',
          body: form
        })
        const data = await resp.json()
        const transcript = data.transcript || ''
        setInputText(transcript)
        handleUserMessage(transcript)
        setListening(false)
      }
      mediaRecorder.start()
      // Record for 2 seconds – adjust as needed
      setTimeout(() => mediaRecorder.stop(), 2000)
    } catch (err) {
      console.error('Whisper audio error:', err)
      setListening(false)
    }
  }

  async function handleUserMessage(text) {
    if (!text.trim()) return

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setLoading(true)

    const res = await sendIntakeMessage({
      sessionId: 'user-session',
      message: text,
      language: lang
    })
    setLoading(false)

    if (res) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: lang === 'ta' ? res.reply_ta : res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
      setCurrentOptions(res.menu_options || [])
      setProfile(res.profile)
      setReadyToConfirm(res.ready_for_confirmation)
    }
  }

  async function handleOptionClick(opt) {
    const userMsg = {
      sender: 'user',
      text: lang === 'ta' ? opt.label_ta : opt.label,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const res = await sendIntakeMessage({
      sessionId: 'user-session',
      menuChoice: opt.id,
      language: lang
    })
    setLoading(false)

    if (res) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: lang === 'ta' ? res.reply_ta : res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
      setCurrentOptions(res.menu_options || [])
      setProfile(res.profile)
      setReadyToConfirm(res.ready_for_confirmation)
    }
  }

  async function handleConfirmAndMatch() {
    setLoading(true)
    await confirmProfile(profile)
    const matchRes = await matchSchemes(profile)
    setLoading(false)

    if (matchRes && matchRes.schemes) {
      setMatchedSchemes(matchRes.schemes)
      setTab('schemes')
    }
  }

  async function handleReset() {
    await sendIntakeMessage({ sessionId: 'user-session', message: 'reset' })
    initChat()
  }

  const isComplete = profile.completed_class && profile.gender && profile.income && profile.category

  return (
    <section className="section wrap">
      <div className="section-head">
        <h2>{t.intake.title}</h2>
        <p>{t.intake.subtitle}</p>
      </div>

      <div className="intake-layout">
        {/* Chat Window */}
        <div className="chat-card">
          <div className="chat-header">
            <div className="chat-header-title">
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <span>SETU Intake Agent</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t.intake.btnReset}
            </button>
          </div>

          <div className="chat-body">
            {messages.map((m, idx) => (
              <div key={idx} className={`bubble ${m.sender}`}>
                <p>{m.text}</p>
                <div className="bubble-time">{m.time}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder={t.intake.placeholder}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUserMessage(inputText)}
              disabled={loading}
            />
            <button type="button" onClick={() => handleUserMessage(inputText)} disabled={loading}>
              {t.intake.sendBtn}
            </button>
            <button type="button" onClick={handleWhisper} disabled={listening} title="Speak (Whisper)">
              {listening ? '🎙️...' : '🎤'}
            </button>
          </div>
        </div>

        {/* Options / Quick Select */}
        {currentOptions.length > 0 && (
          <div className="options-panel">
            <h4>{t.intake.quickSelect}</h4>
            <ul>
              {currentOptions.map(opt => (
                <li key={opt.id} onClick={() => handleOptionClick(opt)}>{lang === 'ta' ? opt.label_ta : opt.label}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirmation */}
        {readyToConfirm && (
          <div className="confirm-panel">
            <button onClick={handleConfirmAndMatch}>{t.intake.confirmBtn}</button>
          </div>
        )}
      </div>
    </section>
  )
}
