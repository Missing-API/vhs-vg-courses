import { describe, it, expect } from "vitest";
import { extractLocationsFromSearchForm, fetchLocationDetails } from "./vhs-search.client";
import { STATIC_LOCATIONS } from "./locations.constants";

describe("VHS Search Client", () => {
  it("extractLocationsFromSearchForm should parse checkbox-based filters", async () => {
    const html = `
      <form>
        <div id="kw-filter-ortvalues">
          <div>
            <input id="loc-anklam" type="checkbox" name="katortfilter[]" value="Anklam" />
            <label for="loc-anklam">Anklam</label>
          </div>
          <div>
            <input id="loc-greifswald" type="checkbox" name="katortfilter[]" value="Greifswald" />
            <label for="loc-greifswald">Greifswald</label>
          </div>
          <div>
            <input id="loc-pasewalk" type="checkbox" name="katortfilter[]" value="Pasewalk" />
            <label for="loc-pasewalk">Pasewalk</label>
          </div>
          <input type="hidden" name="katortfilter[]" value="__reset__" />
        </div>
      </form>
    `;

    const locations = await extractLocationsFromSearchForm(html);
    const ids = locations.map((l) => l.id).sort();
    expect(ids).toEqual(["anklam", "greifswald", "pasewalk"].sort());
  });

  it("extractLocationsFromSearchForm should parse select/option-based filters", async () => {
    const html = `
      <form>
        <select name="katortfilter[]">
          <option value="__reset__">Bitte wählen</option>
          <option value="Anklam">Anklam</option>
          <option value="Greifswald">Greifswald</option>
          <option value="Pasewalk">Pasewalk</option>
        </select>
      </form>
    `;

    const locations = await extractLocationsFromSearchForm(html);
    const names = locations.map((l) => l.name);
    expect(names).toEqual(expect.arrayContaining(["Anklam", "Greifswald", "Pasewalk"]));
  });

  it("fetchLocationDetails should return static details", async () => {
    const anklam = await fetchLocationDetails("anklam");
    expect(anklam).toMatchObject(STATIC_LOCATIONS.anklam);

    const greifswald = await fetchLocationDetails("Greifswald");
    expect(greifswald).toMatchObject(STATIC_LOCATIONS.greifswald);
  });

  it("fetchLocationDetails should throw for unknown ids", async () => {
    await expect(fetchLocationDetails("unknown-town")).rejects.toThrow();
  });
});