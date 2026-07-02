function renderOrderTab() {
  const list = document.getElementById('product-list')
  const sorted = getSortedProducts()
  if (sorted.length === 0) {
    list.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>'
    return
  }
  list.innerHTML = sorted.map(p => {
    const qty = state.cart[p.id] || 0
    return `
      <div class="product-row" data-product-id="${p.id}">
        <div class="product-info">
          <div class="product-name">${escHtml(pName(p))}</div>
          <div class="product-price">${formatMoney(p.price)}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" data-qty-btn data-id="${p.id}" data-dir="dec">−</button>
          <span class="qty-value${qty > 0 ? ' nonzero' : ''}">${qty}</span>
          <button class="qty-btn" data-qty-btn data-id="${p.id}" data-dir="inc">+</button>
        </div>
      </div>
    `
  }).join('')
  renderSuma()
}

function renderSuma() {
  let total = 0
  for (const [id, qty] of Object.entries(state.cart)) {
    const p = state.products.find(p => p.id === id)
    if (p && qty > 0) total += p.price * qty
  }
  document.getElementById('suma-value').textContent = formatMoney(total)
}

document.getElementById('product-list').addEventListener('click', e => {
  const btn = e.target.closest('[data-qty-btn]')
  if (!btn) return
  const id = btn.dataset.id
  const delta = btn.dataset.dir === 'inc' ? 1 : -1
  state.cart[id] = Math.max(0, (state.cart[id] || 0) + delta)
  const row = document.querySelector(`[data-product-id="${id}"]`)
  if (row) {
    const qv = row.querySelector('.qty-value')
    qv.textContent = state.cart[id]
    qv.className = 'qty-value' + (state.cart[id] > 0 ? ' nonzero' : '')
  }
  renderSuma()
})

document.getElementById('btn-wydano').addEventListener('click', () => {
  const items = Object.entries(state.cart)
    .filter(([id, qty]) => qty > 0)
    .map(([id, qty]) => {
      const p = state.products.find(p => p.id === id)
      return p ? { productId: id, name: pName(p), price: p.price, qty } : null
    })
    .filter(Boolean)

  if (items.length === 0) {
    showToast(t('toast_empty'))
    return
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const itemsHtml = items.map(i =>
    `<div class="modal-item"><span>${escHtml(i.name)} ×${i.qty}</span><span>${formatMoney(i.price * i.qty)}</span></div>`
  ).join('')
  const totalHtml = `<div class="modal-total"><span>${t('label_total')}</span><span>${formatMoney(total)}</span></div>`

  showConfirm({
    title: t('confirm_wydano'),
    body: itemsHtml + totalHtml,
    confirmText: t('btn_confirm'),
    cancelText: t('btn_cancel'),
    onConfirm: async () => {
      const order = {
        id: genId(),
        sellerId: state.settings.sellerId,
        sellerName: state.settings.sellerName || '',
        items,
        total,
        timestamp: Date.now(),
        synced: false
      }
      await storage.saveOrder(order)
      state.orders = await storage.getOrders()
      state.cart = {}
      renderOrderTab()
      renderSuma()
      showToast(t('toast_saved'))
      syncNow()
    }
  })
})

function renderHistoryTab() {
  const list = document.getElementById('history-list')
  if (state.orders.length === 0) {
    list.innerHTML = '<div class="empty-state">' + t('no_orders') + '</div>'
    return
  }
  list.innerHTML = state.orders.map((order, idx) => {
    const num = state.orders.length - idx
    return `
      <div class="order-row" data-order-id="${order.id}">
        <div class="order-info">
          <div class="order-title">${t('order_prefix')} #${num}</div>
          <div class="order-time">${formatTimestamp(order.timestamp)}</div>
        </div>
        <div class="order-total">${formatMoney(order.total)}</div>
        <button class="order-delete" data-delete-order="${order.id}" title="Usuń">✕</button>
      </div>
    `
  }).join('')
}

document.getElementById('history-list').addEventListener('click', e => {
  const delBtn = e.target.closest('[data-delete-order]')
  if (delBtn) {
    e.stopPropagation()
    const id = delBtn.dataset.deleteOrder
    const orderIdx = state.orders.findIndex(o => o.id === id)
    const num = state.orders.length - orderIdx
    const orderToDelete = state.orders[orderIdx]
    showConfirm({
      title: t('confirm_delete_order', { n: num, total: formatMoneyRaw(orderToDelete.total) }),
      body: '',
      center: true,
      onConfirm: async () => {
        await storage.deleteOrder(id)
        if (orderToDelete.synced) {
          try {
            await storage.deleteOrderFromCloud(orderToDelete.id)
            fetchGlobalStats()
          } catch(e) { await storage.addPendingDelete(orderToDelete.id) }
        }
        state.orders = await storage.getOrders()
        renderHistoryTab()
      }
    })
    return
  }
  const row = e.target.closest('[data-order-id]')
  if (row) {
    const id = row.dataset.orderId
    const order = state.orders.find(o => o.id === id)
    if (!order) return
    const orderIdx = state.orders.findIndex(o => o.id === id)
    const num = state.orders.length - orderIdx
    const itemsHtml = order.items.map(i =>
      `<div class="modal-item"><span>${escHtml(i.name)} ×${i.qty}</span><span>${formatMoney(i.price * i.qty)}</span></div>`
    ).join('')
    const totalHtml = `<div class="modal-total"><span>${t('label_total')}</span><span>${formatMoney(order.total)}</span></div>`
    const timeHtml = `<div style="font-size:12px;color:#888;margin-bottom:8px">${formatTimestamp(order.timestamp)}</div>`

    const backdrop = document.createElement('div')
    backdrop.className = 'modal-backdrop'
    backdrop.innerHTML = `
      <div class="modal">
        <h3>${t('order_details_title')} #${num}</h3>
        ${timeHtml}
        <div class="modal-items">${itemsHtml}${totalHtml}</div>
        <div class="modal-actions">
          <button class="btn-modal-cancel" style="flex:1">${t('btn_cancel')}</button>
        </div>
      </div>
    `
    document.body.appendChild(backdrop)
    backdrop.querySelector('.btn-modal-cancel').addEventListener('click', () => backdrop.remove())
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove() })
  }
})

