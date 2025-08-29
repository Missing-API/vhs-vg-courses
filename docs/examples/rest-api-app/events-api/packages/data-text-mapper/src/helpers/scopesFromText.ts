import {
  prefixedStringsFromText,
  removePrefixedStringsFromText,
} from "./prefixedStringsFromText";

const scopesRegex = /(@.*?\s)|(@.*?$)/g;

const scopesFromText = (text: string): string[] | null => {
  return prefixedStringsFromText(text, "@");
};

const removeScopesFromText = (text: string): string => {
  return removePrefixedStringsFromText(text, "@");
};

export { scopesFromText, removeScopesFromText, scopesRegex };
