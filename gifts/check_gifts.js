(() => {
  const password = prompt("Digite a senha do painel:");
  if(password !== "Mg156810$") {
    document.body.innerHTML = "<div id='access-denied'>🔒 Acesso negado</div>";
    throw new Error("Acesso negado");
  }

  async function loadAllGifts() {
    const { data, error } = await supabase.from('gifts').select('*');
    if (error) {
      alert('Erro ao carregar presentes: ' + error.message);
      return;
    }
    const tbody = document.getElementById('gifts-table-body');
    tbody.innerHTML = '';
    data.forEach(gift => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${gift.id}</td>
        <td>${gift.name}</td>
        <td>${gift.description || ''}</td>
        <td>${gift.taken_by || ''}</td>
        <td>${gift.confirmed_at ? new Date(gift.confirmed_at).toLocaleString() : ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.addEventListener('DOMContentLoaded', loadAllGifts);
})();
