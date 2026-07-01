const hostname = window.location.hostname || 'localhost';
const API_BASE = `http://${hostname}:5000/api`;

export const authStore = {
  getToken: () => localStorage.getItem('nutritrack_token'),
  setToken: (token) => localStorage.setItem('nutritrack_token', token),
  getUser: () => {
    const u = localStorage.getItem('nutritrack_user');
    return u ? JSON.parse(u) : null;
  },
  setUser: (user) => localStorage.setItem('nutritrack_user', JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem('nutritrack_token');
    localStorage.removeItem('nutritrack_user');
  }
};

async function request(endpoint, options = {}) {
  try {
    const token = authStore.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['x-user-id'] = token;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMe: () => request('/auth/me'),

  // Foods
  getFoods: (search, category) => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (category) query.append('category', category);
    return request(`/foods?${query.toString()}`);
  },
  getFoodUnits: (foodId) => request(`/foods/${foodId}/units`),

  // Calculator
  convert: (food_id, unit_name, quantity) => request('/calculator/convert', {
    method: 'POST',
    body: JSON.stringify({ food_id, unit_name, quantity })
  }),
  parseDescription: (description) => request('/calculator/parse-description', {
    method: 'POST',
    body: JSON.stringify({ description })
  }),

  // User & Profile
  getUserProfile: () => request('/user/profile'),
  updateUserProfile: (data) => request('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateProfile: (data) => request('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Meals / Templates
  getMeals: () => request('/meals'),
  createMeal: (data) => request('/meals', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteMeal: (id) => request(`/meals/${id}`, { method: 'DELETE' }),

  // Daily Logs
  getLogs: (date) => request(`/logs?date=${date || ''}`),
  addLog: (data) => request('/logs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteLog: (id) => request(`/logs/${id}`, { method: 'DELETE' }),

  // Dashboard & Analytics
  getDashboardToday: (date) => request(`/dashboard/today?date=${date || ''}`),
  getWeeklyTrend: (date) => request(`/dashboard/weekly?date=${date || ''}`),
  getHistory: () => request('/history')
};
