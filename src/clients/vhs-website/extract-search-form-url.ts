"use cache";

import * as cheerio from "cheerio";
import { fetchWithTimeout } from "./fetch-with-timeout";
import logger from "@/logging/logger";
import { withCategory, startTimer, errorToObject } from "@/logging/helpers";

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
  const selector =
    "div > div.hauptseite_kurse > div > div.kw-kursuebersicht > div.kw-nurbuchbare > form";

  const log = withCategory(logger, 'vhsClient');
  const end = startTimer();

  try {
    const res = await fetchWithTimeout(searchUrl, { method: "GET" });
    const html = await res.text();
    const $ = cheerio.load(html);

    const form = $(selector).first();

    if (!form || form.length === 0) {
      const err = new Error(
        `Search form not found at ${searchUrl} using selector '${selector}'`
      );
      log.error({ operation: 'parse', selector, url: searchUrl, err: errorToObject(err) }, 'Search form not found');
      throw err;
    }

    const action = (form.attr("action") || "").trim();
    if (!action) {
      const err = new Error(`Form action URL missing at ${searchUrl}`);
      log.error({ operation: 'parse', selector, url: searchUrl, err: errorToObject(err) }, 'Form action missing');
      throw err;
    }

    // Build absolute URL in case action is relative
    const url = new URL(action, baseUrl).toString();
    log.info({ operation: 'parse', selector, durationMs: end(), url }, 'Extracted search form url');
    return url;
  } catch (err) {
    log.error({ operation: 'parse', selector, url: searchUrl, err: errorToObject(err) }, 'Failed to extract search form url');
    throw err;
  }
}