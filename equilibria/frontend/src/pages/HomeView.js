export function renderHomeView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';
  container.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 900px; margin: 0 auto; text-align: center;';

  container.innerHTML = `
    <div style="padding: 3rem 1rem 2.5rem; text-align: center; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
      <div class="badge badge-green" style="margin-bottom: 1.2rem; display: inline-flex; font-size: 0.85rem; padding: 0.4rem 1rem;">
        ⚡ Precision Macro Architecture
      </div>
      <h1 style="font-size: 3.2rem; font-weight: 800; color: #111827; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 1.2rem; text-align: center;">
        Track Calories with <span style="background: linear-gradient(135deg, #2d6a4f, #40916c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Scientific Accuracy</span>
      </h1>
      <p style="font-size: 1.15rem; color: #6B7280; line-height: 1.6; max-width: 640px; margin: 0 auto; text-align: center;">
        Instant precise calculations backed by ICMR/IFCT 2020 and USDA databases with intelligent algorithmic macro feedback.
      </p>
    </div>

    <!-- Premium Floating Card Grid (Centered) -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; width: 100%; max-width: 880px; margin: 1rem auto 3rem;" class="grid-2">
      
      <!-- Individual Food Calculator Card -->
      <div id="cta-calc" class="card cta-card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: space-between;">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
          <div style="font-size: 2.8rem; margin-bottom: 1rem;">🧮</div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #111827; margin-bottom: 0.6rem;">Individual Food Calculator</h3>
          <p style="color: #6B7280; margin-bottom: 1.8rem; font-size: 0.98rem; line-height: 1.5;">
            Instantly search raw ingredients or Indian staples. Select specific portion sizes with zero manual math.
          </p>
        </div>
        <button class="btn btn-primary" style="padding: 0.85rem 1.8rem; font-size: 0.95rem; background: linear-gradient(135deg, #2d6a4f, #40916c); color: #FFFFFF; border: none; border-radius: 20px; font-weight: 700; cursor: pointer; margin: 0 auto;">
          Start Calculating →
        </button>
      </div>

      <!-- Meal Builder Card -->
      <div id="cta-meal" class="card cta-card" style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: space-between;">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
          <div style="font-size: 2.8rem; margin-bottom: 1rem;">🍳</div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #111827; margin-bottom: 0.6rem;">Meal Builder</h3>
          <p style="color: #6B7280; margin-bottom: 1.8rem; font-size: 0.98rem; line-height: 1.5;">
            Combine multiple staple ingredients into custom meals and recipes with full itemized macro breakdowns.
          </p>
        </div>
        <button class="btn btn-primary" style="padding: 0.85rem 1.8rem; font-size: 0.95rem; background: linear-gradient(135deg, #2d6a4f, #40916c); color: #FFFFFF; border: none; border-radius: 20px; font-weight: 700; cursor: pointer; margin: 0 auto;">
          Build Meal →
        </button>
      </div>

    </div>

    <!-- Pill Badges Row -->
    <div style="display: flex; gap: 0.8rem; justify-content: center; align-items: center; margin-top: -1rem; margin-bottom: 2rem; flex-wrap: wrap;">
      <span class="badge badge-green" style="font-size: 0.85rem; padding: 0.45rem 1rem;">🇮🇳 500+ Indian Foods</span>
      <span class="badge badge-blue" style="font-size: 0.85rem; padding: 0.45rem 1rem;">🔬 USDA Verified</span>
      <span class="badge badge-orange" style="font-size: 0.85rem; padding: 0.45rem 1rem;">⚡ Zero Manual Math</span>
    </div>
  `;

  container.querySelector('#cta-calc').addEventListener('click', () => onNavigate('calculator'));
  container.querySelector('#cta-meal').addEventListener('click', () => onNavigate('meal-builder'));

  return container;
}
