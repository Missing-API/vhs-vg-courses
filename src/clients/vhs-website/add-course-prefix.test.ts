import { describe, it, expect } from "vitest";
import { addCoursePrefix } from "./add-course-prefix";

describe("addCoursePrefix", () => {
  it("should add prefix to course title", () => {
    const title = "Excel Grundlagen";
    const result = addCoursePrefix(title);
    expect(result).toBe("vhs Kurs: Excel Grundlagen");
  });

  it("should not add prefix if already present", () => {
    const title = "vhs Kurs: Excel Grundlagen";
    const result = addCoursePrefix(title);
    expect(result).toBe("vhs Kurs: Excel Grundlagen");
  });

  it("should not add prefix if already present (case-insensitive)", () => {
    const title = "VHS KURS: Excel Grundlagen";
    const result = addCoursePrefix(title);
    expect(result).toBe("VHS KURS: Excel Grundlagen");
  });

  it("should preserve original formatting when prefix exists", () => {
    const title = "  vhs Kurs: Excel Grundlagen  ";
    const result = addCoursePrefix(title);
    expect(result).toBe("  vhs Kurs: Excel Grundlagen  ");
  });

  it("should handle empty string", () => {
    const title = "";
    const result = addCoursePrefix(title);
    expect(result).toBe("");
  });

  it("should handle whitespace-only string", () => {
    const title = "   ";
    const result = addCoursePrefix(title);
    expect(result).toBe("   ");
  });

  it("should add prefix to complex course titles", () => {
    const title = "Deutsch als Fremdsprache A1.1 - Intensivkurs für Anfänger";
    const result = addCoursePrefix(title);
    expect(result).toBe("vhs Kurs: Deutsch als Fremdsprache A1.1 - Intensivkurs für Anfänger");
  });

  it("should handle titles with special characters", () => {
    const title = "Hatha Yoga - Ruhe, Kraft und Zentriertheit finden";
    const result = addCoursePrefix(title);
    expect(result).toBe("vhs Kurs: Hatha Yoga - Ruhe, Kraft und Zentriertheit finden");
  });
});
