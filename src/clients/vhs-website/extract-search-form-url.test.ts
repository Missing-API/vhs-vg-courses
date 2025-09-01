import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractSearchFormUrl } from "./extract-search-form-url";

describe("extractSearchFormUrl", () => {
  const searchHtml = `
  <html><body>
    <div>
      <div class="hauptseite_kurse">
        <div>
          <div class="kw-kursuebersicht">
            <div class="kw-nurbuchbare">
              <form method="post" action="/kurse?kathaupt=1&amp;cHash=abc123#kw-filter">
                <!-- some inputs -->
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body></html>`;

  beforeEach(() => {
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

  it("should extract absolute form action URL", async () => {
    const url = await extractSearchFormUrl();
    expect(url).toBe("https://www.vhs-vg.de/kurse?kathaupt=1&cHash=abc123#kw-filter");
  });

  it("should throw if form not found", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("<html><body><div>No form here</div></body></html>", { status: 200 })
    );

    await expect(extractSearchFormUrl()).rejects.toThrow(/Search form not found/);
  });

  it("should throw if action missing", async () => {
    const html = `
    <html><body>
      <div class="hauptseite_kurse">
        <div><div class="kw-kursuebersicht">
          <div class="kw-nurbuchbare"><form method="post"></form></div>
        </div></div>
      </div>
    </body></html>`;
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(html, { status: 200 }));

    await expect(extractSearchFormUrl()).rejects.toThrow(/Form action URL missing/);
  });
});