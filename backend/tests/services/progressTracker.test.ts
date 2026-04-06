import {
  calculateProgress,
  PlannedCourseWithCategory,
  CategoryRequirement,
} from "../../src/services/progressTracker";

describe("progressTracker", () => {
  describe("calculateProgress", () => {
    const csRequirements: CategoryRequirement[] = [
      { name: "Basic CS", minCredits: 15, tier: "major" },
      { name: "Basic Calculus", minCredits: 9, tier: "major" },
      { name: "Humanities", minCredits: 12, tier: "degree" },
    ];

    it("should return all categories at 0% when there are no planned courses", () => {
      const result = calculateProgress([], csRequirements, 120);

      expect(result.categories).toHaveLength(3);
      for (const cat of result.categories) {
        expect(cat.earnedCredits).toBe(0);
        expect(cat.percentage).toBe(0);
        expect(cat.courseCount).toBe(0);
      }
      expect(result.totalCreditsPlanned).toBe(0);
      expect(result.overallPercentage).toBe(0);
    });

    it("should calculate correct credits and percentage for one category", () => {
      const planned: PlannedCourseWithCategory[] = [
        { courseId: "1", title: "Programming I", credits: 3, categoryName: "Basic CS", categoryTier: "major" },
        { courseId: "2", title: "Programming II", credits: 3, categoryName: "Basic CS", categoryTier: "major" },
      ];

      const result = calculateProgress(planned, csRequirements, 120);
      const basicCS = result.categories.find((c) => c.category === "Basic CS")!;

      expect(basicCS.earnedCredits).toBe(6);
      expect(basicCS.requiredCredits).toBe(15);
      expect(basicCS.percentage).toBe(40);
      expect(basicCS.courseCount).toBe(2);
    });

    it("should calculate each category independently", () => {
      const planned: PlannedCourseWithCategory[] = [
        { courseId: "1", title: "Programming I", credits: 3, categoryName: "Basic CS", categoryTier: "major" },
        { courseId: "2", title: "Calculus 1", credits: 5, categoryName: "Basic Calculus", categoryTier: "major" },
        { courseId: "3", title: "Intro to Lit", credits: 3, categoryName: "Humanities", categoryTier: "degree" },
      ];

      const result = calculateProgress(planned, csRequirements, 120);
      const basicCS = result.categories.find((c) => c.category === "Basic CS")!;
      const calculus = result.categories.find((c) => c.category === "Basic Calculus")!;
      const humanities = result.categories.find((c) => c.category === "Humanities")!;

      expect(basicCS.earnedCredits).toBe(3);
      expect(calculus.earnedCredits).toBe(5);
      expect(humanities.earnedCredits).toBe(3);
      expect(result.totalCreditsPlanned).toBe(11);
    });

    it("should cap percentage at 100 when credits exceed requirement", () => {
      const planned: PlannedCourseWithCategory[] = [
        { courseId: "1", title: "Calculus 1", credits: 5, categoryName: "Basic Calculus", categoryTier: "major" },
        { courseId: "2", title: "Calculus 2", credits: 4, categoryName: "Basic Calculus", categoryTier: "major" },
        { courseId: "3", title: "Extra Math", credits: 3, categoryName: "Basic Calculus", categoryTier: "major" },
      ];

      const result = calculateProgress(planned, csRequirements, 120);
      const calculus = result.categories.find((c) => c.category === "Basic Calculus")!;

      expect(calculus.earnedCredits).toBe(12);
      expect(calculus.requiredCredits).toBe(9);
      expect(calculus.percentage).toBe(100);
    });

    it("should show 0 earned for a requirement category with no planned courses", () => {
      const planned: PlannedCourseWithCategory[] = [
        { courseId: "1", title: "Programming I", credits: 3, categoryName: "Basic CS", categoryTier: "major" },
      ];

      const result = calculateProgress(planned, csRequirements, 120);
      const humanities = result.categories.find((c) => c.category === "Humanities")!;

      expect(humanities.earnedCredits).toBe(0);
      expect(humanities.percentage).toBe(0);
      expect(humanities.courseCount).toBe(0);
    });

    it("should calculate total credits correctly across all categories", () => {
      const planned: PlannedCourseWithCategory[] = [
        { courseId: "1", title: "Programming I", credits: 3, categoryName: "Basic CS", categoryTier: "major" },
        { courseId: "2", title: "Calculus 1", credits: 5, categoryName: "Basic Calculus", categoryTier: "major" },
        { courseId: "3", title: "Intro to Lit", credits: 3, categoryName: "Humanities", categoryTier: "degree" },
      ];

      const result = calculateProgress(planned, csRequirements, 120);
      expect(result.totalCreditsPlanned).toBe(11);
      expect(result.totalCreditsRequired).toBe(120);
    });

    it("should calculate overall percentage against totalCreditsRequired", () => {
      const planned: PlannedCourseWithCategory[] = [
        { courseId: "1", title: "Course A", credits: 30, categoryName: "Basic CS", categoryTier: "major" },
        { courseId: "2", title: "Course B", credits: 30, categoryName: "Basic Calculus", categoryTier: "major" },
      ];

      const result = calculateProgress(planned, csRequirements, 120);
      expect(result.overallPercentage).toBe(50);
    });

    it("should sort categories with major tier before degree tier", () => {
      const planned: PlannedCourseWithCategory[] = [
        { courseId: "1", title: "Intro to Lit", credits: 3, categoryName: "Humanities", categoryTier: "degree" },
        { courseId: "2", title: "Programming I", credits: 3, categoryName: "Basic CS", categoryTier: "major" },
      ];

      const result = calculateProgress(planned, csRequirements, 120);

      // Major categories should come first
      const majorIndex = result.categories.findIndex((c) => c.tier === "major");
      const degreeIndex = result.categories.findIndex((c) => c.tier === "degree");
      expect(majorIndex).toBeLessThan(degreeIndex);

      // Verify all major-tier items are before all degree-tier items
      const lastMajorIndex = result.categories.map((c) => c.tier).lastIndexOf("major");
      const firstDegreeIndex = result.categories.findIndex((c) => c.tier === "degree");
      expect(lastMajorIndex).toBeLessThan(firstDegreeIndex);
    });

    it("should return empty categories array when requirements list is empty", () => {
      const planned: PlannedCourseWithCategory[] = [
        { courseId: "1", title: "Programming I", credits: 3, categoryName: "Basic CS", categoryTier: "major" },
      ];

      const result = calculateProgress(planned, [], 120);
      expect(result.categories).toHaveLength(0);
      expect(result.totalCreditsPlanned).toBe(3);
      expect(result.overallPercentage).toBe(3);
    });
  });
});
