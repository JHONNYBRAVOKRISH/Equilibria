import { api } from '../services/api.js';

export function renderHistoryView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';

  container.innerHTML = `
    <div class="page-header" style="text-align: center; max-width: 700px; margin: 0 auto 2.5rem;">
      <h1 class="page-title" style="justify-content: center;">📅 Historical Logs & Trends</h1>
      <p class="page-subtitle">Review past daily nutrition logs and progress history</p>
    </div>

    <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; text-align: left;">
        <h3 class="card-title" style="margin:0;">Daily Consumption Summary</h3>
        <span class="badge badge-blue">Historical Records</span>
      </div>

      <!-- Left-Aligned Safeguard for Data Table -->
      <div style="overflow-x: auto; text-align: left;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Calories</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fat</th>
              <th>Fiber</th>
              <th>Items Logged</th>
            </tr>
          </thead>
          <tbody id="history-tbody">
            <tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">Loading historical trends...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  async function loadHistory() {
    const tbody = container.querySelector('#history-tbody');
    try {
      const history = await api.getHistory();
      if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No historical records found. Start logging items on your dashboard!</td></tr>`;
        return;
      }

      tbody.innerHTML = history.map(row => `
        <tr>
          <td style="font-weight: 700; color: var(--text-primary);">${row.date}</td>
          <td style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-blue);">${row.calories} kcal</td>
          <td style="font-family: var(--font-mono); color: #3B82F6;">${row.protein_g}g</td>
          <td style="font-family: var(--font-mono); color: #F59E0B;">${row.carbs_g}g</td>
          <td style="font-family: var(--font-mono); color: #EF4444;">${row.fat_g}g</td>
          <td style="font-family: var(--font-mono); color: #2d6a4f;">${row.fiber_g}g</td>
          <td><span class="badge badge-green">${row.items_count !== undefined ? row.items_count : (row.item_count || 0)} items</span></td>
        </tr>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  loadHistory();

  return container;
}
