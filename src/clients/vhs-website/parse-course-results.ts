import * as cheerio from "cheerio";
import { Course } from "./courses.schema";

/**
 * Parse the course results table into structured Course objects.
 * Selector: div.kw-kursuebersicht > table
 */
export function parseCourseResults(html: string, baseHref: string): Course[] {
  const $ = cheerio.load(html);
  const table = $("div.kw-kursuebersicht > table").first();
  if (!table || table.length === 0) {
    return [];
  }

  const courses: Course[] = [];
  table.find("tbody > tr.kw-table-row").each((_, tr) => {
    const $tr = $(tr);

    // Title and detail URL
    const titleLink = $tr.find('td[headers="kue-columnheader2"] a').first();
    const title = titleLink.text().replace(/\s+/g, " ").trim();
    const relHref =
      (titleLink.attr("href") || $tr.attr("data-href") || "").trim();
    if (!title || !relHref) return;

    let detailUrl: string;
    try {
      detailUrl = new URL(relHref, baseHref).toString();
    } catch {
      // If baseHref is malformed or relHref invalid, skip row
      return;
    }

    // Date text
    const dateText = $tr
      .find('td[headers="kue-columnheader3"]')
      .text()
      .replace(/\s+/g, " ")
      .replace(/\s,/, ",")
      .trim();

    // Location text
    const locationText = $tr
      .find('td[headers="kue-columnheader4"]')
      .text()
      .replace(/\s+/g, " ")
      .trim();

    // Belegung text
    const belegungText = $tr
      .find('td[headers="kue-columnheader5"]')
      .text()
      .replace(/\s+/g, " ")
      .trim();

    // Course number
    const courseNumber = $tr
      .find('td[headers="kue-columnheader6"]')
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const ampel = $tr.find(".ampelicon").first();
    const bookable = ampel.hasClass("buchbar");

    const id = courseNumber || title;

    courses.push({
      id,
      title,
      detailUrl,
      dateText,
      locationText,
      belegungText,
      courseNumber,
      bookable,
    });
  });

  return courses;
}