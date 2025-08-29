export enum apiLoggerHealth {
  check = "api.health",
}

export enum apiLoggerOrganizers {
  config = "api.organizers.config",
  organizers = "api.organizers.get-all",
}

export enum apiLoggerCalendars {
  config = "api.calendars.config",
  calendar = "api.calendars.get",
  calendars = "api.calendars.get-all",
  events = "api.calendars.get-events",
}

export enum clientLoggerMateo {
  config = "client.mateo.config",
  contact = "client.mateo.get.contact",
  contacts = "client.mateo.get.contacts",
  "contacts.page" = "client.mateo.get.contacts-page",
}

export enum clientLoggerGoogle {
  config = "client.google.config",
  "events.get" = "client.google.get.events",
  "events.fetch" = "client.google.fetch.events",
  "events.helper.update-min" = "client.google.helper.update-min",
}
