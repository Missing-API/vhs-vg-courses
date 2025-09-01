import { getCommunityListFromHtml } from "./utils/getCommunityListFromHtml";
import { optimizeCommunityList } from "./utils/optimizeCommunityList";
import { vevgRegions } from "../vevg.config";
import { VevgCommunity, VevgRegion } from "../vevg.types";
import { fetchHtmlCached } from "./utils/fetchHtml";
import { localCache } from "../cache/cachemanager";

export const getCommunityListFromSource = async (): Promise<
  VevgCommunity[]
> => {
  let vevgCommunityList: VevgCommunity[] = [];

  // get html using fetchHtml for all urls in VevgRegionalCalendarUrl with Promises
  const communities: any[] = await Promise.all(
    vevgRegions.map(async (vevgRegion: VevgRegion) => {
      const regionalCalendarHtml: string | null = await fetchHtmlCached(
        vevgRegion.url
      );
      if (!regionalCalendarHtml)
        throw new Error(`No html for ${vevgRegion.url}`);
      const communityList: VevgCommunity[] | null = getCommunityListFromHtml(
        regionalCalendarHtml,
        vevgRegion.identifier
      );
      if (!communityList)
        throw new Error(`No communityList for ${vevgRegion.url}`);
      vevgCommunityList.push(...communityList);
    })
  );

  // process optimization
  vevgCommunityList = optimizeCommunityList(vevgCommunityList);

  return vevgCommunityList;
};

/**
 * Use a cache.
 * @returns
 */
export const getCommunityList = async (): Promise<VevgCommunity[]> => {
  const cacheKey = "get-community-list";
  return localCache.wrap(cacheKey, function () {
    return getCommunityListFromSource();
  });
};
