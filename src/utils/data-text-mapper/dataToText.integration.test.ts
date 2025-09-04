import { describe, it, expect } from "vitest";
import { dataToText, type TextWithData } from "@/utils/data-text-mapper";

describe("dataToText integration", () => {
  it("should convert TextWithData to formatted plain text", () => {
    const testData: TextWithData = {
      description: "Dieser Kurs eignet sich für Interessierte mit guten Vorkenntnissen, die ihre Kompetenzen im beruflichen Kontext erweitern möchten.",
      url: "https://www.vhs-vg.de/kurse/kurs/252A40609",
      tags: ["Bildung", "Volkshochschule"],
      scopes: ["Region"]
    };

    const result = dataToText(testData);
    
    // Should include description
    expect(result).toContain("Dieser Kurs eignet sich für Interessierte");
    
    // Should include URL on separate line
    expect(result).toContain("https://www.vhs-vg.de/kurse/kurs/252A40609");
    
    // Should include tags with # prefix
    expect(result).toContain("#Bildung");
    expect(result).toContain("#Volkshochschule");
    
    // Should include scopes with @ prefix
    expect(result).toContain("@Region");
    
    // Should have proper line separation
    expect(result.split('\n\n')).toHaveLength(3); // description, url, tags/scopes
  });

  it("should handle missing optional fields", () => {
    const testData: TextWithData = {
      description: "Simple description"
    };

    const result = dataToText(testData);
    
    expect(result).toBe("Simple description");
  });
});
