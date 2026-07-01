import { api, authStore } from '../services/api.js';

export function renderAuthView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';
  container.style.cssText = 'display: flex; justify-content: center; align-items: center; min-height: 75vh;';

  let currentStep = 1;
  let isLoginMode = false;

  container.innerHTML = `
    <div class="card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.05); max-width: 520px; width: 100%;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <div class="brand-icon" style="margin: 0 auto 1rem; width: 44px; height: 44px; font-size: 1.3rem;">🌿</div>
        <h2 id="auth-title" style="font-size: 1.6rem; font-weight: 800; color: #111827; margin-bottom: 0.4rem;">Mandatory Onboarding Wizard</h2>
        <p id="auth-subtitle" style="font-size: 0.95rem; color: #4B5563;">Step 1 of 2: Create Account Credentials</p>
      </div>

      <form id="auth-form" style="text-align: left;">
        <!-- STEP 1: Account Credentials -->
        <div id="step-1-fields">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="auth-name" class="form-control" placeholder="e.g. Alex Mercer" autocomplete="name">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="auth-email" class="form-control" placeholder="alex@example.com" required autocomplete="email">
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label">Password</label>
            <input type="password" id="auth-password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
          </div>
        </div>

        <!-- STEP 2: Physiological Data Onboarding -->
        <div id="step-2-fields" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Age (years)</label>
              <input type="number" id="auth-age" class="form-control" value="25" min="15" max="100">
            </div>
            <div class="form-group">
              <label class="form-label">Gender</label>
              <select id="auth-gender" class="form-select">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Height (cm)</label>
              <input type="number" id="auth-height" class="form-control" value="175" min="100" max="250">
            </div>
            <div class="form-group">
              <label class="form-label">Weight (kg)</label>
              <input type="number" id="auth-weight" class="form-control" value="70" min="30" max="250" step="0.5">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Activity Level</label>
            <select id="auth-activity" class="form-select">
              <option value="sedentary">Sedentary (Little to no exercise)</option>
              <option value="light">Lightly Active (1-3 days/week)</option>
              <option value="moderate" selected>Moderately Active (3-5 days/week)</option>
              <option value="active">Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label">Primary Fitness Goal</label>
            <select id="auth-goal" class="form-select">
              <option value="lose">Fat Loss (-20% Deficit)</option>
              <option value="maintain" selected>Maintain Weight (TDEE Baseline)</option>
              <option value="gain">Muscle Surplus (+15% Surplus)</option>
            </select>
          </div>
        </div>

        <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width: 100%; padding: 0.85rem;">
          Next: Physiological Metrics →
        </button>

        <div id="auth-error" style="margin-top: 0.8rem; color: var(--error-red); font-size: 0.85rem; text-align: center; height: 1.2rem;"></div>
      </form>

      <div style="margin-top: 1.8rem; padding-top: 1.2rem; border-top: 1px solid var(--border-color); text-align: center; font-size: 0.9rem; color: #4B5563;">
        <span id="auth-toggle-text">Already have an account?</span>
        <a href="#" id="auth-toggle-btn" style="color: var(--accent-blue); font-weight: 700; text-decoration: none; margin-left: 0.3rem;">Sign In</a>
      </div>
    </div>
  `;

  const form = container.querySelector('#auth-form');
  const title = container.querySelector('#auth-title');
  const subtitle = container.querySelector('#auth-subtitle');
  const submitBtn = container.querySelector('#auth-submit-btn');
  const toggleBtn = container.querySelector('#auth-toggle-btn');
  const toggleText = container.querySelector('#auth-toggle-text');
  const step1 = container.querySelector('#step-1-fields');
  const step2 = container.querySelector('#step-2-fields');
  const nameGroup = container.querySelector('#auth-name').parentElement;
  const errorEl = container.querySelector('#auth-error');

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    errorEl.textContent = '';
    currentStep = 1;

    if (isLoginMode) {
      title.textContent = 'Welcome Back';
      subtitle.textContent = 'Enter your credentials to access Equilibria';
      nameGroup.style.display = 'none';
      step2.style.display = 'none';
      step1.style.display = 'block';
      submitBtn.textContent = 'Sign In to Dashboard';
      toggleText.textContent = "Don't have an account?";
      toggleBtn.textContent = 'Sign Up';
    } else {
      title.textContent = 'Mandatory Onboarding Wizard';
      subtitle.textContent = 'Step 1 of 2: Create Account Credentials';
      nameGroup.style.display = 'block';
      step2.style.display = 'none';
      step1.style.display = 'block';
      submitBtn.textContent = 'Next: Physiological Metrics →';
      toggleText.textContent = 'Already have an account?';
      toggleBtn.textContent = 'Sign In';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const email = container.querySelector('#auth-email').value.trim();
    const password = container.querySelector('#auth-password').value;

    if (isLoginMode) {
      try {
        submitBtn.disabled = true;
        const res = await api.login({ email, password });
        authStore.setToken(res.token);
        authStore.setUser(res.user);
        onNavigate('dashboard');
      } catch (err) {
        errorEl.textContent = err.message;
        submitBtn.disabled = false;
      }
      return;
    }

    if (currentStep === 1) {
      const name = container.querySelector('#auth-name').value.trim();
      if (!name) {
        errorEl.textContent = 'Please enter your full name.';
        return;
      }
      currentStep = 2;
      step1.style.display = 'none';
      step2.style.display = 'block';
      title.textContent = 'Physiological Baseline Data';
      subtitle.textContent = 'Step 2 of 2: Required metrics for BMR/TDEE math';
      submitBtn.textContent = 'Complete Onboarding & Access Dashboard 🚀';
      return;
    }

    if (currentStep === 2) {
      try {
        submitBtn.disabled = true;
        const payload = {
          name: container.querySelector('#auth-name').value.trim(),
          email,
          password,
          age: Number(container.querySelector('#auth-age').value),
          gender: container.querySelector('#auth-gender').value,
          height_cm: Number(container.querySelector('#auth-height').value),
          weight_kg: Number(container.querySelector('#auth-weight').value),
          activity_level: container.querySelector('#auth-activity').value,
          goal: container.querySelector('#auth-goal').value
        };

        const res = await api.register(payload);
        authStore.setToken(res.token);
        authStore.setUser(res.user);
        onNavigate('dashboard');
      } catch (err) {
        errorEl.textContent = err.message;
        submitBtn.disabled = false;
      }
    }
  });

  return container;
}