function renderStatsTab() {
  document.getElementById('stat-customers').textContent = state.orders.length
  const totalRevenue = state.orders.reduce((s, o) => s + (o.total || 0), 0)
  document.getElementById('stat-revenue').textContent = formatMoney(totalRevenue)
  renderGlobalStatsUI()

  const wrap = document.getElementById('stats-table-wrap')
  if (state.orders.length === 0) {
    wrap.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>'
    return
  }

  const productStats = {}
  for (const order of state.orders) {
    for (const item of (order.items || [])) {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { name: item.name, qty: 0, revenue: 0 }
      }
      productStats[item.productId].qty += item.qty
      productStats[item.productId].revenue += item.price * item.qty
    }
  }

  for (const [pid, stat] of Object.entries(productStats)) {
    const p = state.products.find(p => p.id === pid)
    if (p) stat.name = pName(p)
  }

  const ranked = Object.values(productStats).sort((a, b) => b.qty - a.qty)

  wrap.innerHTML = `
    <div class="stats-heading">${t('label_ranking')}</div>
    <table>
      <thead><tr>
        <th>${t('col_product')}</th>
        <th style="text-align:right">${t('col_sold')}</th>
        <th style="text-align:right">${t('col_revenue')}</th>
      </tr></thead>
      <tbody>
        ${ranked.map(s => `
          <tr>
            <td>${escHtml(s.name)}</td>
            <td style="text-align:right">${s.qty}</td>
            <td style="text-align:right">${formatMoney(s.revenue)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function renderConfigTab() {
  const list = document.getElementById('config-list')
  list.innerHTML = state.products.map(p => `
    <div class="config-row" data-config-product="${p.id}">
      <div class="config-name">${escHtml(pName(p))}</div>
      <span class="price-display">${formatMoney(p.price)}</span>
      <button class="btn-edit-price" data-edit-price="${p.id}">${t('label_price').replace(' (zł)','')}</button>
    </div>
  `).join('')
}

document.getElementById('config-list').addEventListener('click', e => {
  const btn = e.target.closest('[data-edit-price]')
  if (!btn) return
  const id = btn.dataset.editPrice
  const p = state.products.find(p => p.id === id)
  if (!p) return

  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop center'
  backdrop.innerHTML = `
    <div class="modal modal-center">
      <h3>${escHtml(pName(p))}</h3>
      <div class="modal-field">
        <label>${t('label_price')}</label>
        <input id="price-edit-input" type="number" min="0.01" step="0.01" value="${p.price}">
        <div class="error" id="price-edit-error"></div>
      </div>
      <div class="modal-actions">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-confirm" id="price-edit-save">${t('btn_confirm')}</button>
      </div>
    </div>
  `
  document.body.appendChild(backdrop)
  const input = backdrop.querySelector('#price-edit-input')
  input.focus()
  input.select()

  backdrop.querySelector('.btn-modal-cancel').addEventListener('click', () => backdrop.remove())
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove() })
  backdrop.querySelector('#price-edit-save').addEventListener('click', () => {
    const newPrice = parseFloat(input.value)
    if (!newPrice || !isFinite(newPrice) || newPrice <= 0) {
      backdrop.querySelector('#price-edit-error').textContent = t('error_price_invalid')
      return
    }
    if (newPrice === p.price) { backdrop.remove(); return }
    const oldPrice = p.price
    backdrop.remove()
    showConfirm({
      title: t('confirm_price', { name: escHtml(pName(p)), old: formatMoneyRaw(oldPrice), new: formatMoneyRaw(newPrice) }),
      body: '',
      center: true,
      onConfirm: async () => {
        p.price = newPrice
        await storage.saveProducts(state.products)
        renderConfigTab()
        renderOrderTab()
      }
    })
  })
})

