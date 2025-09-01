import { VevgProperIcsEvent } from "../../vevg.types";

export const sortEvents = (events: VevgProperIcsEvent[]) => {
  // sort events by start[0], start[1], start[2]
  return events.sort((a, b) => {
    const aStart = a.start;
    const bStart = b.start;
    if (aStart[0] < bStart[0]) {
      return -1;
    }
    if (aStart[0] > bStart[0]) {
      return 1;
    }
    if (aStart[1] < bStart[1]) {
      return -1;
    }
    if (aStart[1] > bStart[1]) {
      return 1;
    }
    if (aStart[2] < bStart[2]) {
      return -1;
    }
    if (aStart[2] > bStart[2]) {
      return 1;
    }
    return 0;
  });
};
