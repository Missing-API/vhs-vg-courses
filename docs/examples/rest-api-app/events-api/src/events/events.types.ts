import { calendar_v3 } from "@googleapis/calendar";
import { TextWithData } from "../../packages/data-text-mapper/src";

import Schema$Event = calendar_v3.Schema$Event;

export type PostEventRequestBody = Schema$Event;

export type EventContentWithMetadata = TextWithData;