document.getElementById('btn-add-product').addEventListener('click', () => {
  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop center'
  backdrop.innerHTML = `
    <div class="modal modal-center">
      <h3>${t('btn_add_product')}</h3>
      <div class="modal-field">
        <label>${t('label_name')}</label>
        <input id="new-product-name" type="text" autocomplete="off">
        <div class="error" id="new-product-name-error"></div>
      </div>
      <div class="modal-field">
        <label>${t('label_price')}</label>
        <input id="new-product-price" type="number" min="0.01" step="0.01">
        <div class="error" id="new-product-price-error"></div>
      </div>
      <div class="modal-actions">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-confirm" id="new-product-save">${t('btn_confirm')}</button>
      </div>
    </div>
  `
  document.body.appendChild(backdrop)
  const nameInput = backdrop.querySelector('#new-product-name')
  nameInput.focus()

  backdrop.querySelector('.btn-modal-cancel').addEventListener('click', () => backdrop.remove())
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove() })
  backdrop.querySelector('#new-product-save').addEventListener('click', async () => {
    const nameVal = nameInput.value.trim()
    const priceVal = parseFloat(backdrop.querySelector('#new-product-price').value)
    let valid = true
    backdrop.querySelector('#new-product-name-error').textContent = ''
    backdrop.querySelector('#new-product-price-error').textContent = ''
    if (!nameVal) {
      backdrop.querySelector('#new-product-name-error').textContent = t('error_name_required')
      valid = false
    }
    if (!priceVal || !isFinite(priceVal) || priceVal <= 0) {
      backdrop.querySelector('#new-product-price-error').textContent = t('error_price_invalid')
      valid = false
    }
    if (!valid) return
    const newProduct = { id: genId(), namePL: nameVal, nameUA: nameVal, price: priceVal }
    state.products.push(newProduct)
    await storage.saveProducts(state.products)
    backdrop.remove()
    renderConfigTab()
    showToast(t('toast_saved'))
  })
})

