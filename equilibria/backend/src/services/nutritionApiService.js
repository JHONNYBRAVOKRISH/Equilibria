import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indianFoodsPath = path.join(__dirname, '../data/indianFoods.json');

let loadedFoods = [];
try {
  loadedFoods = JSON.parse(fs.readFileSync(indianFoodsPath, 'utf8'));
} catch (e) {
  console.error("Error reading indianFoods.json:", e);
}

export const ifctVerifiedFoods = loadedFoods;

export class NutritionApiService {
  static sortResults(results, query) {
    if (!results || results.length === 0 || !query) return results;
    const q = query.trim().toLowerCase();

    const getTier = (name) => {
      const n = name.trim().toLowerCase();
      if (n === q) return 1;
      if (n.startsWith(q + ',') || n.startsWith(q + ' ') || n.startsWith(q + '-')) return 2;
      return 3;
    };

    return results.sort((a, b) => {
      const tierA = getTier(a.name);
      const tierB = getTier(b.name);
      if (tierA !== tierB) return tierA - tierB;
      return a.name.length - b.name.length;
    });
  }

  static cleanFoodName(name) {
    if (!name) return '';
    const str = name.trim();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static ensurePortions(food) {
    const item = { ...food };
    if (!item.portions || !Array.isArray(item.portions) || item.portions.length === 0) {
      const stapleMatch = ifctVerifiedFoods.find(s => s.id === item.id || s.name.toLowerCase() === item.name.toLowerCase());
      if (stapleMatch && stapleMatch.portions) {
        item.portions = stapleMatch.portions;
      } else {
        item.portions = [
          { name: "1 Piece", weight: 100 },
          { name: "1 Serving", weight: item.serving_quantity || 150 }
        ];
      }
    }
    return item;
  }

  static async searchOrFetchFoods(query) {
    if (!query || query.trim().length === 0) {
      return ifctVerifiedFoods.map(f => this.ensurePortions(f));
    }

    const q = query.trim().toLowerCase();

    // Tier 1 — Local Verification Intercept
    const localStapleMatches = ifctVerifiedFoods.filter(f => 
      f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );

    if (localStapleMatches.length > 0) {
      localStapleMatches.forEach(food => {
        const enriched = this.ensurePortions(food);
        if (!db.find('foods', f => f.id === enriched.id)) {
          db.insert('foods', enriched);
        } else {
          db.update('foods', f => f.id === enriched.id, { portions: enriched.portions });
        }
      });
      return this.sortResults(localStapleMatches, q).map(item => this.ensurePortions({
        ...item,
        name: this.cleanFoodName(item.name)
      }));
    }

    // Check DB cache
    const dbMatches = db.get('foods').filter(f => 
      f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );

    if (dbMatches.length > 0) {
      return this.sortResults(dbMatches, q).slice(0, 10).map(item => this.ensurePortions({
        ...item,
        name: this.cleanFoodName(item.name)
      }));
    }

    // Tier 2 — Expanded API Fallback
    let apiResults = [];
    try {
      apiResults = await this.fetchUSDA(q);
    } catch (err) {
      console.error("USDA Search Error:", err.message);
    }

    // Tier 3 — String-Length Prefix Sorting
    const sortedApi = this.sortResults(apiResults, q);

    const formatted = sortedApi.slice(0, 10).map(food => {
      const cleaned = this.ensurePortions({ ...food, name: this.cleanFoodName(food.name) });
      const existingInDb = db.find('foods', f => f.id === cleaned.id || f.name.toLowerCase() === cleaned.name.toLowerCase());
      if (!existingInDb) {
        db.insert('foods', cleaned);
      } else {
        db.update('foods', f => f.id === existingInDb.id, { portions: cleaned.portions });
      }
      return cleaned;
    });

    return formatted;
  }

  static async fetchUSDA(query) {
    const encoded = encodeURIComponent(query);
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encoded}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.foods || !Array.isArray(data.foods)) return [];

    const results = [];
    for (let i = 0; i < data.foods.length && results.length < 15; i++) {
      const f = data.foods[i];
      const nutrients = f.foodNutrients || [];

      const getNutrientVal = (id) => {
        const item = nutrients.find(n => n.nutrientId === id || Number(n.nutrientNumber) === id || (n.nutrientName && n.nutrientName.toLowerCase().includes(id === 1008 ? 'energy' : id === 1003 ? 'protein' : id === 1004 ? 'total lipid' : id === 1005 ? 'carbohydrate' : 'fiber')));
        return item ? Number(item.value || item.amount || 0) : 0;
      };

      const cals = Math.round(getNutrientVal(1008));
      const prot = Math.round(getNutrientVal(1003) * 10) / 10;
      const fat = Math.round(getNutrientVal(1004) * 10) / 10;
      const carbs = Math.round(getNutrientVal(1005) * 10) / 10;
      const fiber = Math.round(getNutrientVal(1079) * 10) / 10;

      const parsedPortions = [];
      
      if (f.foodPortions && Array.isArray(f.foodPortions) && f.foodPortions.length > 0) {
        f.foodPortions.forEach(p => {
          const desc = p.modifier || p.portionDescription || (p.measureUnit ? p.measureUnit.name : null);
          const weight = p.gramWeight || p.gram_weight;
          if (desc && weight) {
            const cleanDesc = desc.toLowerCase().startsWith('1 ') ? desc : `1 ${desc}`;
            parsedPortions.push({
              name: cleanDesc,
              weight: Math.round(Number(weight) * 10) / 10
            });
          }
        });
      }

      if (f.servingSize && f.servingSizeUnit) {
        parsedPortions.push({
          name: `1 Serving (${f.servingSize}${f.servingSizeUnit})`,
          weight: Math.round(Number(f.servingSize) * 10) / 10 || 100
        });
      }

      const hasServing = parsedPortions.some(p => p.name.toLowerCase().includes('serving'));
      const hasPiece = parsedPortions.some(p => p.name.toLowerCase().includes('piece'));

      if (!hasServing) {
        parsedPortions.unshift({ name: "1 Serving", weight: f.servingSize || 150 });
      }
      if (!hasPiece) {
        parsedPortions.unshift({ name: "1 Piece", weight: 100 });
      }

      results.push({
        id: `fd_usda_${f.fdcId || Date.now()}_${i}`,
        name: f.description || query,
        category: f.foodCategory || f.dataType || "Foods",
        base_unit: "g",
        base_amount: 100,
        calories: cals,
        protein_g: prot,
        carbs_g: carbs,
        fat_g: fat,
        fiber_g: fiber,
        serving_quantity: f.servingSize || 150,
        portions: parsedPortions,
        data_source: f.dataType || "USDA Database",
        is_verified: true
      });
    }

    return results;
  }
}
