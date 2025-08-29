export interface GoogleDatetimeObject {
  dateTime: string;
  timeZone?: string;
}

export const googleDatetimeObjectToTimestamp = (
  datetime: GoogleDatetimeObject
): number => {
  const date = new Date(datetime.dateTime);
  return date.getTime();
};
