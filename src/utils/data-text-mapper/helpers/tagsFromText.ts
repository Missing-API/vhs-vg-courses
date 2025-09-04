import {
  prefixedStringsFromText,
  removePrefixedStringsFromText,
} from "./prefixedStringsFromText";

const tagsFromText = (text: string): string[] | null => {
  return prefixedStringsFromText(text, "#");
};

const removeTagsFromText = (text: string): string => {
  return removePrefixedStringsFromText(text, "#");
};

export { tagsFromText, removeTagsFromText };
