const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok ? await res.json() : null
  } catch (err) {
    console.warn('Backend not responding to health check:', err)
    return null
  }
}

export async function sendIntakeMessage({ sessionId, message, menuChoice, fieldUpdates, language }) {
  try {
    const res = await fetch(`${API_BASE}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId || 'default',
        message,
        menu_choice: menuChoice,
        field_updates: fieldUpdates,
        language: language || 'en'
      })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Failed to send intake message:', err)
    return null
  }
}

export async function confirmProfile(profile) {
  try {
    const res = await fetch(`${API_BASE}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    })
    return res.ok ? await res.json() : null
  } catch (err) {
    console.error('Error confirming profile:', err)
    return null
  }
}

export async function matchSchemes(profile) {
  try {
    const res = await fetch(`${API_BASE}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Backend match unavailable, using deterministic local fallback:', err)
    return {
      connected: false,
      profile,
      eligible_count: 0,
      schemes: []
    }
  }
}

export async function fetchAllSchemes() {
  try {
    const res = await fetch(`${API_BASE}/schemes`)
    return res.ok ? await res.json() : []
  } catch (err) {
    console.error('Error fetching schemes:', err)
    return []
  }
}

export async function fetchSchemeDetails(schemeId) {
  try {
    const res = await fetch(`${API_BASE}/schemes/${schemeId}`)
    return res.ok ? await res.json() : null
  } catch (err) {
    console.error('Error fetching scheme details:', err)
    return null
  }
}

export async function fetchCases(status) {
  try {
    const url = status ? `${API_BASE}/cases?status=${status}` : `${API_BASE}/cases`
    const res = await fetch(url)
    return res.ok ? await res.json() : []
  } catch (err) {
    console.error('Error fetching cases:', err)
    return []
  }
}

export async function createCase(caseData) {
  try {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData)
    })
    return res.ok ? await res.json() : null
  } catch (err) {
    console.error('Error creating case:', err)
    return null
  }
}

export async function updateCaseStatus(caseId, updateData) {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    return res.ok ? await res.json() : null
  } catch (err) {
    console.error('Error updating case:', err)
    return null
  }
}

export async function triggerSkipDays(days = 5) {
  try {
    const res = await fetch(`${API_BASE}/demo/skip_days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days })
    })
    return res.ok ? await res.json() : null
  } catch (err) {
    console.error('Error triggering skip days:', err)
    return null
  }
}

export async function fetchAdminSchemes() {
  try {
    const res = await fetch(`${API_BASE}/admin/schemes`)
    return res.ok ? await res.json() : []
  } catch (err) {
    console.error('Error fetching admin schemes:', err)
    return []
  }
}

export async function updateAdminScheme(schemeId, updates) {
  try {
    const res = await fetch(`${API_BASE}/admin/schemes/${schemeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    return res.ok ? await res.json() : null
  } catch (err) {
    console.error('Error updating admin scheme:', err)
    return null
  }
}
