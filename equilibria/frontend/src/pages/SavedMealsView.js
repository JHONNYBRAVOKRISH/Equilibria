import { api } from '../services/api.js';

export function renderSavedMealsView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';

  container.innerHTML = `
    <div class="page-header" style="text-align: center; max-width: 700px; margin: 0 auto 2.5rem;">
      <h1 class="page-title" style="justify-content: center;">🥗 Saved Meals Library</h1>
      <p class="page-subtitle">Reusable custom thalis, combinations, and saved recipes</p>
    </div>

    <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; text-align: left;">
        <div>
          <h3 class="card-title" style="margin:0;">Your Custom Recipes</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin:0;">Click "Log Meal" to instantly record all ingredients to today's log</p>
        </div>
        <button id="btn-create-new-meal" class="btn btn-primary">➕ Create New Meal</button>
      </div>

      <!-- Left-Aligned Safeguard for Data List -->
      <div id="saved-meals-list" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; text-align: left;">
        <div style="grid-column: span 2; text-align: center; padding: 3rem; color: var(--text-secondary);">Loading library...</div>
      </div>

      <div id="saved-meals-prompt" style="display: none; margin-top: 1.5rem;"></div>
    </div>
  `;

  async function loadSavedMeals() {
    const listEl = container.querySelector('#saved-meals-list');
    try {
      const meals = await api.getMeals();
      if (meals.length === 0) {
        listEl.innerHTML = `
          <div style="grid-column: span 2; text-align: center; padding: 3rem; color: var(--text-secondary); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
            No saved meals found in library. Use the <strong>Meal Builder</strong> to combine staples and save recipes.
          </div>`;
        return;
      }

      listEl.innerHTML = meals.map(meal => `
        <div style="background-color: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">${meal.name}</h4>
              <span class="badge badge-blue" style="font-family: var(--font-mono);">${meal.total_calories} kcal</span>
            </div>
            ${meal.description ? `<p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem;">${meal.description}</p>` : ''}
            
            <div class="macro-grid" style="margin-bottom: 1rem; grid-template-columns: repeat(4, 1fr);">
              <div class="macro-box" style="padding: 0.5rem;"><div class="macro-label">Prot</div><div class="macro-value" style="font-size: 0.95rem; color: #3B82F6;">${meal.total_protein}g</div></div>
              <div class="macro-box" style="padding: 0.5rem;"><div class="macro-label">Carb</div><div class="macro-value" style="font-size: 0.95rem; color: #F59E0B;">${meal.total_carbs}g</div></div>
              <div class="macro-box" style="padding: 0.5rem;"><div class="macro-label">Fat</div><div class="macro-value" style="font-size: 0.95rem; color: #EF4444;">${meal.total_fat}g</div></div>
              <div class="macro-box" style="padding: 0.5rem;"><div class="macro-label">Fib</div><div class="macro-value" style="font-size: 0.95rem; color: #2d6a4f;">${meal.total_fiber}g</div></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.8rem; margin-top: 1rem;">
            <button data-id="${meal.id}" class="btn-log-meal btn btn-primary" style="flex: 1; padding: 0.6rem; font-size: 0.88rem;">⚡ Log to Today</button>
            <button data-id="${meal.id}" class="btn-del-meal btn btn-danger" style="padding: 0.6rem; font-size: 0.88rem;">Delete</button>
          </div>
        </div>
      `).join('');

      listEl.querySelectorAll('.btn-log-meal').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          btn.disabled = true;
          btn.textContent = 'Logging...';
          try {
            await api.addLog({
              item_type: 'meal',
              meal_id: id,
              meal_type: 'Lunch'
            });
            onNavigate('dashboard');
          } catch (err) {
            alert(`Error logging meal: ${err.message}`);
            btn.disabled = false;
            btn.textContent = '⚡ Log to Today';
          }
        });
      });

      listEl.querySelectorAll('.btn-del-meal').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          await api.deleteMeal(id);
          loadSavedMeals();
        });
      });

      // Show prompt card if fewer than 4 meals exist
      const promptEl = container.querySelector('#saved-meals-prompt');
      if (meals.length < 4) {
        promptEl.style.display = 'block';
        promptEl.innerHTML = `
          <div style="background: rgba(45, 106, 79, 0.05); border: 1px dashed rgba(45, 106, 79, 0.3); border-radius: var(--radius-md); padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center; text-align: left;">
            <div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">💡 Build your daily staple library</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">Combine your favorite thalis or smoothie recipes into saved templates for instant 1-click logging.</div>
            </div>
            <button id="btn-prompt-builder" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.45rem 0.9rem; white-space: nowrap; margin-left: 1rem;">➕ Build Recipe</button>
          </div>
        `;
        promptEl.querySelector('#btn-prompt-builder').addEventListener('click', () => onNavigate('meal-builder'));
      } else {
        promptEl.style.display = 'none';
      }

    } catch (err) {
      console.error(err);
    }
  }

  container.querySelector('#btn-create-new-meal').addEventListener('click', () => onNavigate('meal-builder'));
  loadSavedMeals();

  return container;
}
