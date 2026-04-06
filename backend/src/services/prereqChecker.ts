/**
 * Pure function for validating course prerequisites against a student's plan.
 * Only imports from courseNormalizer (also pure). No Prisma, Express, or side effects.
 */

import { areEquivalent } from "../utils/courseNormalizer";

/** A course placed in a semester within the student's plan. */
export interface PlannedCourseInfo {
  courseId: string;
  normalizedCode: string;
  semesterOrder: number;
}

/** A prerequisite course reference. */
export interface PrereqInfo {
  id: string;
  normalizedCode: string;
  title: string;
}

/** A course along with its prerequisite list. */
export interface CourseWithPrereqs {
  id: string;
  normalizedCode: string;
  title: string;
  prerequisites: PrereqInfo[];
}

/** Result of a prerequisite validation check. */
export interface PrereqCheckResult {
  valid: boolean;
  missingPrereqs: PrereqInfo[];
}

/**
 * Checks whether all prerequisites for a course are satisfied by courses
 * planned in earlier semesters.
 * @param course - The course being added, with its prerequisite list
 * @param targetSemesterOrder - The semester order where the course will be placed
 * @param allPlannedCourses - All courses currently in the student's plan
 * @returns Which prerequisites are met and which are missing
 */
export function checkPrerequisites(
  course: CourseWithPrereqs,
  targetSemesterOrder: number,
  allPlannedCourses: PlannedCourseInfo[]
): PrereqCheckResult {
  if (course.prerequisites.length === 0) {
    return { valid: true, missingPrereqs: [] };
  }

  // Collect normalized codes from strictly earlier semesters
  const completedCodes = allPlannedCourses
    .filter((pc) => pc.semesterOrder < targetSemesterOrder)
    .map((pc) => pc.normalizedCode);

  const missingPrereqs = course.prerequisites.filter((prereq) => {
    return !completedCodes.some((code) => areEquivalent(code, prereq.normalizedCode));
  });

  return {
    valid: missingPrereqs.length === 0,
    missingPrereqs,
  };
}
