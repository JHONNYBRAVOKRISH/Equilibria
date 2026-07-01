import { renderHomeView } from './pages/HomeView.js';
import { renderCalculatorView } from './pages/CalculatorView.js';
import { renderMealBuilderView } from './pages/MealBuilderView.js';
import { renderDashboardView } from './pages/DashboardView.js';
import { renderHistoryView } from './pages/HistoryView.js';
import { renderProfileView } from './pages/ProfileView.js';
import { renderSavedMealsView } from './pages/SavedMealsView.js';
import { renderAuthView } from './pages/AuthView.js';
import { renderAboutView } from './pages/AboutView.js';
import { authStore, api } from './services/api.js';

class App {
  constructor() {
    this.currentPage = 'home';
    this.init();
  }

  async init() {
    if (authStore.getToken()) {
      try {
        const user = await api.getMe();
        authStore.setUser(user);
      } catch (e) {
        console.warn("Session expired. Clearing auth state.");
        authStore.clear();
      }
    }
    this.renderLayout();
    this.navigate('home');
  }

  renderLayout() {
    const appEl = document.getElementById('app');
    const user = authStore.getUser();

    appEl.innerHTML = `
      <div class="sidebar-layout">
        <!-- Fixed Left Glassmorphic Sidebar Navigation -->
        <aside class="sidebar">
          <div>
            <a href="#" id="brand-link" class="brand">
              <div class="brand-icon">🌿</div>
              <span>Equilibria</span>
            </a>

            <ul class="sidebar-nav">
              <li><a href="#" data-page="home" class="nav-link">🏠 Home</a></li>
              <li><a href="#" data-page="dashboard" class="nav-link">📊 Dashboard</a></li>
              <li><a href="#" data-page="calculator" class="nav-link">🧮 Calculator</a></li>
              <li><a href="#" data-page="meal-builder" class="nav-link">🍳 Meal Builder</a></li>
              <li><a href="#" data-page="saved-meals" class="nav-link">🥗 Saved Meals</a></li>
              <li><a href="#" data-page="history" class="nav-link">📅 History</a></li>
              <li><a href="#" data-page="profile" class="nav-link">👤 Profile & Goals</a></li>
              <li><a href="#" data-page="about" class="nav-link">⚙️ Settings & Info</a></li>
            </ul>
          </div>

          <div style="padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
            ${user ? `
              <div style="display: flex; align-items: center; justify-content: space-between; background: var(--secondary-bg); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="overflow: hidden;">
                  <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${user.name}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">Active Member</div>
                </div>
                <button id="btn-nav-logout" class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Logout</button>
              </div>
            ` : `
              <a href="#" data-page="auth" class="btn btn-primary" style="width: 100%;">Sign In / Join</a>
            `}
          </div>
        </aside>

        <!-- Main Content Canvas -->
        <div class="main-wrapper">
          <main id="main-content"></main>
        </div>
      </div>
    `;

    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.getAttribute('data-page');
        this.navigate(page);
      });
    });

    document.getElementById('brand-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('home');
    });

    const logoutBtn = document.getElementById('btn-nav-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        authStore.clear();
        this.renderLayout();
        this.navigate('auth');
      });
    }
  }

  navigate(page) {
    const protectedRoutes = ['calculator', 'meal-builder', 'dashboard', 'saved-meals', 'history', 'profile'];
    const token = authStore.getToken();

    if (protectedRoutes.includes(page) && !token) {
      this.currentPage = 'auth';
      this.renderLayout();
      const main = document.getElementById('main-content');
      main.innerHTML = '';
      main.appendChild(renderAuthView((p) => this.navigate(p)));
      return;
    }

    this.currentPage = page;
    this.renderLayout();

    // Active state in sidebar
    document.querySelectorAll('.nav-link').forEach(l => {
      if (l.getAttribute('data-page') === page) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });

    const main = document.getElementById('main-content');
    main.innerHTML = '';

    const onNavigate = (p) => this.navigate(p);

    switch (page) {
      case 'home':
        main.appendChild(renderHomeView(onNavigate));
        break;
      case 'calculator':
        main.appendChild(renderCalculatorView(onNavigate));
        break;
      case 'meal-builder':
        main.appendChild(renderMealBuilderView(onNavigate));
        break;
      case 'dashboard':
        main.appendChild(renderDashboardView(onNavigate));
        break;
      case 'saved-meals':
        main.appendChild(renderSavedMealsView(onNavigate));
        break;
      case 'history':
        main.appendChild(renderHistoryView(onNavigate));
        break;
      case 'profile':
        main.appendChild(renderProfileView(onNavigate));
        break;
      case 'auth':
        main.appendChild(renderAuthView(onNavigate));
        break;
      case 'about':
        main.appendChild(renderAboutView(onNavigate));
        break;
      default:
        main.appendChild(renderHomeView(onNavigate));
    }

    window.scrollTo(0, 0);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
