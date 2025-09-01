import { getCommunityList } from "../../../src/communities/getCommunityList";
import { VevgCommunity } from "../../../src/vevg.types";

export const maxDuration = 30;

export async function GET() {
  let vevgCommunityList: VevgCommunity[] = await getCommunityList();
  return Response.json({
    results: vevgCommunityList.length,
    communities: vevgCommunityList,
  });
}
