import { getCommunityById } from "../../../../src/communities/utils/getCommunityById";
import { VevgCommunity } from "../../../../src/vevg.types";

export const maxDuration = 30;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const vevgCommunityId: string = params.id as string;

  const vevgCommunity: VevgCommunity | undefined | null =
    await getCommunityById(parseInt(vevgCommunityId));

  return Response.json({ community: { ...vevgCommunity } });
}
