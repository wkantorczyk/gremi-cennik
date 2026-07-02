function genId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function pName(p) {
  return (state.settings.lang === 'uk' && p.nameUA) ? p.nameUA : p.namePL
}

function formatMoney(n) {
  return n.toFixed(2).replace('.', ',') + ' zł'
}

function formatMoneyRaw(n) {
  return n.toFixed(2).replace('.', ',')
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  const date = d.getDate().toString().padStart(2,'0') + '.' +
               (d.getMonth()+1).toString().padStart(2,'0') + '.' + d.getFullYear()
  const time = d.getHours().toString().padStart(2,'0') + ':' +
               d.getMinutes().toString().padStart(2,'0')
  return date + ' ' + time
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function getSortedProducts() {
  if (!state.settings.sortByPopularity) return state.products
  const counts = {}
  for (const order of state.orders) {
    for (const item of order.items) {
      counts[item.productId] = (counts[item.productId] || 0) + item.qty
    }
  }
  return [...state.products].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
}

let toastTimer
function showToast(msg) {
  const el = document.getElementById('toast')
  el.textContent = msg
  el.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500)
}

function showConfirm(opts) {
  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop' + (opts.center ? ' center' : '')
  const modalClass = opts.center ? 'modal modal-center' : 'modal'
  backdrop.innerHTML = `
    <div class="${modalClass}">
      <h3>${opts.title}</h3>
      <div class="modal-items">${opts.body || ''}</div>
      <div class="modal-actions">
        <button class="btn-modal-cancel">${opts.cancelText || t('btn_cancel')}</button>
        <button class="btn-modal-confirm">${opts.confirmText || t('btn_confirm')}</button>
      </div>
    </div>
  `
  document.body.appendChild(backdrop)
  backdrop.querySelector('.btn-modal-cancel').addEventListener('click', () => backdrop.remove())
  backdrop.querySelector('.btn-modal-confirm').addEventListener('click', () => {
    backdrop.remove()
    if (opts.onConfirm) opts.onConfirm()
  })
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove() })
}
