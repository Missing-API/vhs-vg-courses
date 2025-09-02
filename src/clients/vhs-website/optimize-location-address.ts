/**
 * Optimize raw location strings into standardized, mappable postal addresses.
 * - Uses ordered regex/predicate rules
 * - Case-insensitive, tolerant to punctuation/spacing
 * - Returns empty string when no rule matches
 *
 * Examples:
 *  - "Raum 1 - VHS Anklam, Markt 7" -> "Volkshochschule Vorpommern-Greifswald, Markt 7, 17389 Anklam"
 *  - "VHS in Anklam, Saal Demminer Str. 15" -> "Volkshochschule Vorpommern-Greifswald, Demminer Str. 15, 17389 Anklam"
 *  - "VHS in Pasewalk, Raum 107" -> "Volkshochschule Vorpommern-Greifswald, Gemeindewiesenweg 8, 17309 Pasewalk"
 *  - "Runge-Gymnasium Wolgast" -> "Runge-Gymnasium, Schulstraße 1, 17438 Wolgast"
 */

export type LocationContext = {
  locationId?: string; // e.g. "anklam" | "pasewalk" | "greifswald"
};

function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

// Constants
const VHS_NAME = "Volkshochschule Vorpommern-Greifswald";

const ADDR = {
  anklam_markt: `${VHS_NAME}, Markt 7, 17389 Anklam`,
  anklam_demminer: `${VHS_NAME}, Demminer Str. 15, 17389 Anklam`,
  pasewalk_vhs: `${VHS_NAME}, Gemeindewiesenweg 8, 17309 Pasewalk`,
  greifswald_vhs: `${VHS_NAME}, Martin-Luther-Str. 7a, 17489 Greifswald`,

  wolgast_runge: `Runge-Gymnasium, Schulstraße 1, 17438 Wolgast`,
  zinnowitz_otto: `Turnhalle, St. Otto Zinnowitz, Dr.-Wachsmann-Str. 29, 17454 Zinnowitz`,
  loecknitz_edpg: `Europaschule Deutsch - Polnisches Gymnasium, Friedrich-Engels-Straße 5-6, 17321 Löcknitz`,
  pasewalk_erholung: `Kleingartenverein Erholung e.V., 17309 Pasewalk`,
  meiersberg_multiples: `Multiples Haus Meiersberg, Dorfstraße 21 a, 17375 Meiersberg`,
  torgelow_schleuse: `Haus an der Schleuse, Schleusenstraße 5b, 17358 Torgelow`,
  ueckermuende_gym: `Gymnastikhalle, Regionale Schule "Ehm Welk", Goethestraße 3, 17373 Ueckermünde`,
  ferdinandshof_alte_schule: `"Alte Schule" Ferdinandshof, Schulstraße 4, 17379 Ferdinandshof`,
  grambin_dojo: `Higashi Dojo, Dorfstraße 65, 17375 Grambin`,
  greifswald_alte_feuerwehr: `Alte Feuerwehr, Baderstraße 23, 17489 Greifswald`,
};

type Rule = {
  name: string;
  test: (raw: string, n: string, ctx?: LocationContext) => boolean;
  out: (raw: string) => string;
};

/**
 * Ordered rules. Place more specific rules before generic VHS mappings.
 */
