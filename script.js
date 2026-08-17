document.addEventListener('DOMContentLoaded', () => {
  const incomeInput   = document.getElementById('income');
  const quickButtons   = document.querySelectorAll('.quick-buttons button');
  const generateBtn    = document.getElementById('generate');

  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  function parseIncome(value) {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    return digitsOnly ? parseInt(digitsOnly, 10) : 0;
  }

  incomeInput.addEventListener('input', () => {
    const cursorFromEnd = incomeInput.value.length - incomeInput.selectionStart;
    const value = parseIncome(incomeInput.value);
    incomeInput.value = value ? formatNumber(value) : '';
    const newPos = Math.max(incomeInput.value.length - cursorFromEnd, 0);
    incomeInput.setSelectionRange(newPos, newPos);
  });

  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value, 10);
      incomeInput.value = formatNumber(value);

      quickButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  generateBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const income = parseIncome(incomeInput.value);

    if (!income || income <= 0) {
      incomeInput.classList.add('error');
      incomeInput.focus();
      return;
    }

    incomeInput.classList.remove('error');
    localStorage.setItem('monthlyIncome', income);

    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 200);
  });
});