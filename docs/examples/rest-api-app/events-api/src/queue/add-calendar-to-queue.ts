import { CalendarQueueTask } from "./queue.types";
import { getLogger } from "@/src/logging/logger";
import { ClientGoogleTasks } from "@/src/logging/loggerApps.config";
import {
  CalendarEventsQuery,
  CalendarEventsQuerySchema,
} from "../clients/calendar-api/types/calendar-events-query.types";
import { getCalendarEventsQuery } from "../clients/calendar-api/helpers/calendar-events-query";
import { getGoogleAuthToken } from "./helpers/get-google-auth-token";

/**
 * Adds a new task to a Google Cloud Tasks queue using direct HTTP API.
 */
export async function addCalendarToQueue(
  query: CalendarEventsQuery
): Promise<CalendarQueueTask> {
  const log = getLogger(ClientGoogleTasks["add-calendar"]);

  try {
    CalendarEventsQuerySchema.parse(query);
  } catch (error) {
    log.error({ error }, "Error parsing calendar events query");
    throw new Error("Error parsing calendar events query");
  }

  // build task body by using a validated query
  const taskBody: CalendarEventsQuery = getCalendarEventsQuery(query);

  // define constants by env vars
  const projectId: string = process.env.GOOGLEAPI_PROJECT_ID!;
  const location: string = process.env.GOOGLEAPI_LOCATION!;
  const queue: string = process.env.GOOGLEAPI_TASKS_CALENDARS_QUEUE_NAME!;
  const targetUrl: string = new URL(
    "/api/update/calendars/single",
    process.env.SVF_EVENTSAPI_URL
  ).toString();

  // Create the base64 encoded payload
  const base64Body = Buffer.from(JSON.stringify(taskBody)).toString("base64");

  // Build the task object for the API
  const task = {
    httpRequest: {
      httpMethod: "POST",
      url: targetUrl,
      headers: {
        "Content-Type": "application/json",
        "Sheep-Token": process.env.WRITE_ACCESS_TOKENS,
      },
      body: base64Body,
    },
  };

  // Google Cloud Tasks API endpoint
  const apiUrl = `https://cloudtasks.googleapis.com/v2/projects/${projectId}/locations/${location}/queues/${queue}/tasks`;

  try {
    // Get a Google Auth token for the API request
    const accessToken = await getGoogleAuthToken();

    // Make the API request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create task: ${response.status} ${errorData}`);
    }

    const responseData = await response.json();

    // Extract the task ID from the name field (same format as before)
    const queueTaskId = responseData.name.split("/").slice(-3).join("/");

    const createTaskResult: CalendarQueueTask = {
      queueTaskId: queueTaskId,
      calendarID: query.id,
    };

    log.info("Task created", createTaskResult);
    return createTaskResult;
  } catch (error) {
    log.error("Error creating task:", error);
    throw error;
  }
}
