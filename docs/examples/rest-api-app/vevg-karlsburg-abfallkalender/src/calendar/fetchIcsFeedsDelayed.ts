import { VevgIcsQuery, VevgProperIcsEvent } from "../vevg.types";
import { fetchIcsFeedCached } from "./fetchIcsFeed";
import { sortEvents } from "./utils/sortEvents";

export const fetchIcsFeedsDelayed = async (
  queries: VevgIcsQuery[],
  chunkSize: number = 50
): Promise<VevgProperIcsEvent[] | null> => {
  // split up queries in chunks by chunkSize
  const queryChunks: VevgIcsQuery[][] = [];
  for (let i = 0; i < queries.length; i += chunkSize) {
    queryChunks.push(queries.slice(i, i + chunkSize));
  }

  const allEventsFromIcsData: VevgProperIcsEvent[] = [];

  // iterate over queryChunks
  for (const queryChunk of queryChunks) {
    // iterate over all queries of the chunk using Promise.All
    const chunkData: number[] = await Promise.all(
      queryChunk.map(async (query: VevgIcsQuery) => {
        const eventsFromIcsData: VevgProperIcsEvent[] =
          (await fetchIcsFeedCached(query)) || [];
        // push all events to allEventsFromIcsData
        allEventsFromIcsData.push(...eventsFromIcsData);
        return eventsFromIcsData.length;
      })
    );
    await new Promise((f) => setTimeout(f, 100)); // let the vevg website breath
  }

  // sort
  return sortEvents(allEventsFromIcsData);
};
