const availableBody  = document.getElementById('available-gifts');
const confirmedBody  = document.getElementById('confirmed-gifts');
const pendingBody    = document.getElementById('pending-payments');
const pendingBadge   = document.getElementById('pending-badge');
const addGiftForm    = document.getElementById('add-gift-form');

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

// ─── Tabela de Presentes Disponíveis ────────────────────────────────────────
function createAvailableRow(gift) {
    const confirmedTotal = (gift.contributions || [])
        .filter(c => c.status === 'confirmed')
        .reduce((acc, c) => acc + (c.amount || 0), 0);

    let priceInfo = '';
    if (gift.price) {
        const pct = Math.min(100, (confirmedTotal / gift.price) * 100).toFixed(0);
        const color = confirmedTotal >= gift.price ? 'color:#3D7A6C; font-weight:bold;' : 'color:#999;';
        priceInfo = `
            <div style="font-size:0.82rem; margin-top:5px; ${color}">
                Meta: ${fmt(gift.price)} | Confirmado: ${fmt(confirmedTotal)}
            </div>
            <div style="background:#eee; border-radius:6px; height:5px; margin-top:4px; overflow:hidden;">
                <div style="background:#3D7A6C; width:${pct}%; height:100%; transition:width .4s;"></div>
            </div>`;
    }

    const nameHTML = gift.product_url
        ? `<a href="${gift.product_url}" target="_blank">${gift.name}</a>`
        : gift.name;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><img class="gift-img" src="${gift.image || ''}" onerror="this.style.display='none'" alt=""></td>
        <td>${nameHTML}${priceInfo}</td>
        <td>
            <button class="btn btn-danger" onclick="deleteGift('${gift.id}', '${gift.name.replace(/'/g,"\\'")}')">Excluir</button>
        </td>`;
    return tr;
}

// ─── Tabela de Presentes Confirmados ────────────────────────────────────────
function createConfirmedRow(gift) {
    let takenBy = gift.taken_by || '';
    let dateStr  = gift.confirmed_at ? fmtDate(gift.confirmed_at) : '';

    if (!gift.taken_by && gift.contributions?.length) {
        const names = [...new Set(
            gift.contributions.filter(c => c.status === 'confirmed').map(c => c.name)
        )];
        takenBy = names.join(', ') || '—';
        const last = gift.contributions.filter(c => c.status === 'confirmed').at(-1);
        if (last?.date) dateStr = fmtDate(last.date);
    }

    const nameHTML = gift.product_url
        ? `<a href="${gift.product_url}" target="_blank">${gift.name}</a>`
        : gift.name;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><img class="gift-img" src="${gift.image || ''}" onerror="this.style.display='none'" alt=""></td>
        <td>${takenBy}</td>
        <td>${nameHTML}</td>
        <td>${dateStr}</td>
        <td>
            <button class="btn" onclick="releaseGift('${gift.id}', '${gift.name.replace(/'/g,"\\'")}')">Liberar</button>
        </td>`;
    return tr;
}

