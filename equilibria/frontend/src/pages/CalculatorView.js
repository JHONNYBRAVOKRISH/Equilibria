import { api } from '../services/api.js';

export function renderCalculatorView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';

  container.innerHTML = `
    <div class="page-header" style="text-align: center; max-width: 700px; margin: 0 auto 2.5rem;">
      <h1 class="page-title" style="justify-content: center;">🧮 Individual Food Calculator</h1>
      <p class="page-subtitle">Search lab-verified foods from USDA & ICMR/IFCT with zero manual math</p>
    </div>

    <div class="grid-2" style="gap: 2rem;">
      <!-- Search & Input Card -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h3 class="card-title">Select Food Item</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Query laboratory database and select custom portions</p>
        </div>
        
        <!-- Search Bar with Input Left-Aligned Safeguard -->
        <div class="form-group" style="position: relative; margin-bottom: 1.5rem; text-align: left;">
          <label class="form-label">Search Food Database</label>
          <div style="position: relative;">
            <input type="text" id="calc-food-input" class="form-control" placeholder="e.g. Chicken, Biryani, Roti, Paneer, Apple..." autocomplete="off">
            <div id="calc-dropdown-list" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background-color: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-sm); max-height: 250px; overflow-y: auto; z-index: 50; box-shadow: var(--shadow-md); margin-top: 4px; text-align: left;"></div>
          </div>
        </div>

        <!-- Inputs Grid with Left-Aligned Safeguard -->
        <div style="display: grid; grid-template-columns: 1fr 1.4fr; gap: 1rem; margin-bottom: 1.8rem; text-align: left;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" id="calc-qty-label">Quantity</label>
            <input type="number" id="calc-qty-input" class="form-control" value="1" min="0.1" step="0.5" style="font-family: var(--font-mono); font-weight: 700;">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Portion / Unit</label>
            <select id="calc-unit-select" class="form-select" style="font-weight: 600;"></select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1.8rem; text-align: left;">
          <label class="form-label">Meal Segment</label>
          <select id="calc-meal-type-select" class="form-select">
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch" selected>Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>

        <button id="btn-calc-log" class="btn btn-primary" style="width: 100%; padding: 0.85rem;" disabled>
          ➕ Log Item to Today's Dashboard
        </button>
        <div id="calc-log-status" style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; height: 1.2rem;"></div>
      </div>

      <!-- Live Dynamic Macro Card -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h3 class="card-title">Nutritional Breakdown</h3>
            <div id="calc-selected-badge" style="margin-top: 0.4rem;"><span class="badge badge-blue">Select an item to view macros</span></div>
          </div>
          
          <div class="macro-grid" style="margin-bottom: 1.8rem;">
            <div class="macro-box">
              <div class="macro-label">Calories</div>
              <div id="calc-macro-cal" class="macro-value" style="color: var(--text-secondary);">—</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">kcal</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Protein</div>
              <div id="calc-macro-prot" class="macro-value" style="color: var(--text-secondary);">—</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">g</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Carbs</div>
              <div id="calc-macro-carb" class="macro-value" style="color: var(--text-secondary);">—</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">g</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Fat</div>
              <div id="calc-macro-fat" class="macro-value" style="color: var(--text-secondary);">—</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">g</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Fiber</div>
              <div id="calc-macro-fib" class="macro-value" style="color: var(--text-secondary);">—</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">g</div>
            </div>
          </div>

          <!-- Data list left-aligned safeguard -->
          <div style="background-color: var(--secondary-bg); padding: 1.2rem; border-radius: var(--radius-md); font-size: 0.9rem; text-align: left;">
            <div style="font-weight: 700; margin-bottom: 0.4rem; color: var(--text-primary);" id="calc-detail-title">No food selected</div>
            <div style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;" id="calc-detail-desc">
              Search for any food item or Indian staple in the left panel to trigger automatic zero-manual-math macro calculations.
            </div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; text-align: center;">
          <button id="btn-goto-dash" class="btn btn-secondary" style="width: 100%;">📊 Go to Dashboard</button>
        </div>
      </div>
    </div>
  `;

  let selectedFood = null;
  let currentComputed = null;
  let searchDebounce = null;

  const foodInput = container.querySelector('#calc-food-input');
  const dropdownList = container.querySelector('#calc-dropdown-list');
  const unitSelect = container.querySelector('#calc-unit-select');
  const qtyInput = container.querySelector('#calc-qty-input');
  const qtyLabel = container.querySelector('#calc-qty-label');
  const logBtn = container.querySelector('#btn-calc-log');
  const logStatus = container.querySelector('#calc-log-status');
  const mealTypeSelect = container.querySelector('#calc-meal-type-select');

  async function performSearch(query) {
    if (!query || query.trim().length === 0) {
      dropdownList.style.display = 'none';
      return;
    }

    dropdownList.innerHTML = `<div style="padding: 0.8rem; color: var(--text-secondary); font-size: 0.88rem; text-align: center;">⚡ Searching USDA & ICMR/IFCT...</div>`;
    dropdownList.style.display = 'block';

    try {
      const foods = await api.getFoods(query);
      if (foods.length === 0) {
        dropdownList.innerHTML = `<div style="padding: 0.8rem; color: var(--text-secondary); font-size: 0.88rem; text-align: center;">No items found</div>`;
      } else {
        dropdownList.innerHTML = foods.slice(0, 10).map(f => `
          <div class="calc-item-option" data-id="${f.id}" style="padding: 0.65rem 0.9rem; cursor: pointer; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; text-align: left;">
            <div>
              <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary);">${f.name}</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">${f.data_source || f.category}</div>
            </div>
            <span class="badge badge-blue" style="font-size: 0.72rem;">${f.calories} kcal/100g</span>
          </div>
        `).join('');

        dropdownList.querySelectorAll('.calc-item-option').forEach(opt => {
          opt.addEventListener('mouseenter', () => opt.style.backgroundColor = 'var(--secondary-bg)');
          opt.addEventListener('mouseleave', () => opt.style.backgroundColor = 'transparent');
          opt.addEventListener('click', () => {
            const id = opt.getAttribute('data-id');
            const found = foods.find(item => item.id === id);
            if (found) {
              selectFoodItem(found);
              dropdownList.style.display = 'none';
            }
          });
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function selectFoodItem(food) {
    selectedFood = food;
    foodInput.value = food.name;
    logBtn.disabled = false;
    qtyInput.value = 1;

    try {
      const units = await api.getFoodUnits(food.id);
      unitSelect.innerHTML = units.map(u => {
        const displayLabel = u.unit_name === 'Custom Grams (g)' ? 'Custom Grams (g)' : `${u.unit_name} (${u.gram_equivalent}g)`;
        return `<option value="${u.unit_name}">${displayLabel}</option>`;
      }).join('');
      recalculate();
    } catch (err) {
      console.error(err);
    }
  }

  async function recalculate() {
    if (!selectedFood) return;
    const unitName = unitSelect.value;

    // Custom Grams label / input handling
    if (unitName === 'Custom Grams (g)') {
      qtyLabel.textContent = 'Gram Weight (g)';
      if (qtyInput.value === '1') qtyInput.value = '100'; // Helpful default starting weight when clicking custom grams
    } else {
      qtyLabel.textContent = 'Quantity';
    }

    const qty = Number(qtyInput.value);

    if (!unitName || !qty || qty <= 0) return;

    try {
      currentComputed = await api.convert(selectedFood.id, unitName, qty);
      
      const elCal = container.querySelector('#calc-macro-cal');
      const elProt = container.querySelector('#calc-macro-prot');
      const elCarb = container.querySelector('#calc-macro-carb');
      const elFat = container.querySelector('#calc-macro-fat');
      const elFib = container.querySelector('#calc-macro-fib');

      elCal.textContent = currentComputed.calories;
      elCal.style.color = "var(--accent-blue)";
      elProt.textContent = currentComputed.protein_g;
      elProt.style.color = "var(--macro-protein)";
      elCarb.textContent = currentComputed.carbs_g;
      elCarb.style.color = "var(--macro-carbs)";
      elFat.textContent = currentComputed.fat_g;
      elFat.style.color = "var(--macro-fat)";
      elFib.textContent = currentComputed.fiber_g;
      elFib.style.color = "#52796f";

      container.querySelector('#calc-selected-badge').innerHTML = `<span class="badge badge-green">✓ Verified ${selectedFood.data_source || 'Database Item'}</span>`;
      
      if (unitName === 'Custom Grams (g)') {
        container.querySelector('#calc-detail-title').textContent = `${currentComputed.food_name} (${currentComputed.quantity}g Custom Weight)`;
        container.querySelector('#calc-detail-desc').textContent = `Direct weight input: ${currentComputed.gram_weight}g. Provides ${currentComputed.calories} kcal with ${currentComputed.protein_g}g Protein, ${currentComputed.carbs_g}g Carbs, and ${currentComputed.fat_g}g Fat.`;
      } else {
        container.querySelector('#calc-detail-title').textContent = `${currentComputed.food_name} (${currentComputed.quantity} ${currentComputed.unit_name})`;
        container.querySelector('#calc-detail-desc').textContent = `Equivalent weight: ${currentComputed.gram_weight || currentComputed.gram_equivalent}g. Provides ${currentComputed.calories} kcal with ${currentComputed.protein_g}g Protein, ${currentComputed.carbs_g}g Carbs, and ${currentComputed.fat_g}g Fat.`;
      }
    } catch (err) {
      console.error(err);
    }
  }

  foodInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => performSearch(foodInput.value), 400);
  });

  foodInput.addEventListener('focus', () => {
    if (foodInput.value.trim().length > 0) performSearch(foodInput.value);
  });

  unitSelect.addEventListener('change', recalculate);
  qtyInput.addEventListener('input', recalculate);

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) return;
    if (!foodInput.contains(e.target) && !dropdownList.contains(e.target)) {
      dropdownList.style.display = 'none';
    }
  });

  logBtn.addEventListener('click', async () => {
    if (!currentComputed) return;
    try {
      logBtn.disabled = true;
      await api.addLog({
        food_id: currentComputed.food_id,
        meal_type: mealTypeSelect.value,
        name: currentComputed.food_name,
        calories: currentComputed.calories,
        protein_g: currentComputed.protein_g,
        carbs_g: currentComputed.carbs_g,
        fat_g: currentComputed.fat_g,
        fiber_g: currentComputed.fiber_g,
        quantity: currentComputed.quantity,
        unit_name: currentComputed.unit_name
      });

      logStatus.style.color = "var(--success-green)";
      logStatus.textContent = "✓ Logged successfully!";
      setTimeout(() => {
        logStatus.textContent = "";
        logBtn.disabled = false;
      }, 2000);
    } catch (err) {
      logStatus.style.color = "var(--error-red)";
      logStatus.textContent = `Error: ${err.message}`;
      logBtn.disabled = false;
    }
  });

  container.querySelector('#btn-goto-dash').addEventListener('click', () => onNavigate('dashboard'));

  return container;
}
