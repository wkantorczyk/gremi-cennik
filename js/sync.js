let syncStatus = 'idle'
let _syncing = false

function updateSyncStatus(status) {
  syncStatus = status
  renderSyncStatusUI()
}

function renderSyncStatusUI() {
  const el = document.getElementById('sync-status-display')
  if (!el) return
  const icons = { ok: '🟢', error: '🔴', syncing: '⏳', idle: '⚪' }
  const icon = icons[syncStatus] || '⚪'
  const lastSync = state.settings.lastSync
  let timeStr = t('sync_never')
  if (lastSync) {
    const d = new Date(lastSync)
    timeStr = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0')
  }
  el.textContent = ''
  const iconSpan = document.createElement('span')
  iconSpan.className = 'sync-icon'
  iconSpan.textContent = icon
  const textSpan = document.createElement('span')
  textSpan.textContent = `${t('label_last_sync')}: ${timeStr}`
  el.appendChild(iconSpan)
  el.appendChild(textSpan)
}

async function syncNow() {
  if (_syncing) return
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return
  _syncing = true
  updateSyncStatus('syncing')
  try {
    const unsynced = await storage.getUnsyncedOrders()
    if (unsynced.length > 0) {
      await storage.pushOrdersToCloud(unsynced)
      await storage.markSynced(unsynced.map(o => o.id))
      state.orders = await storage.getOrders()
    }
    const products = await storage.getProducts()
    await storage.pushProductsToCloud(products)
    const pendingDeletes = await storage.getPendingDeletes()
    for (const id of pendingDeletes) {
      try { await storage.deleteOrderFromCloud(id); await storage.removePendingDelete(id) }
      catch(e) { /* retry next cycle */ }
    }
    state.settings.lastSync = Date.now()
    await storage.saveSettings(state.settings)
    updateSyncStatus('ok')
    fetchGlobalStats()
  } catch(e) {
    updateSyncStatus('error')
    showToast(t('toast_sync_error'))
  } finally {
    _syncing = false
  }
}

async function fetchGlobalStats() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    state.globalStats.status = 'no_config'
    renderGlobalStatsUI()
    return
  }
  state.globalStats.status = 'loading'
  renderGlobalStatsUI()
  try {
    const res = await fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/orders?select=count(),total.sum()`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    )
    if (!res.ok) throw new Error(res.statusText)
    const rows = await res.json()
    const row = rows[0] || {}
    state.globalStats.customers = Number(row.count) || 0
    state.globalStats.revenue = Number(row.sum) || 0
    state.globalStats.status = 'ok'
  } catch(e) {
    state.globalStats.status = 'error'
  }
  renderGlobalStatsUI()
}

function renderGlobalStatsUI() {
  const elC = document.getElementById('stat-global-customers')
  const elR = document.getElementById('stat-global-revenue')
  const elN = document.getElementById('stats-global-note')
  if (!elC || !elR || !elN) return
  const { customers, revenue, status } = state.globalStats
  if (status === 'ok') {
    elC.textContent = customers
    elR.textContent = formatMoney(revenue)
    elN.textContent = ''
  } else {
    elC.textContent = '—'
    elR.textContent = '—'
    const noteKeys = { loading: 'global_stats_loading', no_config: 'global_stats_no_config', error: 'global_stats_error', idle: '' }
    elN.textContent = noteKeys[status] ? t(noteKeys[status]) : ''
  }
}
