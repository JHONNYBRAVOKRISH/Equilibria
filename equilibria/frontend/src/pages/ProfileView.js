import { api, authStore } from '../services/api.js';

export function renderProfileView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';

  container.innerHTML = `
    <div class="page-header" style="text-align: center; max-width: 700px; margin: 0 auto 2.5rem;">
      <h1 class="page-title" style="justify-content: center;">👤 Profile & Metabolic Goals</h1>
      <p class="page-subtitle">Update your physiological metrics and automated BMR/TDEE target calculation</p>
    </div>

    <div class="grid-2" style="gap: 2rem;">
      <!-- Profile Form Card -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h3 class="card-title">Physiological Metrics</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Mifflin-St Jeor metabolic baseline variables</p>
        </div>

        <form id="profile-form">
          <!-- Left-Aligned Safeguard for Form Inputs -->
          <div class="form-group" style="text-align: left;">
            <label class="form-label">Full Name</label>
            <input type="text" id="prof-name" class="form-control" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left;">
            <div class="form-group">
              <label class="form-label">Age (years)</label>
              <input type="number" id="prof-age" class="form-control" min="15" max="100" required>
            </div>
            <div class="form-group">
              <label class="form-label">Gender</label>
              <select id="prof-gender" class="form-select">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left;">
            <div class="form-group">
              <label class="form-label">Height (cm)</label>
              <input type="number" id="prof-height" class="form-control" min="100" max="250" required>
            </div>
            <div class="form-group">
              <label class="form-label">Weight (kg)</label>
              <input type="number" id="prof-weight" class="form-control" min="30" max="250" step="0.5" required>
            </div>
          </div>

          <div class="form-group" style="text-align: left;">
            <label class="form-label">Activity Level</label>
            <select id="prof-activity" class="form-select">
              <option value="sedentary">Sedentary (Little to no exercise)</option>
              <option value="light">Lightly Active (1-3 days/week)</option>
              <option value="moderate">Moderately Active (3-5 days/week)</option>
              <option value="active">Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 1.8rem; text-align: left;">
            <label class="form-label">Fitness Goal</label>
            <select id="prof-goal" class="form-select">
              <option value="lose">Fat Loss (-20% Calorie Deficit)</option>
              <option value="maintain">Weight Maintenance (TDEE Baseline)</option>
              <option value="gain">Muscle Surplus (+15% Calorie Surplus)</option>
            </select>
          </div>

          <button type="submit" id="btn-save-profile" class="btn btn-primary" style="width: 100%; padding: 0.85rem;">
            💾 Save Profile & Recalculate Targets
          </button>
          <div id="prof-status" style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; height: 1.2rem;"></div>
        </form>
      </div>

      <!-- Live Calculated Targets Card (with Inline Editing) -->
      <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h3 class="card-title">Metabolic Recommendation</h3>
            <span id="target-pill-badge" class="badge badge-green">Automated Mifflin-St Jeor</span>
          </div>

          <div style="background-color: var(--secondary-bg); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center; margin-bottom: 1.5rem; position: relative;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem;">DAILY CALORIE TARGET</div>
            
            <!-- Inline Target Display Container -->
            <div style="display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; position: relative;" id="target-calorie-container">
              <span id="target-cal-text" style="font-family: var(--font-mono); font-size: 2.4rem; font-weight: 800; color: var(--accent-blue); cursor: pointer;" title="Click to edit calorie target">0</span>
              <input type="number" id="target-cal-input" style="display: none; font-family: var(--font-mono); font-size: 2.4rem; font-weight: 800; color: var(--accent-blue); background: transparent; border: none; outline: none; border-bottom: 2px dashed var(--accent-blue); width: 140px; text-align: right; padding: 0;" min="500" max="10000">
              <span style="font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--text-secondary);">kcal</span>
              
              <!-- Subtle Edit Icon / Save Checkmark -->
              <button id="btn-toggle-edit-target" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.2rem; display: inline-flex; align-items: center; margin-left: 0.2rem;" title="Edit Calorie Target">
                <svg id="svg-pencil-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <svg id="svg-check-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>

            <div id="target-bmr-tdee" style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.4rem;">BMR: 0 | TDEE: 0</div>
          </div>

          <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">Recommended Macro Distribution</h4>
          
          <div class="macro-grid" style="grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div class="macro-box">
              <div class="macro-label">Protein</div>
              <div id="target-prot-display" class="macro-value" style="color: #3B82F6;">0g</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Carbs</div>
              <div id="target-carb-display" class="macro-value" style="color: #F59E0B;">0g</div>
            </div>
            <div class="macro-box">
              <div class="macro-label">Fat</div>
              <div id="target-fat-display" class="macro-value" style="color: #EF4444;">0g</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 1.8rem; text-align: center;">
          <button id="btn-goto-dash-2" class="btn btn-secondary" style="width: 100%;">📊 Go to Dashboard</button>
        </div>
      </div>
    </div>

    <!-- ⚖️ Accountability & Calorie Rollover Panel -->
    <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; text-align: left;">
        <div>
          <h3 class="card-title" style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            ⚖️ Accountability & Calorie Rollover Engine
          </h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.2rem 0 0 0;">
            Automatically adjust upcoming daily targets when exceeding metabolic thresholds
          </p>
        </div>
        <span class="badge badge-orange" style="background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">
          Smart Rollover
        </span>
      </div>

      <div style="background: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
          <label for="prof-rollover-toggle" style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary); cursor: pointer;">
            Calorie Rollover
          </label>
          <input type="checkbox" id="prof-rollover-toggle" style="width: 22px; height: 22px; accent-color: #F59E0B; cursor: pointer;">
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.2rem; line-height: 1.5;">
          Enabling this will reduce future targets when you exceed today's goal.
        </p>

        <div id="rollover-options-box" style="display: none; border-top: 1px dashed var(--border-color); padding-top: 1.2rem;">
          <label class="form-label" style="font-size: 0.88rem; font-weight: 700; margin-bottom: 0.6rem; display: block; color: var(--text-primary);">
            Rollover Distribution Window
          </label>
          <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;" id="rollover-segmented-control">
            <button type="button" class="btn btn-segmented" data-window="1" style="flex: 1; padding: 0.65rem 1rem; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: #FFFFFF; color: var(--text-primary); cursor: pointer;">Next day only</button>
            <button type="button" class="btn btn-segmented" data-window="3" style="flex: 1; padding: 0.65rem 1rem; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: #FFFFFF; color: var(--text-primary); cursor: pointer;">Spread over 3 days</button>
            <button type="button" class="btn btn-segmented" data-window="7" style="flex: 1; padding: 0.65rem 1rem; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: #FFFFFF; color: var(--text-primary); cursor: pointer;">Spread over 7 days</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#profile-form');
  const profStatus = container.querySelector('#prof-status');
  
  const targetText = container.querySelector('#target-cal-text');
  const targetInput = container.querySelector('#target-cal-input');
  const toggleEditBtn = container.querySelector('#btn-toggle-edit-target');
  const pencilIcon = container.querySelector('#svg-pencil-icon');
  const checkIcon = container.querySelector('#svg-check-icon');
  const pillBadge = container.querySelector('#target-pill-badge');

  const rolloverToggle = container.querySelector('#prof-rollover-toggle');
  const rolloverOptionsBox = container.querySelector('#rollover-options-box');
  const segmentedBtns = container.querySelectorAll('#rollover-segmented-control .btn-segmented');

  let isEditing = false;
  let currentUserData = null;
  let currentRolloverWindow = 3;

  async function loadProfile() {
    try {
      const user = await api.getUserProfile();
      currentUserData = user;

      container.querySelector('#prof-name').value = user.name || '';
      container.querySelector('#prof-age').value = user.age || 25;
      container.querySelector('#prof-gender').value = user.gender || 'male';
      container.querySelector('#prof-height').value = user.height_cm || 175;
      container.querySelector('#prof-weight').value = user.weight_kg || 70;
      container.querySelector('#prof-activity').value = user.activity_level || 'moderate';
      container.querySelector('#prof-goal').value = user.goal || 'maintain';

      // Rollover settings
      rolloverToggle.checked = Boolean(user.rollover_enabled);
      currentRolloverWindow = Number(user.rollover_window) || 3;
      updateRolloverUI();

      renderTargetDisplay(user);
    } catch (err) {
      console.error(err);
    }
  }

  function updateRolloverUI() {
    if (rolloverToggle.checked) {
      rolloverOptionsBox.style.display = 'block';
    } else {
      rolloverOptionsBox.style.display = 'none';
    }

    segmentedBtns.forEach(btn => {
      const w = Number(btn.getAttribute('data-window'));
      if (w === currentRolloverWindow) {
        btn.style.backgroundColor = '#F59E0B';
        btn.style.color = '#FFFFFF';
        btn.style.borderColor = '#F59E0B';
      } else {
        btn.style.backgroundColor = '#FFFFFF';
        btn.style.color = 'var(--text-primary)';
        btn.style.borderColor = 'var(--border-color)';
      }
    });
  }

  rolloverToggle.addEventListener('change', async () => {
    updateRolloverUI();
    try {
      const updated = await api.updateProfile({
        rollover_enabled: rolloverToggle.checked,
        rollover_window: currentRolloverWindow
      });
      authStore.setUser(updated);
      currentUserData = updated;
    } catch (err) {
      console.error(err);
    }
  });

  segmentedBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentRolloverWindow = Number(btn.getAttribute('data-window'));
      updateRolloverUI();
      try {
        const updated = await api.updateProfile({
          rollover_enabled: rolloverToggle.checked,
          rollover_window: currentRolloverWindow
        });
        authStore.setUser(updated);
        currentUserData = updated;
      } catch (err) {
        console.error(err);
      }
    });
  });

  function renderTargetDisplay(user) {
    targetText.textContent = user.target_calories;
    targetInput.value = user.target_calories;

    if (user.is_custom_target) {
      pillBadge.textContent = "Custom Target";
      pillBadge.className = "badge badge-blue";
    } else {
      pillBadge.textContent = "Automated Mifflin-St Jeor";
      pillBadge.className = "badge badge-green";
    }

    container.querySelector('#target-bmr-tdee').textContent = `BMR: ${user.bmr} kcal | TDEE: ${user.tdee} kcal`;
    container.querySelector('#target-prot-display').textContent = `${user.target_protein_g}g`;
    container.querySelector('#target-carb-display').textContent = `${user.target_carbs_g}g`;
    container.querySelector('#target-fat-display').textContent = `${user.target_fat_g}g`;
  }

  async function saveCustomCalorieTarget() {
    const newCal = Number(targetInput.value);
    if (!newCal || newCal < 500 || newCal > 10000) {
      alert("Please enter a valid calorie target between 500 and 10,000.");
      return;
    }

    try {
      const updated = await api.updateProfile({ custom_target_calories: newCal });
      authStore.setUser(updated);
      currentUserData = updated;
      renderTargetDisplay(updated);
      toggleEditState(false);
    } catch (err) {
      alert(`Error updating target: ${err.message}`);
    }
  }

  function toggleEditState(editing) {
    isEditing = editing;
    if (isEditing) {
      targetText.style.display = 'none';
      targetInput.style.display = 'inline-block';
      pencilIcon.style.display = 'none';
      checkIcon.style.display = 'inline-block';
      targetInput.focus();
    } else {
      targetText.style.display = 'inline';
      targetInput.style.display = 'none';
      pencilIcon.style.display = 'inline-block';
      checkIcon.style.display = 'none';
    }
  }

  targetText.addEventListener('click', () => toggleEditState(true));
  toggleEditBtn.addEventListener('click', () => {
    if (isEditing) {
      saveCustomCalorieTarget();
    } else {
      toggleEditState(true);
    }
  });

  targetInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCustomCalorieTarget();
    } else if (e.key === 'Escape') {
      toggleEditState(false);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    profStatus.style.color = "var(--text-secondary)";
    profStatus.textContent = "Saving profile...";

    try {
      const updated = await api.updateProfile({
        name: container.querySelector('#prof-name').value.trim(),
        age: Number(container.querySelector('#prof-age').value),
        gender: container.querySelector('#prof-gender').value,
        height_cm: Number(container.querySelector('#prof-height').value),
        weight_kg: Number(container.querySelector('#prof-weight').value),
        activity_level: container.querySelector('#prof-activity').value,
        goal: container.querySelector('#prof-goal').value,
        rollover_enabled: rolloverToggle.checked,
        rollover_window: currentRolloverWindow,
        recalculate: true
      });

      authStore.setUser(updated);
      profStatus.style.color = "var(--success-green)";
      profStatus.textContent = "✓ Profile & targets updated!";
      renderTargetDisplay(updated);
    } catch (err) {
      profStatus.style.color = "var(--error-red)";
      profStatus.textContent = `Error: ${err.message}`;
    }
  });

  container.querySelector('#btn-goto-dash-2').addEventListener('click', () => onNavigate('dashboard'));
  loadProfile();

  return container;
}
