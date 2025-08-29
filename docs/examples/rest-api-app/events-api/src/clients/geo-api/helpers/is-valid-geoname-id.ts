export const isValidGeonameId = (geonameId: string): boolean => {
  return geonameId.match(/^geoname\.\d+$/) !== null;
};