function renderSettingsTab() {
  const panel = document.getElementById('panel-settings')
  const s = state.settings
  panel.innerHTML = `
    <div class="setting-row">
      <div class="setting-label" data-i18n="label_seller_name">${t('label_seller_name')}</div>
      <input class="setting-input" id="seller-name-input" type="text" value="${escAttr(s.sellerName || '')}" autocomplete="off">
    </div>
    <div class="setting-row">
      <div class="setting-label" data-i18n="label_language">${t('label_language')}</div>
      <div class="lang-toggle">
        <button class="lang-btn${s.lang !== 'uk' ? ' active' : ''}" data-lang="pl">PL</button>
        <button class="lang-btn${s.lang === 'uk' ? ' active' : ''}" data-lang="uk">UA</button>
      </div>
    </div>
    <div class="setting-row">
      <div class="toggle-row">
        <span style="font-size:14px">${t('label_high_contrast')}</span>
        <button class="toggle-switch${s.highContrast ? ' on' : ''}" id="toggle-high-contrast"></button>
      </div>
    </div>
    <div class="setting-row">
      <div class="toggle-row">
        <span style="font-size:14px">${t('label_sort_popular')}</span>
        <button class="toggle-switch${s.sortByPopularity ? ' on' : ''}" id="toggle-sort-popular"></button>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-label">${t('label_sync_status')}</div>
      <div class="sync-status" id="sync-status-display"></div>
      <button id="btn-sync-now">${t('btn_sync_now')}</button>
    </div>
    <div class="author-note">
      Autor: Wojciech Kantorczyk<br>
      <a href="mailto:wkantorczyk@gmail.com">wkantorczyk@gmail.com</a>
    </div>
  `

  renderSyncStatusUI()

  panel.querySelector('#seller-name-input').addEventListener('change', async e => {
    state.settings.sellerName = e.target.value.trim()
    await storage.saveSettings(state.settings)
  })

  panel.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.settings.lang = btn.dataset.lang
      await storage.saveSettings(state.settings)
      applyTranslations()
      renderSettingsTab()
      renderOrderTab()
      renderConfigTab()
      renderHistoryTab()
      renderStatsTab()
    })
  })

  panel.querySelector('#toggle-high-contrast').addEventListener('click', async () => {
    state.settings.highContrast = !state.settings.highContrast
    await storage.saveSettings(state.settings)
    applyHighContrast()
    renderSettingsTab()
  })

  panel.querySelector('#toggle-sort-popular').addEventListener('click', async () => {
    state.settings.sortByPopularity = !state.settings.sortByPopularity
    await storage.saveSettings(state.settings)
    renderSettingsTab()
    if (state.currentTab === 'order') renderOrderTab()
  })

  panel.querySelector('#btn-sync-now').addEventListener('click', () => syncNow())
}

function applyHighContrast() {
  if (state.settings.highContrast) {
    document.body.classList.add('high-contrast')
  } else {
    document.body.classList.remove('high-contrast')
  }
}

function switchTab(tabId) {
  state.currentTab = tabId
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('#tab-bar button').forEach(b => b.classList.remove('active'))
  document.getElementById('panel-' + tabId).classList.add('active')
  document.querySelector(`#tab-bar button[data-tab="${tabId}"]`).classList.add('active')

  const sumaBar = document.getElementById('suma-bar')
  if (tabId === 'order') {
    sumaBar.classList.remove('hidden')
  } else {
    sumaBar.classList.add('hidden')
  }

  if (tabId === 'order') renderOrderTab()
  else if (tabId === 'history') renderHistoryTab()
  else if (tabId === 'stats') renderStatsTab()
  else if (tabId === 'config') renderConfigTab()
  else if (tabId === 'settings') renderSettingsTab()
}

document.getElementById('tab-bar').addEventListener('click', e => {
  const btn = e.target.closest('[data-tab]')
  if (btn) switchTab(btn.dataset.tab)
})

function setupOnboarding() {
  const onboarding = document.getElementById('onboarding')
  const inp = document.getElementById('onboarding-input')
  const btn = document.getElementById('onboarding-btn')

  async function submit() {
    const name = inp.value.trim()
    if (!name) { inp.focus(); return }
    state.settings.sellerName = name
    state.settings.sellerId = genId()
    try {
      await storage.saveSettings(state.settings)
      onboarding.style.display = 'none'
      renderOrderTab()
    } catch(e) {
      // error already shown by trySet, keep onboarding visible
    }
  }

  btn.addEventListener('click', submit)
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit() })
}

async function init() {
  try {
    const savedSettings = await storage.getSettings()
    state.settings = Object.assign({
      sellerId: null,
      sellerName: '',
      lang: 'pl',
      highContrast: false,
      sortByPopularity: false,
      lastSync: null
    }, savedSettings)

    applyTranslations()
    applyHighContrast()

    if (!state.settings.sellerId) {
      setupOnboarding()
      document.getElementById('onboarding').style.display = 'flex'
    } else {
      document.getElementById('onboarding').style.display = 'none'
    }

    const savedProducts = await storage.getProducts()
    if (savedProducts && savedProducts.length > 0) {
      state.products = savedProducts
    } else {
      state.products = DEFAULT_PRODUCTS
      await storage.saveProducts(state.products)
    }

    state.orders = await storage.getOrders()

    renderOrderTab()
    document.getElementById('suma-bar').classList.remove('hidden')

    setInterval(syncNow, 10 * 60 * 1000)
    syncNow()
  } catch(e) {
    showToast(t('error_storage'))
    console.error('Init failed:', e)
  }
}

document.addEventListener('DOMContentLoaded', init)
