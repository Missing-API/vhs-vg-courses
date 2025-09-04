const containsHtml = (text: string): boolean => {
  const matchTags: RegExp = new RegExp("(<.*>.*</.*>)|(<.*/>)", "gi");
  const matches: any | null = text.match(matchTags);
  return matches ? true : false;
};

export { containsHtml };
