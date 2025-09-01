import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractLocationDetails } from "./extract-location-details";

describe("extractLocationDetails", () => {
    const detailsHtml = `
  <html><body>
    <div class="hauptseite_ohnestatus">
 <a id="inhalt"></a>
<div class="kw-ausstenstellen mt-5 row"><div class="col-md-6 col-lg-4">
  <div class="card mb-5">  
    <img src="https://www.vhs-vg.de//fileadmin/kuferweb/webbasys/bilder/as/S_902_1.jpg" class="card-img-top" alt="Foto der Außenstelle Anklam">
    <div class="card-body">
      <!--<a href="/ihre-vhs/aussenstellenuebersicht/aussenstelle/Anklam/36" class="block kw-link-block">-->
      <h2>
        <span class="visually-hidden">Außenstelle:</span>
        Anklam
      </h2>
      <p class="card-text">
        <strong>Leiter:in:</strong> Frau Andrea Jager
      </p>
      <p class="card-text"> 
        <span class="visually-hidden">Adresse:</span>
        
        Markt 7<br> 
        17389 Anklam
        </p>
      
      <p>
        <i class="bi bi-envelope-at-fill" aria-hidden="true"></i> <a href="mailto:vhs-anklam@kreis-vg.de" title="E-Mail an vhs-anklam@kreis-vg.de verfassen">vhs-anklam@kreis-vg.de</a>
        <br>
        <i class="bi bi-telephone-fill" aria-hidden="true"></i> <a href="tel:03834 8760 4820" title="03834 8760 4820 anrufen">03834 8760 4820</a>
      </p>
      <hr>
      <p>
        <a href="/kurssuche/liste?suchesetzen=false&amp;kfs_aussenst=Anklam" title="Kurse der Außenstelle Anklam anzeigen" class="btn btn-main">Zu den Kursen der Außenstelle</a>
      </p>
    </div>
  </div>
</div><div class="col-md-6 col-lg-4">
  <div class="card mb-5">  
    <img src="https://www.vhs-vg.de//fileadmin/kuferweb/webbasys/bilder/as/S_903_1.jpg" class="card-img-top" alt="Foto der Außenstelle Greifswald">
    <div class="card-body">
      <!--<a href="/ihre-vhs/aussenstellenuebersicht/aussenstelle/Greifswald/22" class="block kw-link-block">-->
      <h2>
        <span class="visually-hidden">Außenstelle:</span>
        Greifswald
      </h2>
      <p class="card-text">
        <strong>Leiter:in:</strong> Frau Marika Weber
      </p>
      <p class="card-text"> 
        <span class="visually-hidden">Adresse:</span>
        
        Martin-Luther-Str. 7a<br> 
        17489 Greifswald
        </p>
      
      <p>
        <i class="bi bi-envelope-at-fill" aria-hidden="true"></i> <a href="mailto:vhs-Greifswald@kreis-vg.de" title="E-Mail an vhs-Greifswald@kreis-vg.de verfassen">vhs-Greifswald@kreis-vg.de</a>
        <br>
        <i class="bi bi-telephone-fill" aria-hidden="true"></i> <a href="tel:03834 8760 4830" title="03834 8760 4830 anrufen">03834 8760 4830</a>
      </p>
      <hr>
      <p>
        <a href="/kurssuche/liste?suchesetzen=false&amp;kfs_aussenst=Greifswald" title="Kurse der Außenstelle Greifswald anzeigen" class="btn btn-main">Zu den Kursen der Außenstelle</a>
      </p>
    </div>
  </div>
</div><div class="col-md-6 col-lg-4">
  <div class="card mb-5">  
    <img src="https://www.vhs-vg.de//fileadmin/kuferweb/webbasys/bilder/as/S_904_1.jpg" class="card-img-top" alt="Foto der Außenstelle Pasewalk">
    <div class="card-body">
      <!--<a href="/ihre-vhs/aussenstellenuebersicht/aussenstelle/Pasewalk/37" class="block kw-link-block">-->
      <h2>
        <span class="visually-hidden">Außenstelle:</span>
        Pasewalk
      </h2>
      <p class="card-text">
        <strong>Leiter:in:</strong> Frau Anke Holstein
      </p>
      <p class="card-text"> 
        <span class="visually-hidden">Adresse:</span>
        
        Gemeindewiesenweg 8<br> 
        17309 Pasewalk
        </p>
      
      <p>
        <i class="bi bi-envelope-at-fill" aria-hidden="true"></i> <a href="mailto:vhs-Pasewalk@kreis-vg.de" title="E-Mail an vhs-Pasewalk@kreis-vg.de verfassen">vhs-Pasewalk@kreis-vg.de</a>
        <br>
        <i class="bi bi-telephone-fill" aria-hidden="true"></i> <a href="tel:03834 8760 4810" title="03834 8760 4810 anrufen">03834 8760 4810</a>
      </p>
      <hr>
      <p>
        <a href="/kurssuche/liste?suchesetzen=false&amp;kfs_aussenst=Pasewalk" title="Kurse der Außenstelle Pasewalk anzeigen" class="btn btn-main">Zu den Kursen der Außenstelle</a>
      </p>
    </div>
  </div>
</div></div></div>
  </body></html>`;

    beforeEach(() => {
        // Mock fetch with different responses based on URL
        vi.spyOn(global, "fetch").mockImplementation((input: RequestInfo | URL) => {
            const url = input.toString();
            if (url.includes("/aussenstellenuebersicht")) {
                return Promise.resolve(new Response(detailsHtml, { status: 200 }));
            }
            return Promise.reject(new Error("Unknown URL"));
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should parse addresses from location details page", async () => {
        const map = await extractLocationDetails();
        expect(map.anklam.address).toBe("Volkshochschule Vorpommern-Greifswald, Markt 7, 17389 Anklam");
        expect(map.greifswald.address).toBe("Volkshochschule Vorpommern-Greifswald, Martin-Luther-Str. 7a, 17489 Greifswald");
        expect(map.pasewalk.address).toContain("Volkshochschule Vorpommern-Greifswald, ");
        expect(map.pasewalk.address).toContain("17309 Pasewalk");
    });

    it("should create slugified IDs from headings", async () => {
        const map = await extractLocationDetails();
        const keys = Object.keys(map);

        expect(keys).toContain("anklam");
        expect(keys).toContain("greifswald");
        expect(keys).toContain("pasewalk");
    });

    it("should extract address from multiple text chunks", async () => {
        const map = await extractLocationDetails();

        // Should find the chunk that looks like an address (contains digits and city)
        expect(map.anklam.address).toBe("Volkshochschule Vorpommern-Greifswald, Markt 7, 17389 Anklam");
        expect(map.greifswald.address).toBe("Volkshochschule Vorpommern-Greifswald, Martin-Luther-Str. 7a, 17489 Greifswald");
    });

    it("should handle empty or malformed HTML gracefully", async () => {
        const emptyHtml = `<html><body><div class="hauptseite_ohnestatus"></div></body></html>`;

        vi.spyOn(global, "fetch").mockImplementation(() => {
            return Promise.resolve(new Response(emptyHtml, { status: 200 }));
        });

        const map = await extractLocationDetails();
        expect(Object.keys(map)).toHaveLength(0);
    });
});