// ─── Tabela de Pagamentos Pendentes ─────────────────────────────────────────
function createPendingRows(allGifts) {
    const rows = [];

    allGifts.forEach(gift => {
        // Inclui pending_pix E guest_confirmed (ambos aguardam confirmação do casal)
        const pending = (gift.contributions || []).filter(
            c => c.status === 'pending_pix' || c.status === 'guest_confirmed'
        );

        pending.forEach((contrib, idx) => {
            const isGuestConfirmed = contrib.status === 'guest_confirmed';

            const statusBadge = isGuestConfirmed
                ? `<span style="display:inline-block; padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:600; background:rgba(61,122,108,0.12); color:#3D7A6C; border:1px solid rgba(61,122,108,0.3);">
                     ✓ Convidado confirmou
                   </span>`
                : `<span style="display:inline-block; padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:600; background:rgba(197,160,89,0.12); color:#9A7822; border:1px solid rgba(197,160,89,0.3);">
                     ⏳ Aguardando
                   </span>`;

            const rowBg = isGuestConfirmed
                ? 'rgba(61,122,108,0.04)'
                : 'rgba(197,160,89,0.04)';

            const tr = document.createElement('tr');
            tr.style.cssText = `background: ${rowBg};`;
            tr.innerHTML = `
                <td>
                    <strong style="color:var(--c-primary)">${contrib.name || '—'}</strong><br>
                    <small style="margin-top:4px; display:block;">${statusBadge}</small>
                </td>
                <td>${gift.name}</td>
                <td style="color:var(--c-primary); font-weight:600">${fmt(contrib.amount)}</td>
                <td style="font-size:0.8rem; color:#aaa">${contrib.date ? fmtDate(contrib.date) : '—'}</td>
                <td>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="btn" style="border-color:#3D7A6C; color:#3D7A6C;"
                            onclick="confirmContribution('${gift.id}', '${contrib.tx_id || ''}', ${idx})">
                            ✅ Confirmar recebimento
                        </button>
                        <button class="btn btn-danger"
                            onclick="rejectContribution('${gift.id}', '${contrib.tx_id || ''}', ${idx})">
                            ❌ Recusar
                        </button>
                    </div>
                </td>`;
            rows.push({ tr, isGuestConfirmed });
        });
    });

    // Ordena: guest_confirmed primeiro (mais urgente de verificar)
    rows.sort((a, b) => (b.isGuestConfirmed ? 1 : 0) - (a.isGuestConfirmed ? 1 : 0));
    return rows.map(r => r.tr);
}

// ─── Confirmar pagamento recebido ────────────────────────────────────────────
window.confirmContribution = async (giftId, txId, idx) => {
    const ok = await showConfirm(`Confirmar que o pagamento PIX foi <strong>recebido</strong>? A contribuição será registrada e o progresso do presente atualizado.`);
    if (!ok) return;

    const { data: giftData, error: fetchErr } = await supabaseClient
        .from('gifts').select('contributions, price').eq('id', giftId).single();
    if (fetchErr) return showToast('Erro ao buscar presente: ' + fetchErr.message, 'error');

    const contributions = (giftData.contributions || []).map(c => {
        if (c.tx_id === txId || (txId === '' && giftData.contributions.indexOf(c) === idx)) {
            return { ...c, status: 'confirmed' };
        }
        return c;
    });

    const confirmedTotal = contributions
        .filter(c => c.status === 'confirmed')
        .reduce((acc, c) => acc + (c.amount || 0), 0);

    const isFullyFunded = giftData.price && confirmedTotal >= giftData.price;

    const updatePayload = { contributions };
    if (isFullyFunded) {
        updatePayload.confirmed_at = new Date().toISOString();
    }

    const { error } = await supabaseClient.from('gifts').update(updatePayload).eq('id', giftId);
    if (error) return showToast('Erro ao confirmar: ' + error.message, 'error');

    showToast('✅ Pagamento confirmado com sucesso!', 'success');
    loadGifts();
};

// ─── Recusar / remover contribuição pendente ─────────────────────────────────
window.rejectContribution = async (giftId, txId, idx) => {
    const ok = await showConfirm(`Recusar este pagamento? A contribuição pendente será <strong>removida</strong>.`);
    if (!ok) return;

    const { data: giftData, error: fetchErr } = await supabaseClient
        .from('gifts').select('contributions').eq('id', giftId).single();
    if (fetchErr) return showToast('Erro ao buscar presente: ' + fetchErr.message, 'error');

    const contributions = (giftData.contributions || []).filter((c, i) =>
        txId ? c.tx_id !== txId : i !== idx
    );

    const { error } = await supabaseClient.from('gifts').update({ contributions }).eq('id', giftId);
    if (error) return showToast('Erro ao recusar: ' + error.message, 'error');

    showToast('❌ Contribuição removida.', 'info');
    loadGifts();
};

