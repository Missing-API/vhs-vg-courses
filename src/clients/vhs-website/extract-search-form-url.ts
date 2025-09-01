"use cache";

import * as cheerio from "cheerio";
import { fetchWithTimeout } from "./fetch-with-timeout";

/**
 * Extract the course search form action URL from the VHS-VG course search page.
 * - Page URL: https://www.vhs-vg.de/kurse
 * - Selector: div > div.hauptseite_kurse > div > div.kw-kursuebersicht > div.kw-nurbuchbare > form
 *
 * Returns an absolute URL (including kathaupt and cHash params).
 */
export async function extractSearchFormUrl(): Promise<string> {
  const baseUrl = "https://www.vhs-vg.de";
  const searchUrl = `${baseUrl}/kurse`;

  const res = await fetchWithTimeout(searchUrl, { method: "GET" });
  const html = await res.text();
  const $ = cheerio.load(html);

  const selector =
    "div > div.hauptseite_kurse > div > div.kw-kursuebersicht > div.kw-nurbuchbare > form";
  const form = $(selector).first();

  if (!form || form.length === 0) {
    throw new Error(
      `Search form not found at ${searchUrl} using selector '${selector}'`
    );
  }

  const action = (form.attr("action") || "").trim();
  if (!action) {
    throw new Error(`Form action URL missing at ${searchUrl}`);
  }

  // Build absolute URL in case action is relative
  const url = new URL(action, baseUrl).toString();
  return url;
}