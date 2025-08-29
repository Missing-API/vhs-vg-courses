const urlRegexSafe = require("url-regex-safe");
const urlRegex = urlRegexSafe();

const imageFromText = (text: string): string | null => {
  const urlMatches = text.match(urlRegex);
  const imageRexExp = new RegExp(/\.(jpg|jpeg|png|gif|svg)/gi);
  let imageMatches: string[] = [];
  if (urlMatches && urlMatches?.length > 0)
    imageMatches = urlMatches.filter((url) => (url || "").match(imageRexExp));
  if (imageMatches && imageMatches?.length > 0) return imageMatches[0];
  return null;
};

const removeImageFromText = (text: string): string => {
  const regExp = new RegExp(urlRegex);
  const reducedText: string = text.replace(regExp, "").trim();
  return reducedText;
};

export { imageFromText, removeImageFromText, urlRegex };
