let allPalmOil = [];
let allExpenses = [];

function safeNumber(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function filterQuery() {
  const from = document.getElementById('from-filter').value;
  const to = document.getElementById('to-filter').value;
  return from && to ? `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : '';
}

async function refreshPalmRecords() {
  const query = filterQuery();
  try {
    const [oil, expenses] = await Promise.all([Api.get('/api/palm-oil' + query), Api.get('/api/expenses' + query)]);
    allPalmOil = Array.isArray(oil) ? oil : [];
    allExpenses = Array.isArray(expenses) ? expenses : [];
    renderPalmOil();
    renderExpenses();
  } catch (err) { handleError(err); }
}

function renderPalmOil() {
  const body = document.getElementById('palm-oil-body');
  body.innerHTML = allPalmOil.length ? allPalmOil.map(p => `
    <tr><td>${fmtDate(p.oilDate)}</td><td class="text-right mono">${safeNumber(p.weight).toFixed(3)}</td><td class="text-right mono">${fmtMoney(p.rate)}</td><td class="text-right mono">${fmtMoney(p.total)}</td><td>${isAdmin() ? `<button class="btn-outline btn-sm" onclick="editPalmOil(${p.id})">Edit</button> <button class="btn-danger btn-sm" onclick="deletePalmOil(${p.id})">Delete</button>` : '<span class="text-muted">View only</span>'}</td></tr>`).join('')
    : '<tr><td colspan="5" class="table-empty">No palm oil records for this period</td></tr>';
  const totalWeight = allPalmOil.reduce((s,p) => s + safeNumber(p.weight), 0);
  const totalValue = allPalmOil.reduce((s,p) => s + safeNumber(p.total), 0);
  document.getElementById('oil-summary').textContent = `${totalWeight.toFixed(3)} weight · ${fmtMoney(totalValue)}`;
}

function renderExpenses() {
  const body = document.getElementById('expenses-body');
  body.innerHTML = allExpenses.length ? allExpenses.map(e => `
    <tr><td>${fmtDate(e.expenseDate)}</td><td>${escapeHtml(e.category || '-')}</td><td>${escapeHtml(e.description || '-')}</td><td class="text-right mono">${fmtMoney(e.amount)}</td><td>${isAdmin() ? `<button class="btn-outline btn-sm" onclick="editPalmExpense(${e.id})">Edit</button> <button class="btn-danger btn-sm" onclick="deletePalmExpense(${e.id})">Delete</button>` : '<span class="text-muted">View only</span>'}</td></tr>`).join('')
    : '<tr><td colspan="5" class="table-empty">No expenses for this period</td></tr>';
  const total = allExpenses.reduce((s,e) => s + safeNumber(e.amount), 0);
  document.getElementById('expense-summary').textContent = fmtMoney(total);
}

function updateOilTotal() {
  const total = safeNumber(document.getElementById('oil-weight').value) * safeNumber(document.getElementById('oil-rate').value);
  document.getElementById('oil-total').value = total ? fmtMoney(total) : '';
}

function openOilForm(record) {
  document.getElementById('oil-form').reset();
  document.getElementById('oil-id').value = record?.id || '';
  document.getElementById('oil-date').value = record?.oilDate || todayIso();
  document.getElementById('oil-weight').value = record?.weight ?? '';
  document.getElementById('oil-rate').value = record?.rate ?? '';
  document.getElementById('oil-modal-title').textContent = record ? 'Edit Palm Oil' : 'Record Palm Oil';
  document.getElementById('oil-form-error').innerHTML = '';
  updateOilTotal();
  openModal('oil-modal');
}
window.editPalmOil = id => { const r = allPalmOil.find(x => x.id === id); if (r) openOilForm(r); };
window.deletePalmOil = async id => { if (!confirm('Delete this palm oil record?')) return; try { await Api.del(`/api/palm-oil/${id}`); showToast('Palm oil record deleted'); await refreshPalmRecords(); } catch(e) { handleError(e); } };

window.editPalmExpense = id => {
  const e = allExpenses.find(x => x.id === id); if (!e) return;
  document.getElementById('expense-modal-title').textContent = 'Edit Expense';
  document.getElementById('e-id').value = e.id; document.getElementById('e-date').value = e.expenseDate;
  document.getElementById('e-category').value = e.category || ''; document.getElementById('e-description').value = e.description || '';
  document.getElementById('e-amount').value = e.amount ?? ''; document.getElementById('e-notes').value = e.notes || '';
  document.getElementById('expense-form-error').innerHTML = ''; openModal('expense-modal');
};
window.deletePalmExpense = async id => { if (!confirm('Delete this expense record? This cannot be undone.')) return; try { await Api.del(`/api/expenses/${id}`); showToast('Expense deleted'); await refreshPalmRecords(); } catch(e) { handleError(e); } };

document.getElementById('record-palm-oil-btn').addEventListener('click', () => openOilForm());
document.getElementById('oil-weight').addEventListener('input', updateOilTotal);
document.getElementById('oil-rate').addEventListener('input', updateOilTotal);
document.getElementById('oil-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('oil-id').value;
  const payload = { oilDate: document.getElementById('oil-date').value, weight: safeNumber(document.getElementById('oil-weight').value), rate: safeNumber(document.getElementById('oil-rate').value), createdBy: 'admin' };
  const btn = document.getElementById('oil-save-btn'); btn.disabled = true; document.getElementById('oil-form-error').innerHTML = '';
  try { if (id) { await Api.put(`/api/palm-oil/${id}`, payload); showToast('Palm oil record updated'); } else { await Api.post('/api/palm-oil', payload); showToast('Palm oil recorded'); } closeModal('oil-modal'); await refreshPalmRecords(); }
  catch(err) { document.getElementById('oil-form-error').innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`; }
  finally { btn.disabled = false; }
});

