import * as cheerio from "cheerio";

export type JsonLdCourse = {
  name?: string;
  description?: string;
  hasCourseInstance?: Array<{
    startDate?: string;
    endDate?: string;
    location?: {
      name?: string;
      address?: {
        streetAddress?: string;
        postalCode?: string;
        addressLocality?: string;
      };
    };
  }> | {
    startDate?: string;
    endDate?: string;
    location?: {
      name?: string;
      address?: {
        streetAddress?: string;
        postalCode?: string;
        addressLocality?: string;
      };
    };
  };
  provider?: { name?: string };
};

export function extractJsonLd(html: string): any[] {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  const out: any[] = [];
  scripts.each((_, el) => {
    const txt = $(el).contents().text();
    if (!txt) return;
    try {
      const json = JSON.parse(txt);
      if (Array.isArray(json)) out.push(...json);
      else out.push(json);
    } catch {
      // ignore malformed JSON-LD blocks
    }
  });
  return out;
}

export function findCourseJsonLd(html: string): JsonLdCourse | undefined {
  const blocks = extractJsonLd(html);
  return blocks.find((b) => {
    const t = b["@type"];
    if (Array.isArray(t)) return t.includes("Course") || t.includes("EducationalOccupationalProgram");
    return t === "Course" || t === "EducationalOccupationalProgram";
  });
}