import {
  VevgCommunityOverwrite,
  VevgOrganizer,
  VevgRegion,
  VevgWasteCategory,
  VevgWasteTypeDescription,
} from "./vevg.types";

export const vevgOrganizer: VevgOrganizer = {
  name: "VEVG Karlsburg",
  email: "info@vevg-karlsburg.de",
};

/**
 * Define waste categories to query the api.
 */
export const vevgWasteCategories: VevgWasteCategory[] = [
  {
    name: "Restmüll 14-täglich",
    cal: "ical_1",
  },
  {
    name: "Restmüll wöchentlich",
    cal: "ical_11",
  },
  {
    name: "Gelber Sack 14-täglich",
    cal: "ical_2",
  },
  {
    name: "Gelber Sack wöchentlich",
    cal: "ical_12",
  },
  {
    name: "Papiertonne (EGVG mbH)",
    cal: "ical_3",
  },
  {
    name: "Papiertonne (Veolia/Alba)",
    cal: "ical_4",
  },
  {
    name: "Schadstoffsammlung",
    cal: "ical_5",
  },
  {
    name: "Weihnachtsbäume",
    cal: "ical_6", // TODO: check if this is correct
  },
];

/**
 * Define waste type descriptions to use in the frontend.
 */
export const vevgWasteTypeDescriptions: VevgWasteTypeDescription[] = [
  {
    name: "Restmüll",
    type: "restmuell",
    tags: ["Entsorgung", "Restmüll"],
    swords: ["Restmülltonne"],
    scope: "Ort",
  },
  {
    name: "Gelber Sack",
    type: "gelbersack",
    tags: ["Entsorgung", "Gelber-Sack"],
    swords: ["gelben", "Säcke"],
    scope: "Ort",
  },
  {
    name: "Altpapier (EGVG mbH)",
    type: "altpapier",
    tags: ["Entsorgung", "Altpapier", "Papiertonne"],
    swords: ["Papiertonne", "EGVG mbH"],
    scope: "Ort",
  },
  {
    name: "Altpapier (Veolia)",
    type: "altpapier",
    tags: ["Entsorgung", "Altpapier", "Papiertonne"],
    swords: ["Papiertonne", "Veolia"],
    scope: "Ort",
  },
  {
    name: "Altpapier (Alba)",
    type: "altpapier",
    tags: ["Entsorgung", "Altpapier", "Papiertonne"],
    swords: ["Papiertonne", "Alba"],
    scope: "Ort",
  },
  {
    name: "Altpapier (Smiton)",
    type: "altpapier",
    tags: ["Entsorgung", "Altpapier", "Papiertonne"],
    swords: ["Papiertonne", "Smiton"],
    scope: "Ort",
  },
  {
    name: "Mobile Schadstoffsammlung",
    type: "schadstoffe",
    tags: ["Entsorgung", "Schadstoffe"],
    swords: ["Schadstoffsammlung"],
    scope: "Umgebung",
  },
  {
    name: "Weihnachtsbäume",
    type: "weihnachtsbaeume",
    tags: ["Entsorgung", "Weihnachtsbäume"],
    swords: ["Weihnachtsbäume"],
    scope: "Ort",
  },
];

/**
 * Extends the VEVG regions given with an identifier by a meaningful name for the region and the districts.
 */
export const vevgRegions: VevgRegion[] = [
  {
    identifier: "OVP",
    name: "Anklam, Wolgast, Greifswald-Land",
    url: "https://www.vevg-karlsburg.de/online-abfallkalender-ovp.html",
    districts: [
      {
        identifier: "A",
        name: "Anklam-Land",
      },
      {
        identifier: "W",
        name: "Wolgast/Usedom",
      },
      {
        identifier: "G",
        name: "Greifswald-Land",
      },
    ],
  },
  {
    identifier: "JTPL",
    name: "Jarmen-Tutow, Peenetal/Loitz",
    url: "https://www.vevg-karlsburg.de/online-abfallkalender-jtpl.html",
    districts: [
      {
        identifier: "L",
        name: "Jarmen-Tutow, Peenetal/Loitz",
      },
    ],
  },
  //   {
  //     identifier: "UHGW",
  //     char: "UHGW",
  //     orgName: "Stadt Greifswald",
  //     url: "https://www.vevg-karlsburg.de/online-abfallkalender-uhgw.html",
  //   },
  {
    identifier: "UER",
    name: "Uecker-Randow",
    url: "https://www.vevg-karlsburg.de/online-abfallkalender-uer.html",
    districts: [
      {
        identifier: "U",
        name: "Uecker-Randow",
      },
    ],
  },
];