document.getElementById('add-expense-btn').addEventListener('click', () => {
  document.getElementById('expense-form').reset(); document.getElementById('expense-modal-title').textContent = 'Add Expense';
  document.getElementById('e-id').value = ''; document.getElementById('e-date').value = todayIso(); document.getElementById('expense-form-error').innerHTML = ''; openModal('expense-modal');
});
document.getElementById('expense-form').addEventListener('submit', async e => {
  e.preventDefault(); const id = document.getElementById('e-id').value;
  const payload = { expenseDate: document.getElementById('e-date').value, category: document.getElementById('e-category').value.trim(), description: document.getElementById('e-description').value.trim(), amount: safeNumber(document.getElementById('e-amount').value), notes: document.getElementById('e-notes').value.trim(), createdBy: 'admin' };
  if (!payload.category) { document.getElementById('expense-form-error').innerHTML = '<div class="alert alert-error">Category is required.</div>'; return; }
  const btn=document.getElementById('expense-save-btn'); btn.disabled=true; document.getElementById('expense-form-error').innerHTML='';
  try { if(id){await Api.put(`/api/expenses/${id}`,payload);showToast('Expense updated')}else{await Api.post('/api/expenses',payload);showToast('Expense added')} closeModal('expense-modal'); await refreshPalmRecords(); }
  catch(err){document.getElementById('expense-form-error').innerHTML=`<div class="alert alert-error">${escapeHtml(err.message)}</div>`;} finally{btn.disabled=false;}
});

document.getElementById('apply-filter-btn').addEventListener('click', refreshPalmRecords);
document.getElementById('palm-pdf-btn').addEventListener('click', async () => {
  const from=document.getElementById('from-filter').value, to=document.getElementById('to-filter').value;
  if(!from||!to){showToast('Select From and To dates first');return;}
  const btn=document.getElementById('palm-pdf-btn'); btn.disabled=true;
  try { const blob=await Api.getBlob(`/api/reports/palm-oil-expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`); openPdfBlob(blob, `palm-oil-expenses-${from}-to-${to}.pdf`); }
  catch(err){handleError(err);} finally{btn.disabled=false;}
});

document.addEventListener('DOMContentLoaded',()=>{document.getElementById('from-filter').value=firstOfMonthIso();document.getElementById('to-filter').value=todayIso();setTimeout(refreshPalmRecords,50);});