const RULES: Rule[] = [
  // Specific venues
  {
    name: "Runge-Gymnasium Wolgast",
    test: (_raw, n) => /runge/.test(n) && /wolgast/.test(n),
    out: () => ADDR.wolgast_runge,
  },
  {
    name: "Turnhalle St. Otto (Zinnowitz)",
    test: (_raw, n) => /st\.?\s*otto/.test(n) || /otto\s+zinnowitz/.test(n),
    out: () => ADDR.zinnowitz_otto,
  },
  {
    name: "EDPG Löcknitz",
    test: (_raw, n) => /edpg/.test(n) && /(loecknitz|löcknitz|locknitz)/.test(n),
    out: () => ADDR.loecknitz_edpg,
  },
  {
    name: "Gartenanlage Erholung Pasewalk",
    test: (_raw, n) => /(erholung|\"erholung\")/.test(n) && /pasewalk/.test(n),
    out: () => ADDR.pasewalk_erholung,
  },
  {
    name: "Multiples Haus Meiersberg",
    test: (_raw, n) => /multiples?\s+haus\s+meiersberg/.test(n),
    out: () => ADDR.meiersberg_multiples,
  },
  {
    name: "Haus an der Schleuse Torgelow",
    test: (_raw, n) => /haus\s+an\s+der\s+schleuse/.test(n) && /torgelow/.test(n),
    out: () => ADDR.torgelow_schleuse,
  },
  {
    name: "Ueckermünde Regionalschule Gymnastikhalle",
    test: (_raw, n) =>
      /(ueckermuende|ueckermünde|üeckermünde|ueckermunde)/.test(n) &&
      /(regionalschule|regionale\s+schule)/.test(n) &&
      /gymnastikhalle/.test(n),
    out: () => ADDR.ueckermuende_gym,
  },
  {
    name: "Ferdinandshof Alte Schule",
    test: (_raw, n) => /ferdinandshof/.test(n) && /alte\s+schule/.test(n),
    out: () => ADDR.ferdinandshof_alte_schule,
  },
  {
    name: "Grambin Dojo",
    test: (_raw, n) =>
      /grambin/.test(n) && /dorf(strasse|straße|str\.)/.test(n) && /\b65\b/.test(n),
    out: () => ADDR.grambin_dojo,
  },
  {
    name: "Greifswald Alte Feuerwehr",
    test: (_raw, n) =>
      /(alte\s+feuerwehr|gemeinschaftsraum\s+\"?alte\s+feuerwehr\"?)/.test(n) &&
      /greifswald/.test(n),
    out: () => ADDR.greifswald_alte_feuerwehr,
  },

  // VHS Anklam specific address patterns
  {
    name: "VHS Anklam Markt 7",
    test: (_raw, n) => /vhs.*anklam/.test(n) && /markt\s*7/.test(n),
    out: () => ADDR.anklam_markt,
  },
  {
    name: "VHS Anklam Demminer Str. 15",
    test: (_raw, n) =>
      /(vhs\s+in\s+anklam|vhs.*anklam)/.test(n) &&
      /(demminer\s*str\.?\s*15|saal\s+demminer\s*str\.?\s*15)/.test(n),
    out: () => ADDR.anklam_demminer,
  },

  // VHS Pasewalk/Greifswald
  {
    name: "VHS Pasewalk",
    test: (_raw, n) => /vhs/.test(n) && /pasewalk/.test(n),
    out: () => ADDR.pasewalk_vhs,
  },
  {
    name: "VHS Greifswald",
    test: (_raw, n) => /vhs/.test(n) && /greifswald/.test(n),
    out: () => ADDR.greifswald_vhs,
  },

  // Contextual fallback: if text includes generic VHS and a known context location
  {
    name: "Contextual VHS fallback",
    test: (_raw, n, ctx) => /vhs/.test(n) && !!ctx?.locationId,
    out: (_raw) => "", // computed in handler below
  },
];

/**
 * Returns optimized postal address for Google Maps, or empty string if no match.
 */
export function optimizeLocationAddress(raw: string, ctx?: LocationContext): string {
  const n = norm(raw);

  for (const rule of RULES) {
    if (rule.test(raw, n, ctx)) {
      if (rule.name === "Contextual VHS fallback") {
        // Map by known location id when only "VHS" is present without city
        const id = (ctx?.locationId || "").toLowerCase();
        if (id === "anklam") return ADDR.anklam_markt;
        if (id === "pasewalk") return ADDR.pasewalk_vhs;
        if (id === "greifswald") return ADDR.greifswald_vhs;
        // Unknown context -> no mapping
        return "";
      }
      return rule.out(raw);
    }
  }

  return "";
}