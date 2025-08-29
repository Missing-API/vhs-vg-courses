import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  extractLocationsFromSearchForm,
  extractLocationDetails,
  getLocations,
} from "@/clients/vhs-website/vhs-search.client";

describe("VHS website client - locations", () => {
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

  const detailsHtml = `
  <html><body>
    <div class="hauptseite_ohnestatus">
      <h3>Anklam</h3>
      <p>Markt 1</p>
      <p>17389 Anklam</p>

      <h3>Greifswald</h3>
      <p>Martin-Andersen-Nexö-Platz 1</p>
      <p>17489 Greifswald</p>

      <h3>Pasewalk</h3>
      <p>Am Markt 5</p>
      <p>17309 Pasewalk</p>
    </div>
  </body></html>`;

  beforeEach(() => {
    // Mock fetch with different responses based on URL
    vi.spyOn(global, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes("/kurse")) {
        return Promise.resolve(new Response(searchHtml, { status: 200 }));
      }
      if (url.includes("/aussenstellenuebersicht")) {
        return Promise.resolve(new Response(detailsHtml, { status: 200 }));
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("extractLocationsFromSearchForm parses names and counts", async () => {
    const items = await extractLocationsFromSearchForm();
    expect(items.map(i => i.id).sort()).toEqual(["anklam", "greifswald", "pasewalk"].sort());
    const total = items.reduce((a, b) => a + (b.count || 0), 0);
    expect(total).toBe(242);
  });

  it("extractLocationDetails parses addresses", async () => {
    const map = await extractLocationDetails();
    expect(map.anklam.address).toContain("17389 Anklam");
    expect(map.greifswald.address).toContain("17489 Greifswald");
    expect(map.pasewalk.address).toContain("17309 Pasewalk");
  });

  it("getLocations combines data correctly", async () => {
    const res = await getLocations();
    expect(res.totalLocations).toBe(3);
    expect(res.totalCourses).toBe(242);
    expect(Array.isArray(res.locations)).toBe(true);
    const greifswald = res.locations.find(l => l.id === "greifswald");
    expect(greifswald?.address).toContain("Greifswald");
  });
});