import { describe, it, expect } from "vitest";
import { parseCourseResults } from "./parse-course-results";

describe("parseCourseResults", () => {
  const html = `
  <div class="kw-kursuebersicht" role="region" aria-label="Kurse der Kategorie">
    <table class="table kw-table kw-kursuebersicht-table mt-5">
      <thead>...</thead>
      <tbody>
        <tr class="clickable-row kw-table-row kw-kurstitel alt1" data-href="/kurse/kurs/Italienisch-fuer-Anfaenger-A1A2-geringe-Vorkenntnisse-Modul-3/252A40901">
          <td headers="kue-columnheader1">
            <span class="ampelicon nichtbuchbar" title="Dieser Kurs ist nicht buchbar und kann nicht in den Warenkorb hinzugefügt werden">
              <i class="bi bi-info-circle" aria-label="Rotes Info-Symbol"></i>       
            </span>
          </td>
          <td headers="kue-columnheader2">
            <a href="/kurse/kurs/Italienisch-fuer-Anfaenger-A1A2-geringe-Vorkenntnisse-Modul-3/252A40901" title="Mehr Details">Italienisch für Anfänger A1/A2 (geringe Vorkenntnisse), Modul 3</a>
          </td>
          <td headers="kue-columnheader3">
            <abbr title="Samstag">Sa.</abbr> 06.09.2025, 
            <br> 9.15 Uhr
          </td>
          <td headers="kue-columnheader4">Raum 1 - VHS Anklam, Markt 7</td>
          <td headers="kue-columnheader5">4 von 6</td>
          <td headers="kue-columnheader6" class="nr-column">252A40901</td>
        </tr>
        <tr class="clickable-row kw-table-row kw-kurstitel alt2" data-href="/kurse/kurs/Hatha-Yoga-Ruhe-Kraft-und-Zentriertheit-finden/252A30106">
          <td headers="kue-columnheader1">
            <span class="ampelicon buchbar" title="Dieser Kurs ist buchbar">
              <i class="bi bi-cart3" aria-label="Blaues Einkaufswagen-Symbol"></i>
            </span>
          </td>
          <td headers="kue-columnheader2">
            <a href="/kurse/kurs/Hatha-Yoga-Ruhe-Kraft-und-Zentriertheit-finden/252A30106" title="Mehr Details">Hatha Yoga - Ruhe, Kraft und Zentriertheit finden</a>
          </td>
          <td headers="kue-columnheader3">
            <abbr title="Dienstag">Di.</abbr> 09.09.2025,
            <br> 18.15 Uhr
          </td>
          <td headers="kue-columnheader4">VHS in Anklam, Saal Demminer Str. 15</td>
          <td headers="kue-columnheader5">11 von 14</td>
          <td headers="kue-columnheader6" class="nr-column">252A30106</td>
        </tr>
      </tbody>
    </table>
  </div>`;

  it("should parse rows into structured courses", () => {
    const courses = parseCourseResults(html, "https://www.vhs-vg.de/");
    expect(courses).toHaveLength(2);

    const first = courses[0];
    expect(first.courseNumber).toBe("252A40901");
    expect(first.title).toContain("Italienisch für Anfänger");
    expect(first.locationText).toContain("VHS Anklam");
    expect(first.belegungText).toBe("4 von 6");
    expect(first.bookable).toBe(false);
    expect(first.detailUrl).toBe("https://www.vhs-vg.de/kurse/kurs/Italienisch-fuer-Anfaenger-A1A2-geringe-Vorkenntnisse-Modul-3/252A40901");
    expect(first.dateText).toContain("06.09.2025");

    const second = courses[1];
    expect(second.bookable).toBe(true);
    expect(second.detailUrl).toBe("https://www.vhs-vg.de/kurse/kurs/Hatha-Yoga-Ruhe-Kraft-und-Zentriertheit-finden/252A30106");
    expect(second.belegungText).toBe("11 von 14");
  });

  it("should return empty array if no table found", () => {
    const courses = parseCourseResults("<html><body>No table</body></html>", "https://www.vhs-vg.de/");
    expect(courses).toEqual([]);
  });
});