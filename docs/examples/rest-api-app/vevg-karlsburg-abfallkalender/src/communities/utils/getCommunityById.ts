import { VevgCommunity } from "../../vevg.types";
import { getCommunityList } from "../getCommunityList";

export const getCommunityById = async (
  id: number
): Promise<VevgCommunity | null> => {
  let vevgCommunityList: VevgCommunity[] = await getCommunityList();

  // filter for matching id

  const vevgCommunity: VevgCommunity | undefined = vevgCommunityList.find(
    (vevgCommunity: VevgCommunity) => {
      return vevgCommunity.id === id;
    }
  );

  if (!vevgCommunity)
    return Promise.reject(new Error(`No community found for id ${id}`));

  return Promise.resolve(vevgCommunity);
};
