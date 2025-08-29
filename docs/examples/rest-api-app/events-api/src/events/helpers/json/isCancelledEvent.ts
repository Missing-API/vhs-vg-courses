import { calendar_v3 } from "@googleapis/calendar";
import Schema$Event = calendar_v3.Schema$Event;

interface Property {
  key: string;
  value?: unknown;
}

const requiredProperties: Property[] = [
  { key: "id" },
  { key: "status", value: "cancelled" },
  { key: "updated" },
];

/**
 * Check if the input is a cancelled google event.
 * @param obj: any
 * @returns boolean
 */
export const isCancelledEvent = (json: object): boolean => {
  const failedChecks: string[] = [];
  const event: Schema$Event = json as Schema$Event;

  // check "json" if it contains all required properties
  requiredProperties.forEach((property: Property) => {
    if (!(property.key in (event as Schema$Event)))
      failedChecks.push(`${property.key} not existing`);
    if (
      property.value &&
      property.key in event &&
      (event as Schema$Event)[property.key as keyof Schema$Event] !==
        property.value
    )
      failedChecks.push(`${property.key} not matching ${property.value}`);
  });

  if (failedChecks.length > 0) return false;

  return true;
};
