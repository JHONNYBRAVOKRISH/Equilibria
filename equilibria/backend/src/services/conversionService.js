import { db } from '../config/database.js';
import { ifctVerifiedFoods } from './nutritionApiService.js';

export class ConversionService {
  /**
   * Returns dynamic units for a food item (food-specific portions + standard fallback units)
   */
  static getFoodUnits(foodId) {
    const food = db.find('foods', f => f.id === foodId) || ifctVerifiedFoods.find(f => f.id === foodId);
    const units = [];

    if (food && food.portions && Array.isArray(food.portions) && food.portions.length > 0) {
      food.portions.forEach(p => {
        units.push({ unit_name: p.name, gram_equivalent: p.weight });
      });
    }

    // Always guarantee "1 Serving" and "1 Piece" generic fallbacks at top if missing
    const hasServing = units.some(u => u.unit_name.toLowerCase().includes('serving'));
    const hasPiece = units.some(u => u.unit_name.toLowerCase().includes('piece'));

    const defaultServingWeight = food ? (food.serving_quantity || 150) : 150;
    const defaultPieceWeight = 100;

    if (!hasServing) {
      units.unshift({ unit_name: "1 Serving", gram_equivalent: defaultServingWeight });
    }
    if (!hasPiece) {
      units.unshift({ unit_name: "1 Piece", gram_equivalent: defaultPieceWeight });
    }

    // Standard Fallback Units - Always inject "Custom Grams (g)"
    const fallbackUnits = [
      { unit_name: "Custom Grams (g)", gram_equivalent: 1 },
      { unit_name: "Grams (g)", gram_equivalent: 1 },
      { unit_name: "Milliliters (ml)", gram_equivalent: 1 },
      { unit_name: "Ounces (oz)", gram_equivalent: 28.35 },
      { unit_name: "Pounds (lbs)", gram_equivalent: 453.59 },
      { unit_name: "Cups", gram_equivalent: 240 },
      { unit_name: "Tablespoons (tbsp)", gram_equivalent: 15 },
      { unit_name: "Teaspoons (tsp)", gram_equivalent: 5 }
    ];

    fallbackUnits.forEach(fb => {
      if (!units.some(u => u.unit_name.toLowerCase() === fb.unit_name.toLowerCase())) {
        units.push(fb);
      }
    });

    return units;
  }

  /**
   * Helper to determine gram weight per 1 unit
   */
  static getUnitGramWeight(unitName, food = null) {
    const norm = (unitName || '').toLowerCase().trim();

    // 1. Check food-specific dynamic portions
    if (food && food.portions && Array.isArray(food.portions)) {
      const match = food.portions.find(p => p.name.toLowerCase().trim() === norm);
      if (match) return match.weight;
    }

    // 2. Standard matrix fallback (including Custom Grams (g))
    if (norm === 'custom grams (g)' || norm === 'custom grams' || norm === 'grams (g)' || norm === 'grams' || norm === 'g' || norm === 'milliliters (ml)' || norm === 'ml') {
      return 1;
    }
    if (norm === 'ounces (oz)' || norm === 'ounces' || norm === 'oz') {
      return 28.35;
    }
    if (norm === 'pounds (lbs)' || norm === 'pounds' || norm === 'lbs') {
      return 453.59;
    }
    if (norm === 'teaspoons (tsp)' || norm === 'teaspoons' || norm === 'tsp') {
      return 5;
    }
    if (norm === 'tablespoons (tbsp)' || norm === 'tablespoons' || norm === 'tbsp') {
      return 15;
    }
    if (norm === 'cups' || norm === 'cup') {
      return 240;
    }

    if (norm.includes('piece') || norm === '1 piece') {
      return 100;
    }
    if (norm.includes('serving') || norm === '1 serving') {
      if (food && food.serving_quantity && Number(food.serving_quantity) > 0) {
        return Number(food.serving_quantity);
      }
      return 150;
    }

    if (food && food.serving_quantity && Number(food.serving_quantity) > 0) {
      return Number(food.serving_quantity);
    }

    return 150;
  }

  /**
   * Calculates converted macros using exact formula:
   * (Base_Macros_Per_100g / 100) * Portion_Gram_Weight * User_Quantity
   */
  static calculateFoodMacros(foodId, unitName, quantity) {
    const food = db.find('foods', f => f.id === foodId) || ifctVerifiedFoods.find(f => f.id === foodId);
    if (!food) throw new Error(`Food with ID ${foodId} not found`);

    const qty = Number(quantity) || 1;
    const unitWeight = this.getUnitGramWeight(unitName, food);
    const totalGrams = qty * unitWeight;

    // Base macros per 1g
    const calPer1g = food.calories / 100;
    const protPer1g = food.protein_g / 100;
    const carbPer1g = food.carbs_g / 100;
    const fatPer1g = food.fat_g / 100;
    const fibPer1g = food.fiber_g / 100;

    return {
      food_id: food.id,
      food_name: food.name,
      category: food.category,
      unit_name: unitName,
      quantity: qty,
      gram_weight: Math.round(totalGrams * 10) / 10,
      calories: Math.round(calPer1g * totalGrams),
      protein_g: Math.round(protPer1g * totalGrams * 10) / 10,
      carbs_g: Math.round(carbPer1g * totalGrams * 10) / 10,
      fat_g: Math.round(fatPer1g * totalGrams * 10) / 10,
      fiber_g: Math.round(fibPer1g * totalGrams * 10) / 10,
      data_source: food.data_source
    };
  }
}