/**
 * Defines overwrites for non-uniquely named communities to be better processes by geocoding.
 */
export const vevgCommunityOverwrite: VevgCommunityOverwrite[] = [
  {
    name: "Ahlbeck",
    regionIdentifier: "OVP",
    districtIdentifier: "W",
    overwriteName: "Seebad Ahlbeck",
    locationQualifier: "Heringsdorf",
  },
  {
    name: "Görke",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "Postlow",
  },
  {
    name: "Görke",
    regionIdentifier: "OVP",
    districtIdentifier: "W",
    locationQualifier: "Dargen",
  },
  {
    name: "Hohenfelde",
    regionIdentifier: "OVP",
    districtIdentifier: "W",
    locationQualifier: "Wolgast",
  },
  {
    name: "Hohenfelde",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "Ramin",
  },
  {
    name: "Karlsburg",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "Strasburg",
  },
  {
    name: "Liepe",
    regionIdentifier: "OVP",
    districtIdentifier: "W",
    locationQualifier: "Rankwitz",
  },
  {
    name: "Liepe",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "ammer an der Uecker",
  },
  {
    name: "Marienfelde",
    regionIdentifier: "JTPL",
    districtIdentifier: "L",
    locationQualifier: "Kruckow",
  },
  {
    name: "Marienfelde",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "Strasburg",
  },
  {
    name: "Marienthal",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "Rathebur",
  },
  {
    name: "Marienthal",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "Viereck",
  },
  {
    name: "Müggenburg",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "Neuenkirchen",
  },
  {
    name: "Müggenburg",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "Torgelow",
  },
  {
    name: "Neuendorf",
    regionIdentifier: "OVP",
    districtIdentifier: "W",
    locationQualifier: "Lütow",
  },
  {
    name: "Neuendorf",
    regionIdentifier: "OVP",
    districtIdentifier: "G",
    locationQualifier: "Kemnitz",
  },
  {
    name: "Neuenkirchen",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "bei Anklam",
  },
  {
    name: "Neuenkirchen",
    regionIdentifier: "OVP",
    districtIdentifier: "G",
    locationQualifier: "bei Greifswald",
  },
  {
    name: "Neuhof",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "Stolpe an der Peene",
  },
  {
    name: "Neuhof",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "Penkun",
  },
  {
    name: "Papendorf",
    regionIdentifier: "OVP",
    districtIdentifier: "W",
    locationQualifier: "Pulow",
  },
  {
    name: "Papendorf",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "bei Pasewalk",
  },
  {
    name: "Rubenow",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "Boldekow",
  },
  {
    name: "Rubenow",
    regionIdentifier: "OVP",
    districtIdentifier: "G",
    locationQualifier: "bei Lubmin",
  },
  {
    name: "Schmarsow",
    regionIdentifier: "JTPL",
    districtIdentifier: "L",
    locationQualifier: "Kruckow",
  },
  {
    name: "Schmarsow",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "Rollwitz",
  },
  {
    name: "Sophienhof",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "Löwitz",
  },
  {
    name: "Sophienhof",
    regionIdentifier: "JTPL",
    districtIdentifier: "L",
    locationQualifier: "Loitz",
  },
  {
    name: "Stolpe",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    overwriteName: "Stolpe an der Peene",
  },
  {
    name: "Stolpe",
    regionIdentifier: "OVP",
    districtIdentifier: "W",
    locationQualifier: "Stolpe auf Usedom",
  },
  {
    name: "Thurow",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "Medow",
  },
  {
    name: "Thurow",
    regionIdentifier: "OVP",
    districtIdentifier: "G",
    locationQualifier: "Züssow",
  },
  {
    name: "Vierow",
    regionIdentifier: "OVP",
    districtIdentifier: "G",
    locationQualifier: "Brünzow",
  },
  {
    name: "Vierow",
    regionIdentifier: "JTPL",
    districtIdentifier: "L",
    locationQualifier: "Sassen-Trantow",
  },
  {
    name: "Wilhelmshof",
    regionIdentifier: "OVP",
    districtIdentifier: "W",
    locationQualifier: "Usedom",
  },
  {
    name: "Wilhelmshof",
    regionIdentifier: "UER",
    districtIdentifier: "U",
    locationQualifier: "Plöwen",
  },
  {
    name: "Zarrentin",
    regionIdentifier: "OVP",
    districtIdentifier: "A",
    locationQualifier: "Rubkow",
  },
  {
    name: "Zarrentin",
    regionIdentifier: "JTPL",
    districtIdentifier: "L",
    locationQualifier: "Sassen-Trantow",
  },
];
