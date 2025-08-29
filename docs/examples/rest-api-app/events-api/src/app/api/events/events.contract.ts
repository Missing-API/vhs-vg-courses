import { initContract } from "@ts-rest/core";
import { AddEventsToQueueContract } from "./bulk/add-events-to-queue.contract";
import { AddEventContract } from "./add-event.contract";
import { SingleEventContract } from "./[id]/single-event.contract";
import { DeleteEventContract } from "./delete-event.contract";
import { SearchEventsByCommunityContract } from "./search/[community]/search-events-by-community.contract";
import { SearchEventsByCommunityScopeContract } from "./search/[community]/[scope]/search-events-by-community-scope.contract";
import { SearchEventsByCommunityScopeCategoryContract } from "./search/[community]/[scope]/[category]/search-events-by-community-scope-category.contract";

const c = initContract();

export const AddOrDeleteEventsContract = c.router({
  ...AddEventContract,
  ...DeleteEventContract,
});

export const EventsContract = c.router({
  ...SingleEventContract,
  ...AddEventsToQueueContract,
  ...AddEventContract,
  ...DeleteEventContract,
  ...SearchEventsByCommunityContract,
  ...SearchEventsByCommunityScopeContract,
  ...SearchEventsByCommunityScopeCategoryContract,
});