// ─── Ações das tabelas principais ────────────────────────────────────────────
window.releaseGift = async (giftId, name) => {
    const ok = await showConfirm(`Deseja liberar "<strong>${name}</strong>"? Ele voltará para disponíveis e as cotas confirmadas serão zeradas.`);
    if (!ok) return;
    const { error } = await supabaseClient.from('gifts')
        .update({ taken_by: null, confirmed_at: null, contributions: [] }).eq('id', giftId);
    if (error) return showToast('Erro: ' + error.message, 'error');
    loadGifts();
};

window.deleteGift = async (giftId, name) => {
    const ok = await showConfirm(`Tem certeza que deseja excluir "<strong>${name}</strong>"?`);
    if (!ok) return;
    const { error } = await supabaseClient.from('gifts').delete().eq('id', giftId);
    if (error) return showToast('Erro: ' + error.message, 'error');
    loadGifts();
};

// ─── Load Principal ──────────────────────────────────────────────────────────
async function loadGifts() {
    const { data, error } = await supabaseClient.from('gifts').select('*').order('name');
    if (error) {
        availableBody.innerHTML = `<tr><td colspan="3">Erro ao carregar</td></tr>`;
        confirmedBody.innerHTML = `<tr><td colspan="5">Erro ao carregar</td></tr>`;
        pendingBody.innerHTML   = `<tr><td colspan="5">Erro ao carregar</td></tr>`;
        return;
    }

    availableBody.innerHTML = '';
    confirmedBody.innerHTML = '';
    pendingBody.innerHTML   = '';

    let hasAvailable = false, hasConfirmed = false;

    data.forEach(gift => {
        const confirmedTotal = (gift.contributions || [])
            .filter(c => c.status === 'confirmed')
            .reduce((acc, c) => acc + (c.amount || 0), 0);

        const isFullyTaken = gift.taken_by !== null
            || (gift.price && confirmedTotal >= gift.price);

        if (isFullyTaken) {
            confirmedBody.appendChild(createConfirmedRow(gift));
            hasConfirmed = true;
        } else {
            availableBody.appendChild(createAvailableRow(gift));
            hasAvailable = true;
        }
    });

    if (!hasAvailable) availableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:.6;">Nenhum presente disponível</td></tr>`;
    if (!hasConfirmed) confirmedBody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:.6;">Nenhum presente confirmado ainda</td></tr>`;

    // Pagamentos pendentes
    const pendingRows = createPendingRows(data);
    if (pendingRows.length === 0) {
        pendingBody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:.6;">Nenhum pagamento aguardando confirmação</td></tr>`;
    } else {
        pendingRows.forEach(r => pendingBody.appendChild(r));
    }

    // Badge de contagem
    if (pendingBadge) {
        pendingBadge.textContent = pendingRows.length > 0 ? `(${pendingRows.length})` : '';
        pendingBadge.style.color = pendingRows.length > 0 ? '#C5A059' : 'transparent';
    }
}

// ─── Formulário Adicionar Presente ───────────────────────────────────────────
addGiftForm.onsubmit = async (e) => {
    e.preventDefault();
    const name       = document.getElementById('gift-name').value.trim();
    const productUrl = document.getElementById('gift-link').value.trim();
    const price      = document.getElementById('gift-price')?.value || null;
    const file       = document.getElementById('gift-image').files[0];

    if (!name || !file) return showToast('Nome e imagem são obrigatórios.', 'error');

    const reader = new FileReader();
    reader.onload = async () => {
        const { error } = await supabaseClient.from('gifts').insert([{
            name,
            image: reader.result,
            product_url: productUrl || null,
            price: price ? parseFloat(price) : null,
        }]);
        if (error) return showToast('Erro ao adicionar: ' + error.message, 'error');
        showToast(`"${name}" adicionado com sucesso! 🎁`, 'success');
        addGiftForm.reset();
        loadGifts();
    };
    reader.readAsDataURL(file);
};

// ─── Realtime ────────────────────────────────────────────────────────────────
supabaseClient.channel('public:gifts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => loadGifts())
    .subscribe();

window.addEventListener('DOMContentLoaded', loadGifts);