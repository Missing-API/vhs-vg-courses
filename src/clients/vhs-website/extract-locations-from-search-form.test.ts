import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractLocationsFromSearchForm } from "./extract-locations-from-search-form";

describe("extractLocationsFromSearchForm", () => {
  const searchHtml = `
  <html><body>
    <div id="kw-filter-ortvalues">
      <ul>
        <li><input type="checkbox" name="katortfilter[]" id="loc1" value="Anklam"/>
          <label for="loc1">Anklam (12)</label>
        </li>
        <li><input type="checkbox" name="katortfilter[]" id="loc2" value="Greifswald"/>
          <label for="loc2">Greifswald (200)</label>
        </li>
        <li><input type="checkbox" name="katortfilter[]" id="loc3" value="Pasewalk"/>
          <label for="loc3">Pasewalk (30)</label>
        </li>
        <li><input type="checkbox" name="katortfilter[]" id="reset" value="__reset__"/></li>
      </ul>
    </div>
  </body></html>`;

  beforeEach(() => {
    // Mock fetch with different responses based on URL
    vi.spyOn(global, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes("/kurse")) {
        return Promise.resolve(new Response(searchHtml, { status: 200 }));
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should parse location names and counts from search form", async () => {
    const items = await extractLocationsFromSearchForm();
    expect(items.map(i => i.id).sort()).toEqual(["anklam", "greifswald", "pasewalk"].sort());
    
    // Test that names are preserved correctly
    const anklam = items.find(i => i.id === "anklam");
    const greifswald = items.find(i => i.id === "greifswald");
    const pasewalk = items.find(i => i.id === "pasewalk");
    
    expect(anklam?.name).toBe("Anklam");
    expect(greifswald?.name).toBe("Greifswald");
    expect(pasewalk?.name).toBe("Pasewalk");
  });

  it("should extract counts from labels", async () => {
    const items = await extractLocationsFromSearchForm();
    const anklam = items.find(i => i.id === "anklam");
    const greifswald = items.find(i => i.id === "greifswald");
    const pasewalk = items.find(i => i.id === "pasewalk");

    expect(anklam?.count).toBe(12);
    expect(greifswald?.count).toBe(200);
    expect(pasewalk?.count).toBe(30);
  });

  it("should handle missing counts gracefully", async () => {
    const htmlWithoutCounts = `
    <html><body>
      <div id="kw-filter-ortvalues">
        <ul>
          <li><input type="checkbox" name="katortfilter[]" id="loc1" value="Anklam"/>
            <label for="loc1">Anklam</label>
          </li>
        </ul>
      </div>
    </body></html>`;

    vi.spyOn(global, "fetch").mockImplementation(() => {
      return Promise.resolve(new Response(htmlWithoutCounts, { status: 200 }));
    });

    const items = await extractLocationsFromSearchForm();
    expect(items[0].count).toBeUndefined();
    expect(items[0].name).toBe("Anklam");
    expect(items[0].id).toBe("anklam");
  });

  it("should properly separate names from counts in parentheses", async () => {
    const items = await extractLocationsFromSearchForm();
    
    // Ensure that counts are extracted but names don't include the count part
    const greifswald = items.find(i => i.id === "greifswald");
    expect(greifswald?.name).toBe("Greifswald"); // Should not include "(200)"
    expect(greifswald?.count).toBe(200);
    
    const anklam = items.find(i => i.id === "anklam");
    expect(anklam?.name).toBe("Anklam"); // Should not include "(12)"
    expect(anklam?.count).toBe(12);
  });

  it("should filter out reset values", async () => {
    const items = await extractLocationsFromSearchForm();
    const resetItem = items.find(i => i.id === "__reset__" || i.name === "__reset__");
    expect(resetItem).toBeUndefined();
  });
});
