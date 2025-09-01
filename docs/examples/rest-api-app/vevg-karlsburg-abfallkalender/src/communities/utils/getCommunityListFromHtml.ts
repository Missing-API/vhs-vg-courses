import { vevgRegions } from "../../vevg.config";
import { VevgCommunity, VevgRegion } from "../../vevg.types";
import * as cheerio from "cheerio";

export const getCommunityListFromHtml = (
  html: string,
  regionIdentifier: string
): VevgCommunity[] | null => {
  const $ = cheerio.load(html);

  const communityList: VevgCommunity[] = [];

  // get value from all option tags within select tag at "#abfallkalender > form > select" using cheerio
  const values: any = $("#abfallkalender > form > select > option")
    .map((i, el) => {
      // split value like "721#Wrangelsburg#G#" by "#" and return first part as id and second part as name
      const value = $(el).val() as string;
      if (!value) return null;
      const split = value.split("#");
      if (split.length < 2) return null;
      // get districtName from vevgRegions by regionIdentifier and districtIdentifier
      const districtName: string =
        vevgRegions
          .find((vevgRegion: VevgRegion) => {
            return vevgRegion.identifier === regionIdentifier;
          })
          ?.districts.find((district: any) => {
            return district.identifier === split[2];
          })?.name || "undefined";
      const districtIdentifier: string = split[2];
      const newItem: VevgCommunity = {
        name: split[1],
        regionIdentifier: regionIdentifier,
        districtIdentifier:
          !parseInt(districtIdentifier) && districtIdentifier.length > 0
            ? districtIdentifier
            : undefined,
        districtName: districtName || undefined,
        id: parseInt(split[0]),
      };
      communityList.push(newItem);
    })
    .get();

  return communityList;
};
