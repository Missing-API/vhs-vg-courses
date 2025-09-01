import { vevgCommunityOverwrite } from "../../vevg.config";
import { VevgCommunity } from "../../vevg.types";

export const optimizeCommunityList = (
  vevgCommunityList: VevgCommunity[]
): VevgCommunity[] => {
  // check vevgCommunityOverwrite for matches by name, regionIdentifier and districtIdentifier
  for (var communityToCheck of vevgCommunityList) {
    const overwrite: any = vevgCommunityOverwrite.find((overwrite: any) => {
      return (
        overwrite.name === communityToCheck.name &&
        overwrite.regionIdentifier === communityToCheck.regionIdentifier &&
        overwrite.districtIdentifier === communityToCheck.districtIdentifier
      );
    });

    // re-define name
    if (overwrite && overwrite.overwriteName)
      communityToCheck.name = overwrite.overwriteName;

    // set base location to name
    communityToCheck.location = communityToCheck.name;

    // add location qualifier to location
    if (overwrite && overwrite.locationQualifier)
      communityToCheck.location += ", " + overwrite.locationQualifier;

    // add county, state and country to make location string globally unique
    communityToCheck.location +=
      ", Vorpommern-Greifswald, Mecklenburg-Vorpommern, Deutschland";
  }

  // sort by name
  vevgCommunityList.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (b.name < a.name) return 1;
    return 0;
  });

  return vevgCommunityList;
};
