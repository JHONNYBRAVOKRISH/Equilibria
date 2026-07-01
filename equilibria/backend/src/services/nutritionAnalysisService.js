export class NutritionAnalysisService {
  /**
   * Analyzes daily intake against target metrics and generates smart educational feedback.
   */
  static analyzeDailyNutrition(consumed, targets) {
    const insights = [];

    // 1. Calorie Analysis
    const calDiff = targets.target_calories - consumed.calories;
    const calPct = Math.round((consumed.calories / targets.target_calories) * 100);

    if (calPct < 70) {
      insights.push({
        type: 'warning',
        category: 'Calorie Intake',
        title: 'Calorie Deficit Alert',
        message: `You have consumed only ${calPct}% of your target energy. Make sure to nourish your body sufficiently to maintain performance and energy levels.`
      });
    } else if (calPct > 110) {
      insights.push({
        type: 'warning',
        category: 'Calorie Intake',
        title: 'Caloric Surplus Detected',
        message: `You are ${consumed.calories - targets.target_calories} kcal over your daily target goal.`
      });
    } else {
      insights.push({
        type: 'success',
        category: 'Calorie Intake',
        title: 'Optimal Calorie Balance',
        message: `Your energy intake is right on track (${calPct}% of target). Great job keeping your fuel balanced!`
      });
    }

    // 2. Protein Distribution
    const proteinPct = Math.round((consumed.protein_g / targets.target_protein_g) * 100);
    if (proteinPct < 75) {
      insights.push({
        type: 'info',
        category: 'Protein Distribution',
        title: 'Increase Amino Acid Availability',
        message: `You are below your protein target (${consumed.protein_g}g / ${targets.target_protein_g}g). Adding items like Paneer, Greek Yogurt, Dal, or Lean Chicken can help repair muscle tissue.`
      });
    } else {
      insights.push({
        type: 'success',
        category: 'Protein Distribution',
        title: 'Sufficient Muscle Maintenance Protein',
        message: `Excellent protein intake (${consumed.protein_g}g). You have met your daily muscle synthesis threshold.`
      });
    }

    // 3. Fiber & Digestive Health
    const fiberPct = Math.round((consumed.fiber_g / targets.target_fiber_g) * 100);
    if (fiberPct < 70) {
      insights.push({
        type: 'info',
        category: 'Micronutrients & Gut Health',
        title: 'Boost Dietary Fiber',
        message: `Dietary fiber improves gut motility and satiety. Incorporate whole grains (Roti, Oats), legumes (Dal), or fresh fruit to hit your ${targets.target_fiber_g}g target.`
      });
    } else {
      insights.push({
        type: 'success',
        category: 'Micronutrients & Gut Health',
        title: 'Healthy Gut Microbiome Fiber Level',
        message: `Great job hitting ${consumed.fiber_g}g of dietary fiber today!`
      });
    }

    // 4. Macro Ratio Summary
    const totalMacroGrams = consumed.protein_g + consumed.carbs_g + consumed.fat_g;
    let macroSplit = { protein: 0, carbs: 0, fat: 0 };
    if (totalMacroGrams > 0) {
      macroSplit = {
        protein: Math.round((consumed.protein_g / totalMacroGrams) * 100),
        carbs: Math.round((consumed.carbs_g / totalMacroGrams) * 100),
        fat: Math.round((consumed.fat_g / totalMacroGrams) * 100)
      };
    }

    return {
      consumed,
      targets,
      macroSplit,
      insights
    };
  }
}
