interface ScopeSynonyms {
  community: string[];
  nearby: string[];
  region: string[];
  municipality: string[];
  county: string[];
  state: string[];
  country: string[];
  global: string[];
}

export const scopeSynonyms: ScopeSynonyms = {
  nearby: ["Umgebung", "Nähe"],
  community: ["Ort", "Dorf"],
  region: ["Region"],
  municipality: ["Gemeinde", "Kommune", "Stadt"],
  county: ["Landkreis", "Kreis"],
  state: ["Bundesland"],
  country: ["Land"],
  global: ["Weltweit"],
};

export const scopeSynonymsLowercase: ScopeSynonyms = {
  nearby: scopeSynonyms.nearby.map((s) => s.toLowerCase()),
  community: scopeSynonyms.community.map((s) => s.toLowerCase()),
  region: scopeSynonyms.region.map((s) => s.toLowerCase()),
  municipality: scopeSynonyms.municipality.map((s) => s.toLowerCase()),
  county: scopeSynonyms.county.map((s) => s.toLowerCase()),
  state: scopeSynonyms.state.map((s) => s.toLowerCase()),
  country: scopeSynonyms.country.map((s) => s.toLowerCase()),
  global: scopeSynonyms.global.map((s) => s.toLowerCase()),
};
