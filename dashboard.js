document.addEventListener('DOMContentLoaded', () => {
  const categoryContainer = document.getElementById('categoryContainer');
  const addCategoryBtn   = document.getElementById('addCategory');
  const incomeDisplay    = document.getElementById('incomeDisplay');
  const remainingDisplay = document.getElementById('remainingDisplay');
  const progressBar      = document.getElementById('progressBar');
  const allocationPercent= document.getElementById('allocationPercent');
  const needsPercent     = document.getElementById('needsPercent');
  const wantsPercent     = document.getElementById('wantsPercent');
  const savingsPercent   = document.getElementById('savingsPercent');
  const debtPercent      = document.getElementById('debtPercent');

  
  let monthlyIncome = parseFloat(localStorage.getItem('monthlyIncome')) || 1000;
  incomeDisplay.textContent = `$${monthlyIncome.toLocaleString()}`;

  let categories = [];
  let categoryIdCounter = 0;

  const colors = {
    needs:   '#4f8cff',
    wants:   '#ffb547',
    savings: '#4fdc8c',
    debt:    '#ff5c7a'
  };

  addCategoryBtn.addEventListener('click', () => addCategory());

  function addCategory(name = '', amount = 0, type = 'needs') {
    const id = categoryIdCounter++;
    const category = { id, name, amount, type };
    categories.push(category);
    renderCategory(category);
    updateSummary();
  }

  function renderCategory(category) {
    const row = document.createElement('div');
    row.className = 'category-row';
    row.dataset.id = category.id;

    row.innerHTML = `
      <input type="text" class="cat-name" placeholder="Category name" value="${category.name}">
      <div class="cat-amount-wrap">
        <span class="dollar">$</span>
        <input type="number" class="cat-amount" min="0" step="1" value="${category.amount || ''}" placeholder="0">
      </div>
      <select class="cat-type">
        <option value="needs">Needs</option>
        <option value="wants">Wants</option>
        <option value="savings">Savings</option>
        <option value="debt">Debt</option>
      </select>
      <button class="cat-delete" title="Remove category" type="button">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    row.querySelector('.cat-type').value = category.type;

    row.querySelector('.cat-name').addEventListener('input', (e) => {
      category.name = e.target.value;
    });

    row.querySelector('.cat-amount').addEventListener('input', (e) => {
      category.amount = parseFloat(e.target.value) || 0;
      updateSummary();
    });

    row.querySelector('.cat-type').addEventListener('change', (e) => {
      category.type = e.target.value;
      updateSummary();
    });

    row.querySelector('.cat-delete').addEventListener('click', () => {
      categories = categories.filter(c => c.id !== category.id);
      row.remove();
      updateSummary();
    });

    categoryContainer.appendChild(row);
  }

  function updateSummary() {
    const totalAllocated = categories.reduce((sum, c) => sum + (c.amount || 0), 0);
    const remaining = monthlyIncome - totalAllocated;
    const allocationPct = monthlyIncome > 0
      ? Math.min((totalAllocated / monthlyIncome) * 100, 100)
      : 0;

    remainingDisplay.textContent = `$${remaining.toLocaleString()}`;
    progressBar.style.width = `${allocationPct}%`;
    allocationPercent.textContent = `${Math.round(allocationPct)}%`;

    if (remaining < 0) {
      remainingDisplay.style.color = '#ff5c5c';
      progressBar.style.background = '#ff5c5c';
    } else {
      remainingDisplay.style.color = '';
      progressBar.style.background = '';
    }

    const totals = { needs: 0, wants: 0, savings: 0, debt: 0 };
    categories.forEach(c => { totals[c.type] += c.amount || 0; });

    const base = totalAllocated > 0 ? totalAllocated : 1;
    needsPercent.textContent   = `${Math.round((totals.needs   / base) * 100)}%`;
    wantsPercent.textContent   = `${Math.round((totals.wants   / base) * 100)}%`;
    savingsPercent.textContent = `${Math.round((totals.savings / base) * 100)}%`;
    debtPercent.textContent    = `${Math.round((totals.debt    / base) * 100)}%`;

    updateCharts(totals, remaining);
  }

  
  let barChart, pieChart;
  const barCtx   = document.getElementById('budgetChart');
  const pieCtx   = document.getElementById('pie-chart');
  const pieLegend = document.getElementById('pie-chart-legend');

  function updateCharts(totals, remaining) {
    const labels = ['Needs', 'Wants', 'Savings', 'Debt'];
    const data   = [totals.needs, totals.wants, totals.savings, totals.debt];
    const bg     = [colors.needs, colors.wants, colors.savings, colors.debt];

    if (barCtx) {
      if (!barChart) {
        barChart = new Chart(barCtx, {
          type: 'bar',
          data: { labels, datasets: [{ data, backgroundColor: bg, borderRadius: 6 }] },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { color: '#8a93a6' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              x: { ticks: { color: '#8a93a6' }, grid: { display: false } }
            }
          }
        });
      } else {
        barChart.data.datasets[0].data = data;
        barChart.update();
      }
    }

    if (pieCtx) {
      const pieData   = remaining > 0 ? [...data, remaining] : data;
      const pieLabels = remaining > 0 ? [...labels, 'Unallocated'] : labels;
      const pieBg     = remaining > 0 ? [...bg, '#2a3142'] : bg;

      if (!pieChart) {
        pieChart = new Chart(pieCtx, {
          type: 'doughnut',
          data: { labels: pieLabels, datasets: [{ data: pieData, backgroundColor: pieBg, borderWidth: 0 }] },
          options: { plugins: { legend: { display: false } }, cutout: '65%' }
        });
      } else {
        pieChart.data.labels = pieLabels;
        pieChart.data.datasets[0].data = pieData;
        pieChart.data.datasets[0].backgroundColor = pieBg;
        pieChart.update();
      }

      if (pieLegend) {
        pieLegend.innerHTML = pieLabels.map((label, i) =>
          `<li><span class="legend-dot" style="background:${pieBg[i]}"></span>${label}: $${pieData[i].toLocaleString()}</li>`
        ).join('');
      }
    }
  }

  addCategory('', 0, 'needs');
});