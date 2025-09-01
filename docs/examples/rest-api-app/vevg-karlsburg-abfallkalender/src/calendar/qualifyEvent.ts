import {
  TextWithData,
  dataToText,
} from "@schafevormfenster/data-text-mapper/dist";
import { vevgOrganizer, vevgRegions } from "../vevg.config";
import {
  VevgCommunity,
  VevgProperIcsEvent,
  VevgRawIcsEvent,
  VevgWasteTypeDescription,
} from "../vevg.types";
import { getWasteTypeDescription } from "./utils/getWasteTypeDescription";

export const qualifyEvent = (
  rawIcsEvent: VevgRawIcsEvent,
  community: VevgCommunity
): VevgProperIcsEvent => {
  // get date from raw event
  const tmpStartDate = new Date(rawIcsEvent.start);
  let tmpEndDate = new Date(rawIcsEvent.end);
  if (!tmpEndDate.getFullYear()) {
    tmpEndDate = new Date(rawIcsEvent.start);
    tmpEndDate.setMinutes(tmpEndDate.getMinutes() + 30);
  }

  // calculate detail link
  const baseUrl: string =
    vevgRegions.find((region) => {
      return region.identifier === community.regionIdentifier;
    })?.url || "";
  const detailLink = new URL(baseUrl);
  detailLink.searchParams.append("part", "5");
  detailLink.searchParams.append("param", "K");
  detailLink.searchParams.append("anz", "2");
  detailLink.searchParams.append("key", community.id.toString());

  // build URL params by URI object
  const urlParams: URLSearchParams = new URLSearchParams({});

  const matchingWasteTypeDescription: VevgWasteTypeDescription =
    getWasteTypeDescription(rawIcsEvent.summary) as VevgWasteTypeDescription;

  const descriptionData: TextWithData = {
    description: rawIcsEvent.summary,
    categories: ["Entsorgung"],
    scopes: [matchingWasteTypeDescription.scope || "Ort"],
    tags: matchingWasteTypeDescription.tags || ["Entsorgung"],
    url: detailLink.toString(),
  };

  const properEvent: VevgProperIcsEvent = {
    uid: rawIcsEvent.uid,
    title: matchingWasteTypeDescription.name || rawIcsEvent.summary,
    description: dataToText(descriptionData),
    location: community.location || community.name,
    start: [
      tmpStartDate.getFullYear(),
      tmpStartDate.getMonth() + 1,
      tmpStartDate.getDate(),
      tmpStartDate.getHours(),
      tmpStartDate.getMinutes(),
    ],
    startInputType: "local",
    end: [
      tmpEndDate.getFullYear(),
      tmpEndDate.getMonth() + 1,
      tmpEndDate.getDate(),
      tmpEndDate.getHours(),
      tmpEndDate.getMinutes(),
    ],
    endInputType: "local",
    categories: matchingWasteTypeDescription.tags || ["Entsorgung"],
    url: detailLink.toString(),
    organizer: vevgOrganizer,
    calName:
      "Abfallkalender der VEVG mbH (Ver- und Entsorgungsgesellschaft des Landkreises Vorpommern-Greifswald mbH)",
    productId:
      "Abfallkalender der VEVG mbH (Ver- und Entsorgungsgesellschaft des Landkreises Vorpommern-Greifswald mbH)",
    method: "PUBLISH",
    // updated: rawIcsEvent.dtstamp, // TODO: use lastUpdated
    // htmlContent: dataToHtml(descriptionData), // skip to reduce response size
  };
  return properEvent;
};
