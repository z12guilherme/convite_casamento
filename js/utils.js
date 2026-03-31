/**
 * Exibe uma notificação toast amigável.
 * @param {string} message A mensagem a ser exibida. Pode conter HTML simples.
 * @param {'info' | 'success' | 'error'} type O tipo de notificação.
 */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-notification-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
      if (container && !container.hasChildNodes()) container.remove();
    }, { once: true });
  }, 5000);
}

/**
 * Exibe um modal de confirmação customizado e retorna uma promessa.
 * @param {string} message A mensagem a ser exibida no modal.
 * @returns {Promise<boolean>} Resolve para `true` se confirmado, `false` se cancelado.
 */
function showConfirm(message) {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'confirm-modal-overlay';
    modal.innerHTML = `
      <div class="confirm-modal-content">
        <p class="confirm-modal-message">${message}</p>
        <div class="confirm-modal-actions">
          <button class="confirm-modal-btn cancel">Cancelar</button>
          <button class="confirm-modal-btn confirm">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const btnConfirm = modal.querySelector('.confirm');
    const btnCancel = modal.querySelector('.cancel');

    const close = (value) => {
      modal.classList.remove('show');
      modal.addEventListener('transitionend', () => modal.remove(), { once: true });
      resolve(value);
    };

    btnConfirm.onclick = () => close(true);
    btnCancel.onclick = () => close(false);
    
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  });
}