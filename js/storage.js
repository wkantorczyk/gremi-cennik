function fetchWithTimeout(url, options, ms = 15000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...options, signal: ctrl.signal })
    .finally(() => clearTimeout(timer))
}

const KEYS = {
  orders: 'gremi_orders',
  catalog: 'gremi_catalog',
  settings: 'gremi_settings'
}

function trySet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) }
  catch(e) { showToast(t('error_storage')); throw e }
}

function tryGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null }
  catch(e) { return null }
}

const storage = {
  async saveOrder(order) {
    const orders = await this.getOrders()
    orders.unshift(order)
    trySet(KEYS.orders, orders)
  },
  async getOrders() {
    return tryGet(KEYS.orders) || []
  },
  async deleteOrder(id) {
    const orders = await this.getOrders()
    trySet(KEYS.orders, orders.filter(o => o.id !== id))
  },
  async getProducts() {
    return tryGet(KEYS.catalog) || []
  },
  async saveProducts(products) {
    trySet(KEYS.catalog, products)
  },
  async getSettings() {
    return tryGet(KEYS.settings) || {}
  },
  async saveSettings(settings) {
    trySet(KEYS.settings, settings)
  },
  async getUnsyncedOrders() {
    const orders = await this.getOrders()
    return orders.filter(o => !o.synced)
  },
  async markSynced(ids) {
    const orders = await this.getOrders()
    const idSet = new Set(ids)
    orders.forEach(o => { if (idSet.has(o.id)) o.synced = true })
    trySet(KEYS.orders, orders)
  },
  async pushOrdersToCloud(orders) {
    const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(orders.map(o => ({
        id: o.id, seller_id: o.sellerId, seller_name: o.sellerName,
        items: o.items, total: o.total, timestamp: o.timestamp
      })))
    })
    if (!res.ok) throw new Error(res.statusText)
  },
  async deleteOrderFromCloud(id) {
    const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    if (!res.ok) throw new Error(res.statusText)
  },
  async pushProductsToCloud(products) {
    const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify(products.map(p => ({
        id: p.id, name_pl: p.namePL, name_uk: p.nameUA
      })))
    })
    if (!res.ok) throw new Error(res.statusText)
  }
}
