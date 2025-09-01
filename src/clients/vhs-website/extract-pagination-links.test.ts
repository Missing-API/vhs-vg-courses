import { describe, it, expect } from "vitest";
import { extractPaginationLinks } from "./extract-pagination-links";

describe("extractPaginationLinks", () => {
  const html = `
  <div class="kw-paginationleiste mt-4 clearfix" role="region" aria-label="Weitere Seiten mit Kursen"> 
    <span class="visually-hidden"><span class="anzahl">Seite 1 von 3</span></span>
    <nav aria-label="Navigation, um durch das Kursangebot zu blättern.">
      <ul class="pagination pagination-lg justify-content-center">
        <li class="page-item active"><span class="page-link" title="Aktuelle Seite 1" aria-label="Seite 1">1</span></li>
        <li class="page-item"><a class="blaetternindex page-link" href="/kurse?browse=forward&amp;kathaupt=1&amp;knr=252A41701&amp;cHash=0c473c3584462fc8e5bf55c866de6af8" title="Seite 2 öffnen" aria-label="Seite 2">2</a></li>
        <li class="page-item"><a class="blaetternindex page-link" href="/kurse?browse=forward&amp;kathaupt=1&amp;knr=252A40615&amp;cHash=05457abe3422b3f32f2c8e7fa80b630e" title="Seite 3 öffnen" aria-label="Seite 3">3</a></li>
        <li class="page-item">
          <a class="page-link" title="nächste Seite mit Kursen" href="/kurse?browse=forward&amp;kathaupt=1&amp;knr=252A41701&amp;cHash=0c473c3584462fc8e5bf55c866de6af8">
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </a> 
        </li>
      </ul>
    </nav>
  </div>`;

  it("should extract and normalize absolute URLs", () => {
    const urls = extractPaginationLinks(html, "https://www.vhs-vg.de/");
    expect(urls).toContain("https://www.vhs-vg.de/kurse?browse=forward&kathaupt=1&knr=252A41701&cHash=0c473c3584462fc8e5bf55c866de6af8");
    expect(urls).toContain("https://www.vhs-vg.de/kurse?browse=forward&kathaupt=1&knr=252A40615&cHash=05457abe3422b3f32f2c8e7fa80b630e");
    // Deduplicate "next" chevron link
    const unique = new Set(urls);
    expect(unique.size).toBe(urls.length);
  });

  it("should return empty array if no pagination exists", () => {
    const urls = extractPaginationLinks("<html><body><div>No pagination</div></body></html>", "https://www.vhs-vg.de/");
    expect(urls).toEqual([]);
  });
});