/**
 * Pure function for calculating degree progress against requirement categories.
 * No external dependencies — operates on plain typed objects.
 */

/** A planned course with its category and credit info. */
export interface PlannedCourseWithCategory {
  courseId: string;
  title: string;
  credits: number;
  categoryName: string;
  categoryTier: string;
}

/** A degree requirement category with its minimum credit threshold. */
export interface CategoryRequirement {
  name: string;
  minCredits: number;
  tier: string;
}

/** Progress toward a single requirement category. */
export interface CategoryProgress {
  category: string;
  tier: string;
  earnedCredits: number;
  requiredCredits: number;
  percentage: number;
  courseCount: number;
}

/** Overall degree progress across all categories. */
export interface DegreeProgress {
  categories: CategoryProgress[];
  totalCreditsPlanned: number;
  totalCreditsRequired: number;
  overallPercentage: number;
}

/**
 * Calculates progress toward degree requirements based on planned courses.
 * @param plannedCourses - All courses in the student's plan with category info
 * @param requirements - All requirement categories with minimum credit thresholds
 * @param totalCreditsRequired - Total credits needed for the degree (e.g. 120)
 * @returns Breakdown by category and overall progress
 */
export function calculateProgress(
  plannedCourses: PlannedCourseWithCategory[],
  requirements: CategoryRequirement[],
  totalCreditsRequired: number
): DegreeProgress {
  // Group planned courses by category name
  const creditsByCategory = new Map<string, { credits: number; count: number }>();
  for (const course of plannedCourses) {
    const existing = creditsByCategory.get(course.categoryName) || { credits: 0, count: 0 };
    existing.credits += course.credits;
    existing.count += 1;
    creditsByCategory.set(course.categoryName, existing);
  }

  // Build progress for each requirement category
  const categories: CategoryProgress[] = requirements.map((req) => {
    const earned = creditsByCategory.get(req.name) || { credits: 0, count: 0 };
    const percentage = req.minCredits === 0
      ? 100
      : Math.min(100, Math.round((earned.credits / req.minCredits) * 100));

    return {
      category: req.name,
      tier: req.tier,
      earnedCredits: earned.credits,
      requiredCredits: req.minCredits,
      percentage,
      courseCount: earned.count,
    };
  });

  // Sort: major tier first, then degree tier, alphabetically within each tier
  categories.sort((a, b) => {
    if (a.tier !== b.tier) {
      return a.tier === "major" ? -1 : 1;
    }
    return a.category.localeCompare(b.category);
  });

  const totalCreditsPlanned = plannedCourses.reduce((sum, c) => sum + c.credits, 0);
  const overallPercentage = totalCreditsRequired === 0
    ? 100
    : Math.min(100, Math.round((totalCreditsPlanned / totalCreditsRequired) * 100));

  return {
    categories,
    totalCreditsPlanned,
    totalCreditsRequired,
    overallPercentage,
  };
}
