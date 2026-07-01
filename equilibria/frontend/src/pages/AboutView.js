export function renderAboutView(onNavigate) {
  const container = document.createElement('div');
  container.className = 'page';

  container.innerHTML = `
    <div class="page-header" style="margin-bottom: 2rem;">
      <h1 class="page-title" style="font-size: 2.1rem; font-weight: 800; color: #111827; letter-spacing: -0.03em;">
        ⚙️ About Equilibria
      </h1>
      <p class="page-subtitle" style="color: #4B5563; font-size: 1rem;">
        Scientific precision nutrition platform and system architecture overview
      </p>
    </div>

    <div class="grid-2" style="gap: 2rem; margin-bottom: 2.5rem;">
      <!-- Mission & Science Card -->
      <div style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: #111827; margin-bottom: 1rem;">
          🌱 Nutritional Science & Data Sources
        </h3>
        <p style="color: #4B5563; line-height: 1.6; font-size: 0.98rem; margin-bottom: 1.2rem;">
          Equilibria was engineered with a zero-manual-math philosophy. Most calorie counters require manual gram conversions or rely on inaccurate, crowdsourced user entry. Equilibria connects directly to government-verified laboratory databases to guarantee lab-grade nutritional accuracy.
        </p>
        <p style="color: #4B5563; line-height: 1.6; font-size: 0.98rem;">
          By querying official USDA FoodData Central foundation items and verified ICMR/IFCT 2020 Indian staple profiles, Equilibria ensures every macro and micro total is mathematically exact.
        </p>
      </div>

      <!-- System Architecture Overview Card -->
      <div style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: #111827; margin-bottom: 1rem;">
          💻 System Architecture Overview
        </h3>
        <ul style="color: #4B5563; line-height: 1.7; font-size: 0.95rem; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem;">
          <li>ESM JavaScript modular views styled with a premium, minimalist light-mode aesthetic and custom CSS tokens.</li>
          <li>Node.js & Express RESTful backend architecture API endpoints.</li>
          <li>Relational database schema mapping Users, Foods, FoodPortions, Meals, and DailyLogs.</li>
          <li>Automated Mifflin-St Jeor metabolic BMR & TDEE calculation engine.</li>
          <li>Live asynchronous USDA FoodData Central & ICMR/IFCT 2020 verification matrix.</li>
        </ul>
      </div>
    </div>

    <!-- Data Sources Grid -->
    <div style="background: #FFFFFF; border: none; border-radius: 40px; padding: 2.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      <h3 style="font-size: 1.3rem; font-weight: 800; color: #111827; margin-bottom: 1.5rem;">
        🛡️ Lab-Verified Standards Integrated
      </h3>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.8rem;">
        <div style="background: #F9FAFB; border-radius: 20px; padding: 1.5rem; border: 1px solid #E5E7EB;">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem;">
            <span style="font-size: 1.2rem;">🏛️</span>
            <h4 style="font-weight: 700; color: #111827; font-size: 1.05rem; margin:0;">USDA FoodData Central</h4>
          </div>
          <p style="color: #4B5563; font-size: 0.9rem; line-height: 1.5; margin:0;">
            Official United States Department of Agriculture lab-verified foundation database for raw whole foods, fruits, vegetables, and meats.
          </p>
        </div>

        <div style="background: #F9FAFB; border-radius: 20px; padding: 1.5rem; border: 1px solid #E5E7EB;">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem;">
            <span style="font-size: 1.2rem;">🇮🇳</span>
            <h4 style="font-weight: 700; color: #111827; font-size: 1.05rem; margin:0;">ICMR / IFCT 2020</h4>
          </div>
          <p style="color: #4B5563; font-size: 0.9rem; line-height: 1.5; margin:0;">
            Indian Council of Medical Research & Indian Food Composition Tables for traditional raw Indian staples (Roti, Dal, Paneer, Rice).
          </p>
        </div>
      </div>
    </div>
  `;

  return container;
}
