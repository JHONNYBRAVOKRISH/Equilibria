import { api } from '../services/api.js';

export function renderMealBuilderView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';

  container.innerHTML = `
    <div class="page-header" style="text-align: center; max-width: 700px; margin: 0 auto 2.5rem;">
      <h1 class="page-title" style="justify-content: center;">🍳 Interactive Meal Builder</h1>
      <p class="page-subtitle">Describe what you had to automatically calculate total calories & macros</p>
    </div>

    <div class="grid-2" style="gap: 2rem;">
      <!-- Recipe Info & Paragraph Description Panel -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h3 class="card-title">Describe Your Meal</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Type what you ate to automatically calculate total calories & macros</p>
          </div>
          
          <!-- Left-Aligned Safeguard for Form Inputs -->
          <div class="form-group" style="text-align: left;">
            <label class="form-label">Meal / Recipe Name</label>
            <input type="text" id="meal-name-input" class="form-control" placeholder="e.g. My Favorite Lunch">
          </div>

          <div class="form-group" style="text-align: left; margin-bottom: 1.5rem;">
            <label class="form-label">What did you eat?</label>
            <textarea id="meal-para-input" class="form-control" rows="8" placeholder="e.g. 2 Rotis, 1 Bowl Dal Tadka & 150g Fresh Curd" style="resize: vertical; line-height: 1.6; font-family: var(--font-sans);"></textarea>
          </div>
        </div>

        <div>
          <button id="btn-analyze-meal" class="btn btn-primary" style="width: 100%; padding: 0.85rem;">
            ⚡ Analyze & Calculate Macros
          </button>
          <div id="builder-error" style="margin-top: 0.6rem; color: var(--error-red); font-size: 0.85rem; text-align: center; height: 1.2rem;"></div>
        </div>
      </div>

      <!-- Live Combined Meal Summary & Ingredient List -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h3 class="card-title">Combined Macro Totals</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Real-time aggregated nutritional profile</p>
          </div>
          
          <div class="macro-grid" style="margin-bottom: 1.8rem;">
            <div class="macro-box">
              <div class="macro-label">Calories</div>
              <div id="total-cal" class="macro-value macro-val-cal">0</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">kcal</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Protein</div>
              <div id="total-prot" class="macro-value macro-val-prot">0</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">g</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Carbs</div>
              <div id="total-carb" class="macro-value macro-val-carb">0</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">g</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Fat</div>
              <div id="total-fat" class="macro-value macro-val-fat">0</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">g</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Fiber</div>
              <div id="total-fib" class="macro-value macro-val-fib">0</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">g</div>
            </div>
          </div>

          <!-- Left-Aligned Safeguard for Ingredient List Data -->
          <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">Recipe Ingredients List</h4>
          <div id="ingredients-container" style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 220px; overflow-y: auto; text-align: left;">
            <div style="color: var(--text-secondary); font-size: 0.88rem; text-align: center; padding: 1.8rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
              Describe your meal in the left panel and click Analyze to view the calculated ingredient breakdown.
            </div>
          </div>
        </div>

        <div style="margin-top: 1.8rem; padding-top: 1.2rem; border-top: 1px solid var(--border-color); text-align: center;">
          <button id="btn-save-meal" class="btn btn-primary" style="width: 100%; padding: 0.85rem;" disabled>
            💾 Save Meal to Reusable Library
          </button>
          <div id="meal-save-status" style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; height: 1.2rem;"></div>
        </div>
      </div>
    </div>
  `;

  let addedIngredients = [];

  const paraInput = container.querySelector('#meal-para-input');
  const analyzeBtn = container.querySelector('#btn-analyze-meal');
  const saveMealBtn = container.querySelector('#btn-save-meal');
  const saveStatus = container.querySelector('#meal-save-status');
  const errorEl = container.querySelector('#builder-error');
  const mealNameInput = container.querySelector('#meal-name-input');

  analyzeBtn.addEventListener('click', async () => {
    const description = paraInput.value.trim();
    if (!description) {
      errorEl.textContent = 'Please describe your meal first.';
      return;
    }

    errorEl.textContent = '';
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing Meal...';

    try {
      const response = await api.parseDescription(description);
      addedIngredients = response.ingredients || [];
      renderIngredients();

      if (addedIngredients.length === 0) {
        errorEl.textContent = 'Could not parse any food items. Try specifying quantities (e.g. 2 Roti, 150g Curd).';
        saveMealBtn.disabled = true;
      } else {
        saveMealBtn.disabled = false;
      }
    } catch (err) {
      errorEl.textContent = `Error: ${err.message}`;
      saveMealBtn.disabled = true;
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '⚡ Analyze & Calculate Macros';
    }
  });

  function renderIngredients() {
    const listEl = container.querySelector('#ingredients-container');
    if (addedIngredients.length === 0) {
      listEl.innerHTML = `
        <div style="color: var(--text-secondary); font-size: 0.88rem; text-align: center; padding: 1.8rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
          Describe your meal in the left panel and click Analyze to view the calculated ingredient breakdown.
        </div>`;
      updateTotals({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
      return;
    }

    let totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
    listEl.innerHTML = addedIngredients.map((ing, idx) => {
      totals.calories += ing.calories;
      totals.protein_g += ing.protein_g;
      totals.carbs_g += ing.carbs_g;
      totals.fat_g += ing.fat_g;
      totals.fiber_g += ing.fiber_g;

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--secondary-bg); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.92rem; text-align: left;">
          <div>
            <span style="font-weight: 700; color: var(--text-primary);">${ing.food_name}</span>
            <span style="color: var(--text-secondary); font-size: 0.84rem; margin-left: 0.4rem;">(${ing.quantity} ${ing.unit_name} • ${ing.calories} kcal)</span>
          </div>
          <button data-idx="${idx}" class="btn-remove-ing" style="background:none; border:none; color: var(--error-red); cursor: pointer; font-size: 1.1rem; padding: 0 0.3rem;">✕</button>
        </div>
      `;
    }).join('');

    updateTotals(totals);

    listEl.querySelectorAll('.btn-remove-ing').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.target.getAttribute('data-idx'));
        addedIngredients.splice(idx, 1);
        renderIngredients();
        if (addedIngredients.length === 0) {
          saveMealBtn.disabled = true;
        }
      });
    });
  }

  function updateTotals(t) {
    container.querySelector('#total-cal').textContent = Math.round(t.calories);
    container.querySelector('#total-prot').textContent = Math.round(t.protein_g * 10) / 10;
    container.querySelector('#total-carb').textContent = Math.round(t.carbs_g * 10) / 10;
    container.querySelector('#total-fat').textContent = Math.round(t.fat_g * 10) / 10;
    container.querySelector('#total-fib').textContent = Math.round(t.fiber_g * 10) / 10;
  }

  saveMealBtn.addEventListener('click', async () => {
    const name = mealNameInput.value.trim();
    const description = paraInput.value.trim();

    if (!name) {
      saveStatus.style.color = "var(--error-red)";
      saveStatus.textContent = "Please enter a meal name.";
      return;
    }

    if (addedIngredients.length === 0) {
      saveStatus.style.color = "var(--error-red)";
      saveStatus.textContent = "Add at least 1 ingredient to save.";
      return;
    }

    try {
      saveMealBtn.disabled = true;
      await api.createMeal({
        name,
        description: description || 'Custom Parsed Meal',
        ingredients: addedIngredients.map(ing => ({
          food_id: ing.food_id,
          unit_name: ing.unit_name,
          quantity: ing.quantity
        }))
      });

      saveStatus.style.color = "var(--success-green)";
      saveStatus.textContent = "✓ Saved meal to library!";
      setTimeout(() => {
        onNavigate('saved-meals');
      }, 1500);
    } catch (err) {
      saveStatus.style.color = "var(--error-red)";
      saveStatus.textContent = `Error: ${err.message}`;
      saveMealBtn.disabled = false;
    }
  });

  return container;
}
