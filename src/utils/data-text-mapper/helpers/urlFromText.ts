const urlRegexSafe = require("url-regex-safe");
const urlRegex = urlRegexSafe();

const urlFromText = (text: string): string | null => {
  const urlMatches = text.match(urlRegex);
  const imageRexExp = new RegExp(/\.(jpg|jpeg|png|gif|svg)/gi);
  let linkMatches: string[] = [];
  if (urlMatches && urlMatches?.length > 0)
    linkMatches = urlMatches.filter((url) => !(url || "").match(imageRexExp));
  if (linkMatches && linkMatches?.length > 0) return linkMatches[0];
  return null;
};

const removeUrlFromText = (text: string): string => {
  const regExp = new RegExp(urlRegex);
  const reducedText: string = text.replace(regExp, "").trim();
  return reducedText;
};

export { urlFromText, removeUrlFromText, urlRegex };
