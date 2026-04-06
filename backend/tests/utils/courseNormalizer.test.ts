import {
  normalizeCode,
  normalizeRawCode,
  areEquivalent,
} from "../../src/utils/courseNormalizer";

describe("courseNormalizer", () => {
  describe("normalizeCode", () => {
    it("should normalize COMP SCI + 300 to COMPSCI300", () => {
      expect(normalizeCode("COMP SCI", "300")).toBe("COMPSCI300");
    });

    it("should handle lowercase input", () => {
      expect(normalizeCode("comp sci", "300")).toBe("COMPSCI300");
    });

    it("should resolve CS abbreviation to COMPSCI", () => {
      expect(normalizeCode("CS", "300")).toBe("COMPSCI300");
    });

    it("should handle already-normalized COMPSCI", () => {
      expect(normalizeCode("COMPSCI", "300")).toBe("COMPSCI300");
    });

    it("should normalize E C E to ECE", () => {
      expect(normalizeCode("E C E", "354")).toBe("ECE354");
    });

    it("should pass through MATH unchanged", () => {
      expect(normalizeCode("MATH", "221")).toBe("MATH221");
    });

    it("should resolve STATISTICS to STAT", () => {
      expect(normalizeCode("STATISTICS", "324")).toBe("STAT324");
    });

    it("should trim surrounding whitespace from subject and number", () => {
      expect(normalizeCode("  COMP SCI  ", " 300 ")).toBe("COMPSCI300");
    });

    it("should pass through unknown subjects by stripping spaces", () => {
      expect(normalizeCode("BIOLOGY", "151")).toBe("BIOLOGY151");
    });
  });

  describe("normalizeRawCode", () => {
    it('should parse "CS 300" into COMPSCI300', () => {
      expect(normalizeRawCode("CS 300")).toBe("COMPSCI300");
    });

    it('should parse "COMP SCI 300" into COMPSCI300', () => {
      expect(normalizeRawCode("COMP SCI 300")).toBe("COMPSCI300");
    });

    it("should handle extra spaces between subject and number", () => {
      expect(normalizeRawCode("comp sci  300")).toBe("COMPSCI300");
    });

    it('should parse "MATH 221" into MATH221', () => {
      expect(normalizeRawCode("MATH 221")).toBe("MATH221");
    });

    it('should parse "E C E 354" into ECE354', () => {
      expect(normalizeRawCode("E C E 354")).toBe("ECE354");
    });

    it('should parse "PHYSICS 201" into PHYSICS201', () => {
      expect(normalizeRawCode("PHYSICS 201")).toBe("PHYSICS201");
    });
  });

  describe("areEquivalent", () => {
    it("should return true for identical codes", () => {
      expect(areEquivalent("COMPSCI300", "COMPSCI300")).toBe(true);
    });

    it("should return false for different non-cross-listed codes", () => {
      expect(areEquivalent("COMPSCI300", "COMPSCI400")).toBe(false);
    });

    it("should return true for cross-listed COMPSCI354 and ECE354", () => {
      expect(areEquivalent("COMPSCI354", "ECE354")).toBe(true);
    });

    it("should return true for cross-listed ECE354 and COMPSCI354 (reverse)", () => {
      expect(areEquivalent("ECE354", "COMPSCI354")).toBe(true);
    });

    it("should return true for cross-listed COMPSCI240 and MATH240", () => {
      expect(areEquivalent("COMPSCI240", "MATH240")).toBe(true);
    });

    it("should return false for non-cross-listed different subjects", () => {
      expect(areEquivalent("COMPSCI300", "MATH300")).toBe(false);
    });
  });
});
