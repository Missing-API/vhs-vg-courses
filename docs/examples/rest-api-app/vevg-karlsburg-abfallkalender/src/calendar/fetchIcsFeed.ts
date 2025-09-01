import { vevgWasteCategories } from "../vevg.config";
import {
  VevgCommunity,
  VevgIcsQuery,
  VevgProperIcsEvent,
  VevgRawIcsEvent,
} from "../vevg.types";
import ical from "node-ical";
import { qualifyEvent } from "./qualifyEvent";
import { getCommunityById } from "../communities/utils/getCommunityById";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import slugify from "slugify";
import { localCache, remoteDatabaseCache } from "../cache/cachemanager";

export const fetchIcsFeed = async (
  query: VevgIcsQuery
): Promise<VevgProperIcsEvent[] | null> => {
  const baseUrl =
    "https://www.vevg-karlsburg.de/abfallkalender/ical_rest_get_utf8.php";

  // build ical params based on vevgWasteCategories
  const icalParams = vevgWasteCategories.map((category) => {
    return {
      key: category.cal,
      value: "1".toString(),
    };
  });

  // build location params
  const locationParams = [
    {
      key: "ical_ort",
      value: query.village.toString(),
    },
    {
      key: "ical_kreis",
      value: query.districtIdentifier,
    },
    {
      key: "gesendet",
      value: "Termine herunterladen",
    },
  ];

  // build time params
  var now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const year = nextMonth.getFullYear();
  const month = nextMonth.getMonth();
  const timeParams = [
    {
      key: "ical_monat",
      value: month.toString(),
    },
    {
      key: "ical_year",
      value: year.toString(),
    },
  ];

  // combine all params
  const params = [...icalParams, ...locationParams, ...timeParams];

  // build url by URI api
  const url = new URL(baseUrl);

  // add all parals as search params
  params.forEach((param) => {
    url.searchParams.append(param.key, param.value);
  });

  // fetch ics feed
  try {
    let icsRawData: string | undefined | null = undefined;

    const ics: Response = await fetch(url, {
      cache: "force-cache",
    });

    if (ics.status !== 200 || ics.body === null) {
      console.info("Error fetching ics feed for url " + url + ", retrying...");
      // wait and retry one time
      await new Promise((f) => setTimeout(f, 1500)); // let the vevg website breath
      const ics: Response = await fetch(url, {
        cache: "force-cache",
      });

      if (ics.status !== 200 || ics.body === null) {
        console.error("Error fetching ics feed the second time for url " + url);
        throw new Error(
          "Error fetching ics feed the second time for url " + url
        );
      }

      console.debug(
        "ics feed fetched successfully after retry from url '" + url + "'"
      );

      icsRawData = await ics.text();
    }

    console.debug("ics feed fetched successfully from url '" + url + "'");
    icsRawData = await ics.text();

    if (!icsRawData) throw new Error("No ics data found for url " + url);

    // get community by id
    const vevgCommunity = await getCommunityById(query.village);

    if (!vevgCommunity)
      throw new Error("No community found for id " + query.village);

    // initialize properEvents
    const properEvents: VevgProperIcsEvent[] = [];

    // process ics data
    const rawEvents: any = ical.sync.parseICS(icsRawData);

    // process all events in ics feed
    for (const event of Object.values(rawEvents)) {
      if ((event as VevgRawIcsEvent).type === "VEVENT") {
        const properEvent: VevgProperIcsEvent = qualifyEvent(
          event as VevgRawIcsEvent,
          vevgCommunity as VevgCommunity
        );
        properEvents.push(properEvent);
      }
    }

    // slow down orginal fetch to let the vevg website breath
    await new Promise((f) => setTimeout(f, 1500));

    return Promise.resolve(properEvents);
  } catch (error: any) {
    return Promise.reject(error.message);
  }
};

/**
 * Use a remote cache.
 */
export const fetchIcsFeedCached = async (
  query: VevgIcsQuery
): Promise<VevgProperIcsEvent[] | null> => {
  const cacheKeys: string[] = [
    "vevg",
    "fetch-ics-feed",
    query.village.toString(),
    query.districtIdentifier,
  ];
  const cacheKey: string = slugify(cacheKeys.join("-"));
  return remoteDatabaseCache.wrap(cacheKey, function () {
    console.debug(`[Cache] Fetch original data for ${cacheKey}.`);
    return fetchIcsFeed(query);
  });
};
