import { vevgWasteTypeDescriptions } from "../../vevg.config";
import {
  VevgProperIcsEvent,
  VevgWasteType,
  VevgWasteTypeDescription,
} from "../../vevg.types";

export const filterEventsByWasteType = (
  events: VevgProperIcsEvent[],
  wasteType: VevgWasteType | null = null
): VevgProperIcsEvent[] => {
  if (!wasteType) {
    return events;
  }

  // get vevgWasteTypeDescription to use to filter by wasteType matching type
  const vevgWasteTypeDescription: VevgWasteTypeDescription | undefined =
    vevgWasteTypeDescriptions.find((wasteTypeDescription) => {
      return wasteTypeDescription.type === wasteType;
    });

  // filter by wasteType using "vevgWasteTypeDescription.tags" matching "event.categories"

  const eventsFiltered = events.filter((event) => {
    if (vevgWasteTypeDescription) {
      return event.categories?.every((category) =>
        vevgWasteTypeDescription.tags.includes(category)
      );
    }
    return false;
  });

  return eventsFiltered;
};
