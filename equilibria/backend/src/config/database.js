import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../data/data.json');

const defaultData = {
  users: [],
  foods: [
    {
      id: "fd_roti",
      name: "Whole Wheat Roti / Chapati",
      category: "Indian Staples",
      base_unit: "g",
      base_amount: 100,
      calories: 264,
      protein_g: 9.2,
      carbs_g: 54.0,
      fat_g: 1.5,
      fiber_g: 8.8,
      data_source: "IFCT / ICMR 2020",
      is_verified: true
    },
    {
      id: "fd_dal_tadka",
      name: "Yellow Dal Tadka",
      category: "Indian Staples",
      base_unit: "g",
      base_amount: 100,
      calories: 116,
      protein_g: 6.8,
      carbs_g: 16.2,
      fat_g: 3.2,
      fiber_g: 4.5,
      data_source: "IFCT / ICMR 2020",
      is_verified: true
    },
    {
      id: "fd_paneer",
      name: "Fresh Paneer (Cottage Cheese)",
      category: "Indian Staples",
      base_unit: "g",
      base_amount: 100,
      calories: 265,
      protein_g: 18.3,
      carbs_g: 1.2,
      fat_g: 20.8,
      fiber_g: 0.0,
      data_source: "IFCT / ICMR 2020",
      is_verified: true
    },
    {
      id: "fd_basmati_rice",
      name: "Cooked Basmati Rice",
      category: "Indian Staples",
      base_unit: "g",
      base_amount: 100,
      calories: 130,
      protein_g: 2.7,
      carbs_g: 28.2,
      fat_g: 0.3,
      fiber_g: 0.4,
      data_source: "IFCT / ICMR 2020",
      is_verified: true
    },
    {
      id: "fd_chicken_breast",
      name: "Cooked Chicken Breast",
      category: "Poultry & Meat",
      base_unit: "g",
      base_amount: 100,
      calories: 165,
      protein_g: 31.0,
      carbs_g: 0.0,
      fat_g: 3.6,
      fiber_g: 0.0,
      data_source: "USDA Standard Reference",
      is_verified: true
    },
    {
      id: "fd_egg",
      name: "Whole Boiled Egg",
      category: "Dairy & Eggs",
      base_unit: "g",
      base_amount: 100,
      calories: 155,
      protein_g: 12.6,
      carbs_g: 1.1,
      fat_g: 10.6,
      fiber_g: 0.0,
      data_source: "USDA Standard Reference",
      is_verified: true
    },
    {
      id: "fd_greek_yogurt",
      name: "Plain Greek Yogurt (Curd/Dahi)",
      category: "Dairy & Eggs",
      base_unit: "g",
      base_amount: 100,
      calories: 59,
      protein_g: 10.0,
      carbs_g: 3.6,
      fat_g: 0.4,
      fiber_g: 0.0,
      data_source: "USDA Standard Reference",
      is_verified: true
    },
    {
      id: "fd_oats",
      name: "Rolled Oats (Dry)",
      category: "Grains & Cereals",
      base_unit: "g",
      base_amount: 100,
      calories: 389,
      protein_g: 16.9,
      carbs_g: 66.3,
      fat_g: 6.9,
      fiber_g: 10.6,
      data_source: "USDA Standard Reference",
      is_verified: true
    },
    {
      id: "fd_banana",
      name: "Fresh Banana",
      category: "Fruits",
      base_unit: "g",
      base_amount: 100,
      calories: 89,
      protein_g: 1.1,
      carbs_g: 22.8,
      fat_g: 0.3,
      fiber_g: 2.6,
      data_source: "USDA Standard Reference",
      is_verified: true
    },
    {
      id: "fd_almonds",
      name: "Raw Almonds",
      category: "Nuts & Seeds",
      base_unit: "g",
      base_amount: 100,
      calories: 579,
      protein_g: 21.2,
      carbs_g: 21.7,
      fat_g: 49.9,
      fiber_g: 12.5,
      data_source: "USDA Standard Reference",
      is_verified: true
    }
  ],
  food_units: [
    { id: "u_roti_pc", food_id: "fd_roti", unit_name: "Piece", gram_equivalent: 40 },
    { id: "u_roti_g", food_id: "fd_roti", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_roti_srv", food_id: "fd_roti", unit_name: "Serving", gram_equivalent: 80 },
    { id: "u_dal_bowl", food_id: "fd_dal_tadka", unit_name: "Bowl", gram_equivalent: 200 },
    { id: "u_dal_cup", food_id: "fd_dal_tadka", unit_name: "Cup", gram_equivalent: 240 },
    { id: "u_dal_g", food_id: "fd_dal_tadka", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_paneer_g", food_id: "fd_paneer", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_paneer_pc", food_id: "fd_paneer", unit_name: "Piece", gram_equivalent: 20 },
    { id: "u_paneer_cup", food_id: "fd_paneer", unit_name: "Cup", gram_equivalent: 150 },
    { id: "u_rice_bowl", food_id: "fd_basmati_rice", unit_name: "Bowl", gram_equivalent: 180 },
    { id: "u_rice_cup", food_id: "fd_basmati_rice", unit_name: "Cup", gram_equivalent: 200 },
    { id: "u_rice_g", food_id: "fd_basmati_rice", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_chk_g", food_id: "fd_chicken_breast", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_chk_pc", food_id: "fd_chicken_breast", unit_name: "Piece", gram_equivalent: 150 },
    { id: "u_chk_srv", food_id: "fd_chicken_breast", unit_name: "Serving", gram_equivalent: 200 },
    { id: "u_egg_pc", food_id: "fd_egg", unit_name: "Piece", gram_equivalent: 50 },
    { id: "u_egg_g", food_id: "fd_egg", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_yogurt_cup", food_id: "fd_greek_yogurt", unit_name: "Cup", gram_equivalent: 200 },
    { id: "u_yogurt_bowl", food_id: "fd_greek_yogurt", unit_name: "Bowl", gram_equivalent: 180 },
    { id: "u_yogurt_tbsp", food_id: "fd_greek_yogurt", unit_name: "Tbsp", gram_equivalent: 15 },
    { id: "u_yogurt_g", food_id: "fd_greek_yogurt", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_oats_cup", food_id: "fd_oats", unit_name: "Cup", gram_equivalent: 90 },
    { id: "u_oats_tbsp", food_id: "fd_oats", unit_name: "Tbsp", gram_equivalent: 10 },
    { id: "u_oats_g", food_id: "fd_oats", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_ban_pc", food_id: "fd_banana", unit_name: "Piece", gram_equivalent: 118 },
    { id: "u_ban_slice", food_id: "fd_banana", unit_name: "Slice", gram_equivalent: 10 },
    { id: "u_ban_g", food_id: "fd_banana", unit_name: "Gram", gram_equivalent: 1 },
    { id: "u_alm_pc", food_id: "fd_almonds", unit_name: "Piece", gram_equivalent: 1.2 },
    { id: "u_alm_tbsp", food_id: "fd_almonds", unit_name: "Tbsp", gram_equivalent: 10 },
    { id: "u_alm_g", food_id: "fd_almonds", unit_name: "Gram", gram_equivalent: 1 }
  ],
  meals: [],
  meal_ingredients: [],
  daily_logs: [],
  goals_history: []
};

class JSONDatabase {
  constructor() {
    this.init();
  }

  init() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      this.data = defaultData;
      this.save();
    } else {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(content);
        // Ensure foods and units are populated if file existed before
        if (!this.data.foods || this.data.foods.length === 0) {
          this.data.foods = defaultData.foods;
          this.data.food_units = defaultData.food_units;
          this.save();
        }
      } catch (e) {
        console.error("Error loading DB, resetting to defaults:", e);
        this.data = defaultData;
        this.save();
      }
    }
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
  }

  get(table) {
    return this.data[table] || [];
  }

  find(table, predicate) {
    return this.get(table).find(predicate);
  }

  filter(table, predicate) {
    return this.get(table).filter(predicate);
  }

  insert(table, item) {
    if (!this.data[table]) this.data[table] = [];
    this.data[table].push(item);
    this.save();
    return item;
  }

  update(table, predicate, updates) {
    const index = this.get(table).findIndex(predicate);
    if (index !== -1) {
      this.data[table][index] = { ...this.data[table][index], ...updates };
      this.save();
      return this.data[table][index];
    }
    return null;
  }

  delete(table, predicate) {
    const index = this.get(table).findIndex(predicate);
    if (index !== -1) {
      const deleted = this.data[table].splice(index, 1);
      this.save();
      return deleted[0];
    }
    return null;
  }
}

export const db = new JSONDatabase();
