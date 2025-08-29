export enum ApiEvents {
  post = "api.events.post",
  community = "api.events.community",
  scope = "api.events.community.scope",
  category = "api.events.community.scope.category",
  search = "api.events.search",
  add = "api.events.add",
  delete = "api.events.delete",
  "delete-by-id" = "api.events.delete.by-id",
  "delete-by-date" = "api.events.delete.by-date",
  bulk = "api.events.bulk",
  qualify = "api.events.qualify",
  "build-indexable-event" = "api.events.build-indexable-event",
  "build-indexable-event-time-data" = "api.events.build-indexable-event-time-data",
}

export enum ApiUpdate {
  calendar = "api.update.calendar",
  all = "api.update.calendars.all",
}

export enum ApiCategories {
  get = "api.categories.get",
}

export enum ApiLanguages {
  get = "api.languages.get",
}

export enum ApiSchema {
  get = "api.schema.get",
  create = "api.schema.create",
  delete = "api.schema.delete",
}
export enum ClientTranslation {
  config = "client.translation.config",
  translate = "client.translation.translate",
}

export enum ClientClassification {
  health = "client.classification.health",
  config = "client.classification.config",
  classify = "client.classification.classify",
  scopify = "client.classification.scopify",
  bytag = "client.classification.by-tag",
  bytext = "client.classification.by-text",
}

export enum ClientCalendar {
  config = "client.calendar.config",
  calendars = "client.calendar.calendars",
  events = "client.calendar.events",
  health = "client.calendar.health",
}

export enum ClientGeo {
  health = "client.geo.health",
  config = "client.geo.config",
  findbyaddress = "client.geocode.find-by-address",
  getcommunity = "client.geocode.get-community",
}

export enum ClientGoogleTasks {
  config = "client.googletasks.config",
  "add-event" = "client.googletasks.add-event-to-queue",
  "add-calendar" = "client.googletasks.add-calendar-to-queue",
}

export enum ClientTypesense {
  config = "client.typesense.config",
  "get-event" = "client.typesense.get-event",
  "create-event" = "client.typesense.create-event",
  "update-event" = "client.typesense.update-event",
  "delete-event" = "client.typesense.delete-event",
  "delete-events" = "client.typesense.delete-events",
  search = "client.typesense.search",
  "create-or-update-event" = "client.typesense.create-or-update-event",
  "retrieve-schema" = "client.typesense.retrieve-schema",
  "create-schema" = "client.typesense.create-schema",
  "delete-schema" = "client.typesense.delete-schema",
}

export enum DataTextMapper {
  unknownToData = "data-text-mapper.unknownToData",
}
