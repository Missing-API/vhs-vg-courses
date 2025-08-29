import { Language } from "../types/languages.types";
import languages from "@cospired/i18n-iso-languages";

export const getLanguageName = (language: Language, localize: Language) => {
  return languages.getName(language, localize);
};
