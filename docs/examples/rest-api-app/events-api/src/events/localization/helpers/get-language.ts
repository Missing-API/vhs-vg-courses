import { Language } from "../types/languages.types";
import {
  LocalizationObject,
  LocalizationString,
} from "../types/localization.types";

export const getLanguage = (
  localization: LocalizationObject | LocalizationString
): Language => {
  if (typeof localization === "string") {
    return localization.split("_")[0] as Language;
  }
  return localization.language;
};
