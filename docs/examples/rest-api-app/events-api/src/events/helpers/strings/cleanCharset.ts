/**
 * strip strange line break characters from content
 * @param content: string
 * @returns string
 */
export const cleanCharset = (content: string): string => {
  let cleanContent: string = content || "";
  const regex = /[\u2028|\u2029]/g;
  cleanContent = cleanContent.replaceAll(regex, "");
  return cleanContent;
};
