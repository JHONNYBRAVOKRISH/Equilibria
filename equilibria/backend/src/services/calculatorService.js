export class CalculatorService {
  /**
   * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation.
   * Men: BMR = 10W + 6.25H - 5A + 5
   * Women: BMR = 10W + 6.25H - 5A - 161
   */
  static calculateBMR(weightKg, heightCm, age, gender) {
    const W = Number(weightKg);
    const H = Number(heightCm);
    const A = Number(age);

    if (gender === 'female') {
      return Math.round(10 * W + 6.25 * H - 5 * A - 161);
    } else {
      return Math.round(10 * W + 6.25 * H - 5 * A + 5);
    }
  }

  /**
   * Calculates Total Daily Energy Expenditure (TDEE) based on activity level.
   */
  static calculateTDEE(bmr, activityLevel) {
    const multipliers = {
      sedentary: 1.2,       // Little to no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      active: 1.725,       // Hard exercise 6-7 days/week
      very_active: 1.9     // Intense training / physical job
    };

    const mult = multipliers[activityLevel] || 1.375;
    return Math.round(bmr * mult);
  }

  /**
   * Calculates daily caloric and macro targets based on fitness goal.
   */
  static calculateTargets(profile) {
    const bmr = this.calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.gender);
    const tdee = this.calculateTDEE(bmr, profile.activity_level);

    let targetCalories = tdee;
    if (profile.goal === 'lose') {
      targetCalories = Math.round(tdee * 0.80);
    } else if (profile.goal === 'gain') {
      targetCalories = Math.round(tdee * 1.15);
    }

    const proteinGrams = Math.round(profile.weight_kg * 2.0);
    const proteinCalories = proteinGrams * 4;

    const fatCalories = targetCalories * 0.28;
    const fatGrams = Math.round(fatCalories / 9);

    const carbsCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
    const carbsGrams = Math.round(carbsCalories / 4);

    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    return {
      bmr,
      tdee,
      target_calories: targetCalories,
      target_protein_g: proteinGrams,
      target_carbs_g: carbsGrams,
      target_fat_g: fatGrams,
      target_fiber_g: fiberGrams,
      is_custom_target: false
    };
  }

  /**
   * Recalculates macros proportionally based on a custom manual calorie override.
   */
  static calculateCustomTargets(user, customCalories) {
    const newCals = Number(customCalories);
    const oldCals = user.target_calories || 2000;
    const ratio = newCals / oldCals;

    const newProt = Math.round((user.target_protein_g || 120) * ratio);
    const newCarbs = Math.round((user.target_carbs_g || 200) * ratio);
    const newFat = Math.round((user.target_fat_g || 60) * ratio);
    const newFiber = Math.round((newCals / 1000) * 14);

    return {
      target_calories: newCals,
      target_protein_g: newProt,
      target_carbs_g: newCarbs,
      target_fat_g: newFat,
      target_fiber_g: newFiber,
      is_custom_target: true
    };
  }

  /**
   * Core Algorithmic Logic: Calorie Debt & Rollover Engine
   */
  static calculateRolloverAdjustments(user, targetDateStr, db) {
    const baselineTarget = user.target_calories || 2000;
    
    if (!user.rollover_enabled) {
      return {
        baseline_target: baselineTarget,
        adjusted_target: baselineTarget,
        active_debt: 0,
        today_deduction: 0,
        rollover_window: user.rollover_window || 3,
        rollover_enabled: false
      };
    }

    const windowSize = Number(user.rollover_window) || 3;
    const targetDate = new Date(targetDateStr);
    let totalSurplus = 0;
    let totalDeductionRaw = 0;

    // Check past N days within rollover window
    for (let i = 1; i <= windowSize; i++) {
      const pastD = new Date(targetDate);
      pastD.setDate(pastD.getDate() - i);
      const year = pastD.getFullYear();
      const month = String(pastD.getMonth() + 1).padStart(2, '0');
      const day = String(pastD.getDate()).padStart(2, '0');
      const pastDateStr = `${year}-${month}-${day}`;

      const pastLogs = db.filter('daily_logs', l => l.log_date === pastDateStr && l.user_id === user.id);
      const pastConsumed = pastLogs.reduce((sum, l) => sum + l.calories, 0);

      // Edge Case 1: Silent Wins - If pastConsumed < baselineTarget, ignore deficit!
      if (pastConsumed > baselineTarget) {
        const surplus = pastConsumed - baselineTarget;
        totalSurplus += surplus;
        totalDeductionRaw += (surplus / windowSize);
      }
    }

    // Edge Case 2: The 20% Cap - Hard-cap max daily deduction at 20% of baseline target
    const maxDeduction = Math.round(baselineTarget * 0.20);
    const todayDeduction = Math.min(Math.round(totalDeductionRaw), maxDeduction);
    const adjustedTarget = Math.max(500, baselineTarget - todayDeduction);

    return {
      baseline_target: baselineTarget,
      adjusted_target: adjustedTarget,
      active_debt: Math.round(totalSurplus),
      today_deduction: todayDeduction,
      rollover_window: windowSize,
      rollover_enabled: true
    };
  }
}
