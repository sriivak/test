const STORAGE_KEY = 'expense-tracker-items';
const form = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalEl = document.getElementById('total');
const monthlyTotalEl = document.getElementById('monthly-total');
const categorySummaryEl = document.getElementById('category-summary');
const clearAllButton = document.getElementById('clear-all');
const tabButtons = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');
const chartCanvas = document.getElementById('category-chart');
const chartCtx = chartCanvas?.getContext('2d');

let expenses = loadExpenses();

function loadExpenses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load expenses', error);
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function render() {
  renderExpenses();
  renderSummary();
}

function renderExpenses() {
  if (!expenses.length) {
    expenseList.innerHTML = '<li class="expense-item">No expenses yet. Add your first one.</li>';
    return;
  }

  expenseList.innerHTML = expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((expense) => `
      <li class="expense-item">
        <div>
          <strong>${escapeHtml(expense.description)}</strong>
          <div class="expense-meta">${escapeHtml(expense.category)} • ${formatDate(expense.date)}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <strong>${formatCurrency(Number(expense.amount))}</strong>
          <button class="delete-btn" data-id="${expense.id}">Delete</button>
        </div>
      </li>
    `)
    .join('');
}

function renderSummary() {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTotal = expenses
    .filter((item) => item.date.startsWith(currentMonth))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  totalEl.textContent = formatCurrency(total);
  monthlyTotalEl.textContent = formatCurrency(monthlyTotal);

  const grouped = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const entries = Object.entries(grouped);

  categorySummaryEl.innerHTML = entries
    .map(([name, amount]) => `
      <div class="category-item">
        <span>${escapeHtml(name)}</span>
        <strong>${formatCurrency(amount)}</strong>
      </div>
    `)
    .join('');

  drawCategoryChart(entries);
}

function drawCategoryChart(entries) {
  if (!chartCtx) return;

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
  const total = entries.reduce((sum, [, amount]) => sum + Number(amount), 0);

  chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  if (!entries.length || total === 0) {
    chartCtx.fillStyle = '#64748b';
    chartCtx.font = '16px Arial';
    chartCtx.textAlign = 'center';
    chartCtx.fillText('No data yet', chartCanvas.width / 2, chartCanvas.height / 2);
    return;
  }

  let startAngle = -Math.PI / 2;
  const centerX = chartCanvas.width / 2;
  const centerY = chartCanvas.height / 2;
  const radius = 90;

  entries.forEach(([name, amount], index) => {
    const sliceAngle = (Number(amount) / total) * Math.PI * 2;
    chartCtx.beginPath();
    chartCtx.moveTo(centerX, centerY);
    chartCtx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    chartCtx.closePath();
    chartCtx.fillStyle = colors[index % colors.length];
    chartCtx.fill();
    startAngle += sliceAngle;
  });

  chartCtx.beginPath();
  chartCtx.arc(centerX, centerY, 42, 0, Math.PI * 2);
  chartCtx.fillStyle = '#ffffff';
  chartCtx.fill();

  chartCtx.fillStyle = '#172033';
  chartCtx.font = 'bold 16px Arial';
  chartCtx.textAlign = 'center';
  chartCtx.fillText('Spend', centerX, centerY + 6);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetView = button.dataset.tab;

    tabButtons.forEach((tab) => tab.classList.toggle('active', tab === button));
    views.forEach((view) => view.classList.toggle('active', view.id === `${targetView}-view`));
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const newExpense = {
    id: crypto.randomUUID(),
    amount: document.getElementById('amount').value,
    description: document.getElementById('description').value.trim(),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };

  expenses.push(newExpense);
  saveExpenses();
  form.reset();
  document.getElementById('date').value = new Date().toISOString().slice(0, 10);
  render();
  document.querySelector('.tab-btn[data-tab="dashboard"]').click();
});

expenseList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('button[data-id]');
  if (!deleteButton) return;

  expenses = expenses.filter((expense) => expense.id !== deleteButton.dataset.id);
  saveExpenses();
  render();
});

clearAllButton.addEventListener('click', () => {
  if (confirm('Remove all expenses?')) {
    expenses = [];
    saveExpenses();
    render();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').value = new Date().toISOString().slice(0, 10);
  render();
});
