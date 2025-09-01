export interface VevgDistrict {
  identifier: string;
  name: string;
}

export interface VevgRegion {
  identifier: string;
  name: string;
  url: string;
  districts: VevgDistrict[];
}

export interface VevgCommunity {
  name: string;
  regionIdentifier: string;
  districtIdentifier?: string;
  districtName?: string;
  hasDuplicate?: boolean;
  location?: string;
  id: number;
}

export interface VevgCommunityOverwrite
  extends Pick<
    VevgCommunity,
    "name" | "regionIdentifier" | "districtIdentifier"
  > {
  overwriteName?: string;
  locationQualifier?: string;
}

export type VevgWasteType =
  | "restmuell"
  | "altpapier"
  | "gelbersack"
  | "schadstoffe"
  | "weihnachtsbaeume"
  | "other";

export interface VevgWasteCategory {
  name: string;
  cal: string;
}

export interface VevgWasteTypeDescription {
  name: string;
  type: VevgWasteType;
  tags: string[];
  swords: string[];
  scope: string;
}
export interface VevgIcsQuery {
  village: number;
  districtIdentifier: string;
}

export interface VevgRawIcsEvent {
  type: string;
  params: [];
  uid: string;
  location: string;
  summary: string;
  description: string;
  class: string;
  start: string;
  datetype: string;
  end: string;
  dtstamp: string;
}

export interface VevgOrganizer {
  name: string;
  email: string;
}
export interface VevgProperIcsEvent {
  uid: string;
  title: string;
  description: string;
  htmlContent?: string;
  location: string;
  start: number[];
  startInputType: "local";
  end: number[];
  endInputType: "local";
  categories?: string[];
  url?: string;
  calName: string;
  organizer?: VevgOrganizer;
  productId: string;
  method: string;
}
