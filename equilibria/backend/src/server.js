import express from 'express';
import cors from 'cors';
import { db } from './config/database.js';
import { CalculatorService } from './services/calculatorService.js';
import { ConversionService } from './services/conversionService.js';
import { NutritionApiService, ifctVerifiedFoods } from './services/nutritionApiService.js';
import { NutritionAnalysisService } from './services/nutritionAnalysisService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to extract user ID from headers
const getUserId = (req) => {
  return req.headers['x-user-id'] || 'usr_default';
};

// Helper for today YYYY-MM-DD
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- AUTH / USER ENDPOINTS ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existing = db.find('users', u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name || email.split('@')[0],
    email,
    password, // Demo only
    age: 25,
    gender: 'male',
    height_cm: 175,
    weight_kg: 70,
    activity_level: 'moderate',
    goal: 'maintain',
    target_calories: 2000,
    target_protein_g: 120,
    target_carbs_g: 200,
    target_fat_g: 60,
    target_fiber_g: 28,
    rollover_enabled: false,
    rollover_window: 3,
    created_at: new Date().toISOString()
  };

  db.insert('users', newUser);
  res.status(201).json({ token: newUser.id, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.find('users', u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ token: user.id, user });
});

app.get('/api/auth/me', (req, res) => {
  const userId = getUserId(req);
  const user = db.find('users', u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// --- FOOD SEARCH & DICTIONARY ---
app.get('/api/foods', async (req, res) => {
  const { search } = req.query;
  try {
    const results = await NutritionApiService.searchOrFetchFoods(search);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/foods/:id/units', (req, res) => {
  try {
    const units = ConversionService.getFoodUnits(req.params.id);
    res.json(units);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// --- CALCULATOR & METABOLIC ENDPOINTS ---
app.post('/api/calculator/convert', (req, res) => {
  const { food_id, unit_name, quantity } = req.body;
  try {
    const computed = ConversionService.calculateFoodMacros(food_id, unit_name, quantity);
    res.json(computed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper to parse description segment
function parseSegment(segment) {
  const qtyRegex = /(?:^|\b)(\d+(?:\.\d+)?)\s*(grams?|g|ml|milliliters?|oz|ounces?|lbs|pounds?|cups?|tbsp|tablespoons?|tsp|teaspoons?|pieces?|slices?|bowls?|plates?|glasses?|servings?|katoris?|cans?|packets?|packs?|bars?|scoops?|wraps?|rolls?|frankies?|rotis?|idlis?|puris?|samosas?|kachoris?|burgers?|pizzas?|slices?|scoops?|cups?|katoris?)?\b/i;
  
  let quantity = 1;
  let unit = '';
  let foodQuery = segment;

  const match = segment.match(qtyRegex);
  if (match) {
    quantity = Number(match[1]);
    unit = match[2] ? match[2].toLowerCase().trim() : '';
    foodQuery = segment.replace(match[0], '').trim();
  } else {
    const trailingQtyRegex = /\b(\d+(?:\.\d+)?)\s*(grams?|g|ml|milliliters?|oz|ounces?|lbs|pounds?|cups?|tbsp|tablespoons?|tsp|teaspoons?|pieces?|slices?|bowls?|plates?|glasses?|servings?|katoris?|cans?|packets?|packs?|bars?|scoops?|wraps?|rolls?|frankies?|rotis?|idlis?|puris?|samosas?|kachoris?|burgers?|pizzas?|slices?|scoops?|cups?|katoris?)?$/i;
    const trailingMatch = segment.match(trailingQtyRegex);
    if (trailingMatch) {
      quantity = Number(trailingMatch[1]);
      unit = trailingMatch[2] ? trailingMatch[2].toLowerCase().trim() : '';
      foodQuery = segment.replace(trailingMatch[0], '').trim();
    }
  }

  foodQuery = foodQuery
    .replace(/^(?:of|and|&|with|for)\s+/i, '')
    .replace(/\s+(?:of|and|&|with|for)\s+/i, ' ')
    .replace(/[.,&]/g, '')
    .trim();

  return { quantity, unit, foodQuery };
}

function getCanonicalUnit(unit, portions = []) {
  if (!unit) return '1 Serving';
  const u = unit.toLowerCase();
  
  if (u === 'g' || u.startsWith('gram') || u === 'grams') return 'Custom Grams (g)';
  if (u === 'ml' || u.startsWith('milliliter') || u === 'milliliters') return 'Milliliters (ml)';
  if (u === 'oz' || u.startsWith('ounce') || u === 'ounces') return 'Ounces (oz)';
  if (u === 'lbs' || u.startsWith('pound') || u === 'pounds') return 'Pounds (lbs)';
  if (u.startsWith('cup')) return 'Cups';
  if (u === 'tbsp' || u.startsWith('tablespoon')) return 'Tablespoons (tbsp)';
  if (u === 'tsp' || u.startsWith('teaspoon')) return 'Teaspoons (tsp)';
  
  const matchedPortion = portions.find(p => p.name.toLowerCase().includes(u));
  if (matchedPortion) return matchedPortion.name;

  if (u.startsWith('piece') || u.startsWith('slice') || u.startsWith('roti') || u.startsWith('idli') || u.startsWith('puri') || u.startsWith('samosa') || u.startsWith('kachori') || u.startsWith('burger') || u.startsWith('pizza')) {
    const piecePortion = portions.find(p => p.name.toLowerCase().includes('piece'));
    if (piecePortion) return piecePortion.name;
    return '1 Piece';
  }
  
  if (u.startsWith('bowl') || u.startsWith('plate') || u.startsWith('glass') || u.startsWith('serving') || u.startsWith('katori') || u.startsWith('can') || u.startsWith('pack') || u.startsWith('bar') || u.startsWith('scoop') || u.startsWith('wrap') || u.startsWith('roll') || u.startsWith('frankie')) {
    const servingPortion = portions.find(p => p.name.toLowerCase().includes('serving') || p.name.toLowerCase().includes('bowl') || p.name.toLowerCase().includes('glass'));
    if (servingPortion) return servingPortion.name;
    return '1 Serving';
  }

  return '1 Serving';
}

async function findBestFoodMatch(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const food of ifctVerifiedFoods) {
    const name = food.name.toLowerCase();
    let score = 0;

    if (name === q) {
      score = 100;
    } else if (name.startsWith(q)) {
      score = 90;
    } else if (q.includes(name)) {
      score = 80;
    } else if (name.includes(q)) {
      score = 70;
    } else {
      const qWords = q.split(/\s+/);
      const nameWords = name.split(/\s+/);
      const intersection = qWords.filter(w => nameWords.includes(w));
      if (intersection.length > 0) {
        score = 50 + (intersection.length * 5);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = food;
    }
  }

  if (highestScore < 60) {
    try {
      const apiResults = await NutritionApiService.searchOrFetchFoods(query);
      if (apiResults && apiResults.length > 0) {
        return apiResults[0];
      }
    } catch (err) {
      console.error("USDA fallback error during parsing:", err);
    }
  }

  return bestMatch;
}

app.post('/api/calculator/parse-description', async (req, res) => {
  const { description } = req.body;
  if (!description || description.trim().length === 0) {
    return res.json({ ingredients: [], totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 } });
  }

  const segments = description
    .split(/,|\band\b|&|\n/i)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const parsedIngredients = [];
  const totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };

  for (const segment of segments) {
    const { quantity, unit, foodQuery } = parseSegment(segment);
    if (!foodQuery) continue;

    const matchedFood = await findBestFoodMatch(foodQuery);
    if (matchedFood) {
      if (!db.find('foods', f => f.id === matchedFood.id)) {
        db.insert('foods', matchedFood);
      }

      const canonicalUnit = getCanonicalUnit(unit, matchedFood.portions);
      try {
        const computed = ConversionService.calculateFoodMacros(matchedFood.id, canonicalUnit, quantity);
        parsedIngredients.push(computed);

        totals.calories += computed.calories;
        totals.protein_g += computed.protein_g;
        totals.carbs_g += computed.carbs_g;
        totals.fat_g += computed.fat_g;
        totals.fiber_g += computed.fiber_g;
      } catch (err) {
        console.error(`Macro conversion error for segment "${segment}":`, err.message);
      }
    }
  }

  totals.calories = Math.round(totals.calories);
  totals.protein_g = Math.round(totals.protein_g * 10) / 10;
  totals.carbs_g = Math.round(totals.carbs_g * 10) / 10;
  totals.fat_g = Math.round(totals.fat_g * 10) / 10;
  totals.fiber_g = Math.round(totals.fiber_g * 10) / 10;

  res.json({
    ingredients: parsedIngredients,
    totals
  });
});

app.get('/api/user/profile', (req, res) => {
  const userId = getUserId(req);
  const user = db.find('users', u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.put('/api/user/profile', (req, res) => {
  const userId = getUserId(req);
  let user = db.find('users', u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { name, age, gender, height_cm, weight_kg, activity_level, goal, custom_target_calories, rollover_enabled, rollover_window } = req.body;

  let updates = {};
  if (name !== undefined) updates.name = name;
  if (age !== undefined) updates.age = age;
  if (gender !== undefined) updates.gender = gender;
  if (height_cm !== undefined) updates.height_cm = height_cm;
  if (weight_kg !== undefined) updates.weight_kg = weight_kg;
  if (activity_level !== undefined) updates.activity_level = activity_level;
  if (goal !== undefined) updates.goal = goal;
  if (rollover_enabled !== undefined) updates.rollover_enabled = Boolean(rollover_enabled);
  if (rollover_window !== undefined) updates.rollover_window = Number(rollover_window);

  const updatedUserObj = { ...user, ...updates };

  if (custom_target_calories !== undefined) {
    const customTargets = CalculatorService.calculateCustomTargets(updatedUserObj, Number(custom_target_calories));
    updates = { ...updates, ...customTargets };
  } else if (req.body.recalculate) {
    const calcs = CalculatorService.calculateTargets(updatedUserObj);
    updates = { ...updates, ...calcs, is_custom_target: false };
  }

  const updated = db.update('users', u => u.id === userId, updates);
  res.json(updated);
});

// --- MEALS & RECIPES (TEMPLATES) ---
app.get('/api/meals', (req, res) => {
  const userId = getUserId(req);
  const userMeals = db.filter('meals', m => m.user_id === userId);
  
  const formatted = userMeals.map(m => {
    const ingredients = db.filter('meal_ingredients', mi => mi.meal_id === m.id);
    return {
      ...m,
      ingredients
    };
  });

  res.json(formatted);
});

app.post('/api/meals', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, description, ingredients } = req.body;
  if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "Meal name and at least one ingredient required" });
  }

  const mealId = `meal_${Date.now()}`;
  let totalCals = 0, totalProt = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0;

  const processedIngredients = ingredients.map((ing, idx) => {
    const computed = ConversionService.calculateFoodMacros(ing.food_id, ing.unit_name, ing.quantity);
    totalCals += computed.calories;
    totalProt += computed.protein_g;
    totalCarbs += computed.carbs_g;
    totalFat += computed.fat_g;
    totalFiber += computed.fiber_g;

    const ingRecord = {
      id: `mi_${Date.now()}_${idx}`,
      meal_id: mealId,
      food_id: ing.food_id,
      unit_name: ing.unit_name,
      quantity: ing.quantity,
      calculated_calories: computed.calories,
      calculated_protein: computed.protein_g,
      calculated_carbs: computed.carbs_g,
      calculated_fat: computed.fat_g,
      calculated_fiber: computed.fiber_g
    };
    db.insert('meal_ingredients', ingRecord);
    return ingRecord;
  });

  const newMeal = {
    id: mealId,
    user_id: userId,
    name,
    description: description || '',
    total_calories: Math.round(totalCals),
    total_protein: Math.round(totalProt * 10) / 10,
    total_carbs: Math.round(totalCarbs * 10) / 10,
    total_fat: Math.round(totalFat * 10) / 10,
    total_fiber: Math.round(totalFiber * 10) / 10,
    created_at: new Date().toISOString()
  };

  db.insert('meals', newMeal);
  res.status(201).json({ ...newMeal, ingredients: processedIngredients });
});

app.delete('/api/meals/:id', (req, res) => {
  const userId = getUserId(req);
  const deleted = db.delete('meals', m => m.id === req.params.id && m.user_id === userId);
  if (!deleted) return res.status(404).json({ error: "Meal template not found" });

  res.json({ message: "Meal template deleted successfully" });
});

// --- DAILY LOGGING ENDPOINTS ---
app.get('/api/logs', (req, res) => {
  const userId = getUserId(req);
  const date = req.query.date;
  
  let logs = db.filter('daily_logs', l => l.user_id === userId);
  if (date) {
    logs = logs.filter(l => l.log_date === date);
  }
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { food_id, meal_id, unit_name, quantity, meal_type, item_type = 'food', date, name, calories, protein_g, carbs_g, fat_g, fiber_g } = req.body;
  const targetDate = date || getTodayString();

  try {
    let entryData = {};

    if (item_type === 'food') {
      if (calories !== undefined && protein_g !== undefined && name) {
        entryData = {
          name,
          food_id: food_id || null,
          meal_id: null,
          unit_name: unit_name || 'g',
          quantity: quantity || 1,
          calories: Math.round(Number(calories)),
          protein_g: Math.round(Number(protein_g) * 10) / 10,
          carbs_g: Math.round(Number(carbs_g || 0) * 10) / 10,
          fat_g: Math.round(Number(fat_g || 0) * 10) / 10,
          fiber_g: Math.round(Number(fiber_g || 0) * 10) / 10
        };
      } else {
        const computed = ConversionService.calculateFoodMacros(food_id, unit_name, quantity);
        entryData = {
          name: computed.food_name,
          food_id,
          meal_id: null,
          unit_name,
          quantity,
          calories: computed.calories,
          protein_g: computed.protein_g,
          carbs_g: computed.carbs_g,
          fat_g: computed.fat_g,
          fiber_g: computed.fiber_g
        };
      }
    } else if (item_type === 'meal') {
      const meal = db.find('meals', m => m.id === meal_id);
      if (!meal) return res.status(404).json({ error: "Meal template not found" });

      const qty = quantity || 1;
      entryData = {
        name: meal.name,
        food_id: null,
        meal_id,
        unit_name: unit_name || 'Serving',
        quantity: qty,
        calories: Math.round(meal.total_calories * qty),
        protein_g: Math.round(meal.total_protein * qty * 10) / 10,
        carbs_g: Math.round(meal.total_carbs * qty * 10) / 10,
        fat_g: Math.round(meal.total_fat * qty * 10) / 10,
        fiber_g: Math.round(meal.total_fiber * qty * 10) / 10
      };
    }

    const newLog = {
      id: `log_${Date.now()}`,
      user_id: userId,
      log_date: targetDate,
      meal_type: meal_type || 'Snack',
      item_type,
      ...entryData,
      logged_at: new Date().toISOString()
    };

    db.insert('daily_logs', newLog);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/logs/:id', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const deleted = db.delete('daily_logs', l => l.id === req.params.id && l.user_id === userId);
  if (!deleted) return res.status(404).json({ error: "Log entry not found" });
  res.json({ message: "Log deleted successfully", deleted });
});

// --- DASHBOARD & ANALYTICS ENDPOINTS ---
app.get('/api/dashboard/today', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const date = req.query.date || getTodayString();
  const logs = db.filter('daily_logs', l => l.log_date === date && l.user_id === userId);
  const user = db.find('users', u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  const consumed = logs.reduce((acc, curr) => {
    acc.calories += curr.calories;
    acc.protein_g += curr.protein_g;
    acc.carbs_g += curr.carbs_g;
    acc.fat_g += curr.fat_g;
    acc.fiber_g += curr.fiber_g;
    return acc;
  }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });

  consumed.protein_g = Math.round(consumed.protein_g * 10) / 10;
  consumed.carbs_g = Math.round(consumed.carbs_g * 10) / 10;
  consumed.fat_g = Math.round(consumed.fat_g * 10) / 10;
  consumed.fiber_g = Math.round(consumed.fiber_g * 10) / 10;

  // Compute Rollover Engine Adjustments
  const rollover = CalculatorService.calculateRolloverAdjustments(user, date, db);

  const targets = {
    target_calories: user.target_calories || 2000,
    adjusted_target_calories: rollover.adjusted_target,
    target_protein_g: user.target_protein_g || 120,
    target_carbs_g: user.target_carbs_g || 200,
    target_fat_g: user.target_fat_g || 60,
    target_fiber_g: user.target_fiber_g || 28
  };

  const analysis = NutritionAnalysisService.analyzeDailyNutrition(consumed, targets);
  res.json({
    date,
    logs,
    consumed,
    targets,
    rollover,
    analysis
  });
});

// --- 7-DAY WEEKLY TREND ANALYTICS ENDPOINT ---
app.get('/api/dashboard/weekly', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = db.find('users', u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const endDateStr = req.query.date || getTodayString();
  const endDate = new Date(endDateStr);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayLogs = db.filter('daily_logs', l => l.log_date === dateStr && l.user_id === userId);
    const cals = dayLogs.reduce((sum, l) => sum + l.calories, 0);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({
      date: dateStr,
      dayName,
      calories: Math.round(cals),
      target_calories: user.target_calories || 2000,
      is_over_target: cals > (user.target_calories || 2000)
    });
  }

  res.json({
    target_calories: user.target_calories || 2000,
    weekly_trend: days
  });
});

// --- HISTORY CALENDAR SUMMARY ENDPOINT ---
app.get('/api/history', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = db.find('users', u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const logs = db.filter('daily_logs', l => l.user_id === userId);

  const grouped = {};
  logs.forEach(l => {
    if (!grouped[l.log_date]) {
      grouped[l.log_date] = { date: l.log_date, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, items_count: 0 };
    }
    grouped[l.log_date].calories += l.calories;
    grouped[l.log_date].protein_g += l.protein_g;
    grouped[l.log_date].carbs_g += l.carbs_g;
    grouped[l.log_date].fat_g += l.fat_g;
    grouped[l.log_date].fiber_g += l.fiber_g;
    grouped[l.log_date].items_count += 1;
  });

  const historyArray = Object.values(grouped).map(h => ({
    ...h,
    item_count: h.items_count,
    protein_g: Math.round(h.protein_g * 10) / 10,
    carbs_g: Math.round(h.carbs_g * 10) / 10,
    fat_g: Math.round(h.fat_g * 10) / 10,
    fiber_g: Math.round(h.fiber_g * 10) / 10,
    target_calories: user.target_calories || 2000
  }));

  res.json(historyArray);
});

app.listen(PORT, () => {
  console.log(`NutriTrack Backend Server running on http://localhost:${PORT}`);
});
