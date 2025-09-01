"use cache";

import * as cheerio from "cheerio";
import slugify from "slugify";
import { fetchWithTimeout } from "./fetch-with-timeout";
import logger from "@/logging/logger";
import { withCategory, startTimer } from "@/logging/helpers";

/**
 * Get detailed information for each location from
 * https://www.vhs-vg.de/ihre-vhs/aussenstellenuebersicht
 * within 'div.hauptseite_ohnestatus'. Cached using Next.js useCache.
 */
export async function extractLocationDetails(): Promise<Record<string, { address?: string }>> {
  const INSTITUTION_NAME = "Volkshochschule Vorpommern-Greifswald";
  const log = withCategory(logger, 'locationProcessing');
  const end = startTimer();

  const url = "https://www.vhs-vg.de/ihre-vhs/aussenstellenuebersicht";
  log.debug({ operation: 'fetch', url }, 'Fetching location details page');
  const res = await fetchWithTimeout(url, { method: "GET" });
  const html = await res.text();
  const $ = cheerio.load(html);

  const container = $("div.hauptseite_ohnestatus");
  const details: Record<string, { address?: string }> = {};

  const cards = container.find(".card");
  log.debug({ operation: 'parse', selector: '.card', count: cards.length }, 'Parsing location cards');

  // Find all cards within the container
  cards.each((_, card) => {
    const $card = $(card);
    
    // Extract location name from h2
    const heading = $card.find("h2").text().trim();
    if (!heading) return;
    
    // Clean the heading text by removing "Außenstelle:" prefix and create slugified ID
    const cleanHeading = heading.replace(/^Außenstelle:\s*/, "").trim();
    const id = slugify(cleanHeading, { lower: true });
    
    // Find the address paragraph - it has a visually-hidden span with "Adresse:"
    const addressP = $card.find("p").filter((_, p) => {
      return $(p).find("span.visually-hidden").text().includes("Adresse:");
    });
    
    let address = "";
    
    if (addressP.length > 0) {
      // Get the HTML content and process <br> tags
      const addressHtml = addressP.html() || "";
      // Remove the visually-hidden span
      const cleanHtml = addressHtml.replace(/<span[^>]*class="visually-hidden"[^>]*>.*?<\/span>/g, "").trim();
      // Convert <br> tags to commas, then extract text
      const htmlWithCommas = cleanHtml.replace(/<br\s*\/?>/gi, ", ");
      address = $(`<div>${htmlWithCommas}</div>`).text().replace(/\s+/g, " ").trim();
    }
    
    if (id && address) {
      const fullAddress = `${INSTITUTION_NAME}, ${address}`;
      details[id] = { address: fullAddress };
    }
  });

  const durationMs = end();
  log.info({ operation: 'parse', locations: Object.keys(details).length, durationMs }, 'Extracted location details');
  return details;
}
