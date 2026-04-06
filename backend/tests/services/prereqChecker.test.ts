import {
  checkPrerequisites,
  CourseWithPrereqs,
  PlannedCourseInfo,
} from "../../src/services/prereqChecker";

describe("prereqChecker", () => {
  describe("checkPrerequisites", () => {
    it("should return valid when course has no prerequisites", () => {
      const course: CourseWithPrereqs = {
        id: "c1",
        normalizedCode: "COMPSCI200",
        title: "Programming I",
        prerequisites: [],
      };

      const result = checkPrerequisites(course, 1, []);
      expect(result.valid).toBe(true);
      expect(result.missingPrereqs).toHaveLength(0);
    });

    it("should return valid when prerequisite is planned in an earlier semester", () => {
      const course: CourseWithPrereqs = {
        id: "c2",
        normalizedCode: "COMPSCI300",
        title: "Programming II",
        prerequisites: [
          { id: "c1", normalizedCode: "COMPSCI200", title: "Programming I" },
        ],
      };

      const planned: PlannedCourseInfo[] = [
        { courseId: "c1", normalizedCode: "COMPSCI200", semesterOrder: 1 },
      ];

      const result = checkPrerequisites(course, 2, planned);
      expect(result.valid).toBe(true);
      expect(result.missingPrereqs).toHaveLength(0);
    });

    it("should return invalid when prerequisite is not planned anywhere", () => {
      const course: CourseWithPrereqs = {
        id: "c2",
        normalizedCode: "COMPSCI300",
        title: "Programming II",
        prerequisites: [
          { id: "c1", normalizedCode: "COMPSCI200", title: "Programming I" },
        ],
      };

      const result = checkPrerequisites(course, 2, []);
      expect(result.valid).toBe(false);
      expect(result.missingPrereqs).toHaveLength(1);
      expect(result.missingPrereqs[0].normalizedCode).toBe("COMPSCI200");
    });

    it("should return invalid when prerequisite is in the same semester", () => {
      const course: CourseWithPrereqs = {
        id: "c2",
        normalizedCode: "COMPSCI300",
        title: "Programming II",
        prerequisites: [
          { id: "c1", normalizedCode: "COMPSCI200", title: "Programming I" },
        ],
      };

      const planned: PlannedCourseInfo[] = [
        { courseId: "c1", normalizedCode: "COMPSCI200", semesterOrder: 2 },
      ];

      const result = checkPrerequisites(course, 2, planned);
      expect(result.valid).toBe(false);
      expect(result.missingPrereqs).toHaveLength(1);
    });

    it("should return invalid when prerequisite is in a later semester", () => {
      const course: CourseWithPrereqs = {
        id: "c2",
        normalizedCode: "COMPSCI300",
        title: "Programming II",
        prerequisites: [
          { id: "c1", normalizedCode: "COMPSCI200", title: "Programming I" },
        ],
      };

      const planned: PlannedCourseInfo[] = [
        { courseId: "c1", normalizedCode: "COMPSCI200", semesterOrder: 3 },
      ];

      const result = checkPrerequisites(course, 2, planned);
      expect(result.valid).toBe(false);
      expect(result.missingPrereqs).toHaveLength(1);
    });

    it("should return valid when all multiple prerequisites are met", () => {
      const course: CourseWithPrereqs = {
        id: "c3",
        normalizedCode: "ECE354",
        title: "Machine Organization and Programming",
        prerequisites: [
          { id: "c1", normalizedCode: "COMPSCI252", title: "Intro to Computer Engineering" },
          { id: "c2", normalizedCode: "COMPSCI300", title: "Programming II" },
        ],
      };

      const planned: PlannedCourseInfo[] = [
        { courseId: "c1", normalizedCode: "COMPSCI252", semesterOrder: 1 },
        { courseId: "c2", normalizedCode: "COMPSCI300", semesterOrder: 2 },
      ];

      const result = checkPrerequisites(course, 3, planned);
      expect(result.valid).toBe(true);
      expect(result.missingPrereqs).toHaveLength(0);
    });

    it("should return only the missing prerequisites when some are met", () => {
      const course: CourseWithPrereqs = {
        id: "c3",
        normalizedCode: "ECE354",
        title: "Machine Organization and Programming",
        prerequisites: [
          { id: "c1", normalizedCode: "COMPSCI252", title: "Intro to Computer Engineering" },
          { id: "c2", normalizedCode: "COMPSCI300", title: "Programming II" },
        ],
      };

      const planned: PlannedCourseInfo[] = [
        { courseId: "c1", normalizedCode: "COMPSCI252", semesterOrder: 1 },
      ];

      const result = checkPrerequisites(course, 3, planned);
      expect(result.valid).toBe(false);
      expect(result.missingPrereqs).toHaveLength(1);
      expect(result.missingPrereqs[0].normalizedCode).toBe("COMPSCI300");
    });

    it("should return all prerequisites as missing when plan is empty", () => {
      const course: CourseWithPrereqs = {
        id: "c3",
        normalizedCode: "ECE354",
        title: "Machine Organization and Programming",
        prerequisites: [
          { id: "c1", normalizedCode: "COMPSCI252", title: "Intro to Computer Engineering" },
          { id: "c2", normalizedCode: "COMPSCI300", title: "Programming II" },
        ],
      };

      const result = checkPrerequisites(course, 1, []);
      expect(result.valid).toBe(false);
      expect(result.missingPrereqs).toHaveLength(2);
    });

    it("should accept cross-listed equivalent as satisfying a prerequisite", () => {
      const course: CourseWithPrereqs = {
        id: "c3",
        normalizedCode: "COMPSCI354",
        title: "Machine Organization and Programming",
        prerequisites: [
          { id: "c1", normalizedCode: "COMPSCI240", title: "Intro to Discrete Mathematics" },
        ],
      };

      // User planned MATH240 instead of COMPSCI240 — should still satisfy
      const planned: PlannedCourseInfo[] = [
        { courseId: "m1", normalizedCode: "MATH240", semesterOrder: 1 },
      ];

      const result = checkPrerequisites(course, 2, planned);
      expect(result.valid).toBe(true);
      expect(result.missingPrereqs).toHaveLength(0);
    });

    it("should validate a prerequisite chain across multiple semesters", () => {
      // Chain: A (no prereqs) → B (needs A) → C (needs B)
      const courseC: CourseWithPrereqs = {
        id: "c3",
        normalizedCode: "COMPSCI400",
        title: "Programming III",
        prerequisites: [
          { id: "c2", normalizedCode: "COMPSCI300", title: "Programming II" },
        ],
      };

      const planned: PlannedCourseInfo[] = [
        { courseId: "c1", normalizedCode: "COMPSCI200", semesterOrder: 1 },
        { courseId: "c2", normalizedCode: "COMPSCI300", semesterOrder: 2 },
      ];

      const result = checkPrerequisites(courseC, 3, planned);
      expect(result.valid).toBe(true);
      expect(result.missingPrereqs).toHaveLength(0);
    });
  });
});
