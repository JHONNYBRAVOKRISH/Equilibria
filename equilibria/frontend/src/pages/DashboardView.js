import { api } from '../services/api.js';

export function renderDashboardView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';

  container.innerHTML = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem;">
      <div>
        <h1 class="page-title">📊 Equilibria Daily Dashboard</h1>
        <p class="page-subtitle">Real-time daily metabolic tracking & automated educational analysis</p>
      </div>
      <div>
        <input type="date" id="dash-date-picker" class="form-control" style="font-family: var(--font-mono); font-size: 0.9rem; padding: 0.5rem 1rem;">
      </div>
    </div>

    <!-- Top Summary: Split Glassmorphic Grid (1/3 Calories, 2/3 Macros) -->
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.8rem; margin-bottom: 2rem;" class="dash-top-grid">
      
      <!-- Left Column: Calorie Ring + Debt Tracker Container -->
      <div style="display: flex; flex-direction: column; gap: 1.2rem;">
        <!-- Left Card: Calorie Visualization (Large Custom SVG Circular Ring) -->
        <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.2rem;">Daily Calories</h3>
          
          <div style="position: relative; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 140 140" style="width: 100%; height: 100%; transform: rotate(-90deg);">
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(45, 106, 79, 0.12)" stroke-width="12" />
              <circle id="calorie-svg-ring" cx="70" cy="70" r="54" fill="none" stroke="#2d6a4f" stroke-width="12" stroke-linecap="round" stroke-dasharray="339.29" stroke-dashoffset="339.29" style="transition: stroke-dashoffset 0.8s ease;" />
            </svg>
            <!-- Centered Consumed vs Target text inside ring -->
            <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.1rem;">CONSUMED</span>
              <span id="ring-consumed-num" style="font-size: 2.1rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono); line-height: 1.1;">0</span>
              <span id="ring-target-num" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-top: 0.2rem;">of 0 kcal</span>
            </div>
          </div>
        </div>

        <!-- ⚖️ Conditionally Rendered Debt Tracker Card -->
        <div id="debt-tracker-card" class="card" style="display: none; background: #FFFFFF; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 24px; padding: 1.2rem; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.08); text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 800; font-size: 0.95rem; color: #F59E0B;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Rollover Adjustment
            </div>
            <span id="debt-window-tag" class="badge" style="background: rgba(245, 158, 11, 0.12); color: #F59E0B; font-size: 0.75rem;">3-Day Window</span>
          </div>
          <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.4;">
            Active debt remaining: <strong id="debt-total-num" style="color: var(--text-primary); font-family: var(--font-mono);">0</strong> kcal.<br>
            Today's target adjustment: <strong id="debt-today-num" style="color: #F59E0B; font-family: var(--font-mono);">-0</strong> kcal.
          </div>
        </div>
      </div>

      <!-- Right Card: Macro Tracking (Thick Rounded Horizontal Progress Bars: Protein Blue, Carbs Yellow, Fat Red) -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h3 style="color: var(--text-primary); font-size: 1.3rem; font-weight: 800; margin: 0;">Macronutrient Targets</h3>
            <span id="dash-goal-tag" class="badge badge-green" style="font-size: 0.85rem; padding: 0.4rem 0.85rem;">Fitness Goal</span>
          </div>

          <!-- 3-Column Macro Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.8rem;">
            
            <!-- Protein (Blue #3B82F6) -->
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">Protein</span>
              </div>
              <div style="margin-bottom: 0.8rem;">
                <span id="prot-val-num" style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">0</span>
                <span id="prot-target-num" style="font-size: 0.9rem; color: var(--text-secondary); font-family: var(--font-mono); font-weight: 600;">/ 0 g</span>
              </div>
              <div style="height: 10px; background: rgba(0,0,0,0.06); border-radius: 999px; overflow: hidden;">
                <div id="prot-bar-fill" style="height: 100%; background: #3B82F6; border-radius: 999px; width: 0%; max-width: 100%; transition: width 0.6s ease;"></div>
              </div>
            </div>

            <!-- Carbs (Yellow #F59E0B) -->
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">Carbohydrates</span>
              </div>
              <div style="margin-bottom: 0.8rem;">
                <span id="carb-val-num" style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">0</span>
                <span id="carb-target-num" style="font-size: 0.9rem; color: var(--text-secondary); font-family: var(--font-mono); font-weight: 600;">/ 0 g</span>
              </div>
              <div style="height: 10px; background: rgba(0,0,0,0.06); border-radius: 999px; overflow: hidden;">
                <div id="carb-bar-fill" style="height: 100%; background: #F59E0B; border-radius: 999px; width: 0%; max-width: 100%; transition: width 0.6s ease;"></div>
              </div>
            </div>

            <!-- Fat (Red #EF4444) -->
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">Healthy Fats</span>
              </div>
              <div style="margin-bottom: 0.8rem;">
                <span id="fat-val-num" style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">0</span>
                <span id="fat-target-num" style="font-size: 0.9rem; color: var(--text-secondary); font-family: var(--font-mono); font-weight: 600;">/ 0 g</span>
              </div>
              <div style="height: 10px; background: rgba(0,0,0,0.06); border-radius: 999px; overflow: hidden;">
                <div id="fat-bar-fill" style="height: 100%; background: #EF4444; border-radius: 999px; width: 0%; max-width: 100%; transition: width 0.6s ease;"></div>
              </div>
            </div>

          </div>
        </div>

        <!-- Fiber Row -->
        <div style="margin-top: 1.8rem; padding-top: 1.2rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600;">
            <span>🌾 Dietary Fiber Target:</span>
            <span id="fib-val-num" style="color: var(--text-primary); font-weight: 800; font-family: var(--font-mono);">0 / 0 g</span>
          </div>
          <div style="width: 160px; height: 8px; background: rgba(0,0,0,0.06); border-radius: 999px; overflow: hidden;">
            <div id="fib-bar-fill" style="height: 100%; background: #2d6a4f; border-radius: 999px; width: 0%; max-width: 100%; transition: width 0.6s ease;"></div>
          </div>
        </div>
      </div>

    </div>

    <!-- 🟢 7-Day Weekly Calorie Trend Section (Pure Responsive SVG Bar Chart) -->
    <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
        <div>
          <h3 class="card-title" style="margin:0;">📈 7-Day Calorie Trends</h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.2rem;">Weekly volume analysis vs daily Target threshold</p>
        </div>
        <span id="weekly-target-badge" class="badge badge-blue">Target: 2,000 kcal</span>
      </div>

      <div id="weekly-svg-container" style="width: 100%; min-height: 240px; display: flex; align-items: center; justify-content: center;">
        <div style="color: var(--text-secondary); font-size: 0.9rem;">Loading 7-day trend chart...</div>
      </div>
    </div>

    <!-- ⚡ Saved Meal Templates Quick-Log Panel -->
    <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
        <div>
          <h3 class="card-title" style="margin:0;">⚡ Saved Meal Templates</h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.2rem;">Instant one-click logging to eliminate daily staple rebuilding friction</p>
        </div>
        <button id="btn-goto-builder" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 0.9rem;">➕ Create Template</button>
      </div>

      <div id="dash-templates-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem;">
        <div style="color: var(--text-secondary); font-size: 0.9rem; grid-column: 1/-1;">Loading saved templates...</div>
      </div>
    </div>

    <!-- Bottom Section: Smart Educational Analysis & Logged Items -->
    <div class="grid-2" style="margin-bottom: 2rem;">
      <!-- Smart Educational Analysis Cards -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
          <h3 class="card-title" style="margin:0;">🧠 Smart Educational Analysis</h3>
          <span class="badge badge-green">Science-Backed Feedback</span>
        </div>

        <div id="insights-container" style="display: flex; flex-direction: column; gap: 1rem; max-height: 250px; overflow-y: auto;">
          <div style="color: var(--text-secondary); font-size: 0.9rem;">Loading scientific nutrition insights...</div>
        </div>
      </div>

      <!-- Quick Action Card -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="margin-bottom: 1.2rem;">
          <h3 class="card-title" style="margin-bottom: 0.6rem;">Quick Actions</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 0;">Log raw ingredients with zero manual math or assemble multi-item recipes.</p>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button id="btn-dash-calc" class="btn btn-primary" style="flex: 1;">🧮 Calculator</button>
          <button id="btn-dash-meal" class="btn btn-secondary" style="flex: 1;">🍳 Meal Builder</button>
        </div>
      </div>
    </div>

    <!-- Logged Items Table -->
    <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
        <h3 class="card-title" style="margin:0;">Today's Logged Items</h3>
      </div>

      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Food Item / Recipe</th>
              <th>Portion Size</th>
              <th>Calories</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fat</th>
              <th>Fiber</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="dash-logs-tbody">
            <tr><td colspan="9" style="text-align: center; color: var(--text-secondary);">Loading logs...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const datePicker = container.querySelector('#dash-date-picker');
  datePicker.value = new Date().toISOString().split('T')[0];

  async function loadDashboardData() {
    try {
      const data = await api.getDashboardToday(datePicker.value);
      const user = await api.getUserProfile().catch(() => ({ goal: 'maintain' }));

      const goalMap = { lose: 'Fat Loss (-20%)', maintain: 'Weight Maintenance', gain: 'Muscle Surplus (+15%)' };
      container.querySelector('#dash-goal-tag').textContent = goalMap[user.goal] || 'Fitness Target';

      const circumference = 339.29;
      const consumedCal = data.consumed.calories;
      const baselineTarget = data.targets.target_calories;
      const adjustedTarget = data.targets.adjusted_target_calories || baselineTarget;
      const rollover = data.rollover || {};

      container.querySelector('#ring-consumed-num').textContent = consumedCal.toLocaleString();

      // Ring Target Display: Prominent adjusted target; subtle strikethrough baseline if adjusted
      if (rollover.rollover_enabled && rollover.today_deduction > 0) {
        container.querySelector('#ring-target-num').innerHTML = `of <strong>${adjustedTarget.toLocaleString()}</strong> <del style="color: var(--text-secondary); text-decoration: line-through; margin-left:2px; font-weight:400;">${baselineTarget.toLocaleString()}</del> kcal`;
      } else {
        container.querySelector('#ring-target-num').textContent = `of ${baselineTarget.toLocaleString()} kcal`;
      }

      // Debt Tracker Card rendering
      const debtCard = container.querySelector('#debt-tracker-card');
      if (rollover.rollover_enabled && rollover.active_debt > 0 && rollover.today_deduction > 0) {
        debtCard.style.display = 'block';
        container.querySelector('#debt-window-tag').textContent = `${rollover.rollover_window}-Day Window`;
        container.querySelector('#debt-total-num').textContent = rollover.active_debt.toLocaleString();
        container.querySelector('#debt-today-num').textContent = `-${rollover.today_deduction.toLocaleString()}`;
      } else {
        debtCard.style.display = 'none';
      }

      const calPct = Math.min(1.0, consumedCal / adjustedTarget);
      const strokeOffset = circumference - (calPct * circumference);
      const ringCircle = container.querySelector('#calorie-svg-ring');
      ringCircle.style.strokeDashoffset = strokeOffset;
      ringCircle.style.stroke = consumedCal > adjustedTarget ? '#EF4444' : '#2d6a4f';

      updateMacroColumn('#prot-val-num', '#prot-target-num', '#prot-bar-fill', data.consumed.protein_g, data.targets.target_protein_g);
      updateMacroColumn('#carb-val-num', '#carb-target-num', '#carb-bar-fill', data.consumed.carbs_g, data.targets.target_carbs_g);
      updateMacroColumn('#fat-val-num', '#fat-target-num', '#fat-bar-fill', data.consumed.fat_g, data.targets.target_fat_g);
      updateMacroColumn('#fib-val-num', null, '#fib-bar-fill', data.consumed.fiber_g, data.targets.target_fiber_g, true);

      // Render 7-Day Weekly Trend Chart
      renderWeeklyTrendChart();

      // Render Saved Templates
      renderSavedTemplates();

      const insightsList = container.querySelector('#insights-container');
      if (data.analysis.insights.length === 0) {
        insightsList.innerHTML = `<div style="color: var(--text-secondary); font-size: 0.9rem;">Log items today to trigger automated scientific educational analysis.</div>`;
      } else {
        insightsList.innerHTML = data.analysis.insights.map(ins => {
          let badgeClass = 'badge-green';
          if (ins.type === 'warning') badgeClass = 'badge-orange';

          return `
            <div style="background: rgba(248, 249, 250, 0.8); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${ins.title}</span>
                <span class="badge ${badgeClass}">${ins.category}</span>
              </div>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin:0;">${ins.message}</p>
            </div>
          `;
        }).join('');
      }

      const tbody = container.querySelector('#dash-logs-tbody');
      if (data.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 2.5rem;">No items logged for this date. Click "Calculator" or "Saved Templates" to add entries.</td></tr>`;
      } else {
        tbody.innerHTML = data.logs.map(log => `
          <tr>
            <td><span class="badge badge-blue">${log.meal_type}</span></td>
            <td style="font-weight: 700; color: var(--text-primary);">${log.name}</td>
            <td style="color: var(--text-secondary);">${log.quantity} ${log.unit_name}</td>
            <td style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-blue);">${log.calories}</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: #3B82F6;">${log.protein_g}g</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: #F59E0B;">${log.carbs_g}g</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: #EF4444;">${log.fat_g}g</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: #2d6a4f;">${log.fiber_g}g</td>
            <td>
              <button data-id="${log.id}" class="btn-del-log btn btn-danger" style="padding: 0.25rem 0.6rem; font-size: 0.78rem;">Delete</button>
            </td>
          </tr>
        `).join('');

        tbody.querySelectorAll('.btn-del-log').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            await api.deleteLog(id);
            loadDashboardData();
          });
        });
      }

    } catch (err) {
      console.error(err);
    }
  }

  async function renderWeeklyTrendChart() {
    const chartBox = container.querySelector('#weekly-svg-container');
    try {
      const res = await api.getWeeklyTrend(datePicker.value);
      container.querySelector('#weekly-target-badge').textContent = `Target Threshold: ${res.target_calories.toLocaleString()} kcal`;

      const days = res.weekly_trend;
      const targetCal = res.target_calories;
      const maxDataCal = Math.max(...days.map(d => d.calories), targetCal);
      const maxScale = Math.ceil((maxDataCal * 1.25) / 1000) * 1000;

      const width = 700;
      const height = 220;
      const chartBottom = 175;
      const chartTop = 35;
      const chartHeight = chartBottom - chartTop;

      const targetY = chartBottom - ((targetCal / maxScale) * chartHeight);

      const svgBars = days.map((d, i) => {
        const xCenter = 75 + i * (560 / 6);
        const barW = 38;
        const barX = xCenter - (barW / 2);
        const barH = (d.calories / maxScale) * chartHeight;
        const barY = chartBottom - barH;

        if (d.calories === 0) {
          return `
            <g class="weekly-bar-group" style="cursor: pointer;">
              <text x="${xCenter}" y="${chartBottom - 12}" text-anchor="middle" font-size="11" font-weight="500" fill="var(--text-secondary)" opacity="0.65">
                No data
              </text>
              <text x="${xCenter}" y="${chartBottom + 20}" text-anchor="middle" font-weight="700" font-size="13" fill="var(--text-primary)">
                ${d.dayName}
              </text>
              <text x="${xCenter}" y="${chartBottom + 35}" text-anchor="middle" font-size="11" fill="var(--text-secondary)">
                ${d.date.slice(5)}
              </text>
            </g>
          `;
        }

        // Use primary emerald green (#10B981) normally; use soft red (#EF4444) if over target
        const fillColor = d.calories > targetCal ? '#EF4444' : '#10B981';

        return `
          <g class="weekly-bar-group" style="cursor: pointer;">
            <!-- Value label on top -->
            <text x="${xCenter}" y="${Math.max(barY - 8, 20)}" text-anchor="middle" font-family="var(--font-mono)" font-size="12" font-weight="700" fill="${fillColor}">
              ${d.calories}
            </text>

            <!-- Vertical Bar -->
            <rect x="${barX}" y="${barY}" width="${barW}" height="${Math.max(barH, 4)}" rx="8" ry="8" fill="${fillColor}" opacity="0.9" />

            <!-- X-axis Day Label -->
            <text x="${xCenter}" y="${chartBottom + 20}" text-anchor="middle" font-weight="700" font-size="13" fill="var(--text-primary)">
              ${d.dayName}
            </text>
            <text x="${xCenter}" y="${chartBottom + 35}" text-anchor="middle" font-size="11" fill="var(--text-secondary)">
              ${d.date.slice(5)}
            </text>
          </g>
        `;
      }).join('');

      chartBox.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
          <!-- Grid Background Lines -->
          <line x1="40" y1="${chartBottom}" x2="660" y2="${chartBottom}" stroke="var(--border-color)" stroke-width="1.5" />
          
          <!-- Dashed Target Threshold Line -->
          <line x1="40" y1="${targetY}" x2="660" y2="${targetY}" stroke="#EF4444" stroke-width="2" stroke-dasharray="6,4" opacity="0.7" />
          <text x="665" y="${targetY + 4}" font-size="11" font-weight="700" fill="#EF4444">Target</text>

          <!-- Bars & Labels -->
          ${svgBars}
        </svg>
      `;

    } catch (err) {
      console.error(err);
      chartBox.innerHTML = `<div style="color: var(--error-red); font-size: 0.9rem;">Failed to load weekly trend chart.</div>`;
    }
  }

  async function renderSavedTemplates() {
    const box = container.querySelector('#dash-templates-container');
    try {
      const templates = await api.getMeals();
      if (templates.length === 0) {
        box.innerHTML = `
          <div style="color: var(--text-secondary); font-size: 0.88rem; grid-column: 1/-1; padding: 1.5rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center;">
            No saved meal templates yet. Click "Create Template" to save complex thalis and recipes for instant one-click logging.
          </div>`;
      } else {
        box.innerHTML = templates.map(t => `
          <div style="background: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <div>
              <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.2rem;">${t.name}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.8rem;">${t.description || 'Custom Recipe Template'}</div>
              <div style="font-family: var(--font-mono); font-size: 0.88rem; font-weight: 700; color: var(--accent-blue); margin-bottom: 1rem;">
                🔥 ${t.total_calories} kcal <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 400;">(P: ${t.total_protein}g • C: ${t.total_carbs}g • F: ${t.total_fat}g)</span>
              </div>
            </div>
            <button data-id="${t.id}" class="btn-log-template btn btn-primary" style="width: 100%; padding: 0.6rem; font-size: 0.85rem;">
              ⚡ Log to Today
            </button>
          </div>
        `).join('');

        box.querySelectorAll('.btn-log-template').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const mealId = e.currentTarget.getAttribute('data-id');
            btn.disabled = true;
            btn.textContent = 'Logging...';
            try {
              await api.addLog({
                item_type: 'meal',
                meal_id: mealId,
                date: datePicker.value,
                meal_type: 'Lunch'
              });
              loadDashboardData();
            } catch (err) {
              alert(`Error logging meal: ${err.message}`);
              btn.disabled = false;
              btn.textContent = '⚡ Log to Today';
            }
          });
        });
      }
    } catch (err) {
      console.error(err);
      box.innerHTML = `<div style="color: var(--error-red); font-size: 0.9rem; grid-column: 1/-1;">Error loading saved templates.</div>`;
    }
  }

  function updateMacroColumn(valSel, targetSel, barSel, val, target, isFiber = false) {
    const valEl = container.querySelector(valSel);
    if (valEl) {
      if (isFiber) {
        valEl.textContent = `${val} / ${target} g`;
      } else {
        valEl.textContent = val;
      }
    }
    if (targetSel) {
      const targetEl = container.querySelector(targetSel);
      if (targetEl) targetEl.textContent = `/ ${target} g`;
    }

    const barEl = container.querySelector(barSel);
    if (barEl) {
      const pct = Math.min(100, Math.round((val / target) * 100));
      barEl.style.width = `${pct}%`;
    }
  }

  datePicker.addEventListener('change', loadDashboardData);
  container.querySelector('#btn-dash-calc').addEventListener('click', () => onNavigate('calculator'));
  container.querySelector('#btn-dash-meal').addEventListener('click', () => onNavigate('meal-builder'));
  container.querySelector('#btn-goto-builder').addEventListener('click', () => onNavigate('meal-builder'));

  loadDashboardData();

  return container;
}
