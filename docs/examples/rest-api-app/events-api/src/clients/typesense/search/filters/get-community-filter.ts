import {
  GeonameId,
  GeonameIdSchema,
} from "../../../../events/types/geonames.types";

export const getCommunityFilter = (communityId: GeonameId): string => {
  const parseResult = GeonameIdSchema.safeParse(communityId);
  if (!parseResult.success) {
    throw new Error(
      `Invalid GeonameId format for community filter: ${communityId}`
    );
  }
  return `community.id:${parseResult.data}`;
};
