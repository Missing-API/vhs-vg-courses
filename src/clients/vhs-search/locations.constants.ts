export type StaticLocation = {
  id: "anklam" | "greifswald" | "pasewalk";
  name: string;
  address: string;
  phone?: string;
  email?: string;
};

export const STATIC_LOCATIONS = {
  anklam: {
    id: "anklam",
    name: "Anklam",
    address: "Markt 7 (Lilienthal-Center), 17389 Anklam",
    email: "vhs-anklam@kreis-vg.de",
  },
  greifswald: {
    id: "greifswald",
    name: "Greifswald",
    address: "Martin-Luther-Straße 7a, 17489 Greifswald",
    email: "vhs-zentrale@kreis-vg.de",
  },
  pasewalk: {
    id: "pasewalk",
    name: "Pasewalk",
    address: "Gemeindewiesenweg 8, 17309 Pasewalk",
    email: "vhs-pasewalk@kreis-vg.de",
  },
} as const satisfies Record<string, StaticLocation>;

export const STATIC_LOCATION_LIST = [
  STATIC_LOCATIONS.anklam,
  STATIC_LOCATIONS.greifswald,
  STATIC_LOCATIONS.pasewalk,
] as const;