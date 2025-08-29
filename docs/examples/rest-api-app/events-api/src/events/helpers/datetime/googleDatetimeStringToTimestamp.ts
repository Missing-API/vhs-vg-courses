export interface GoogleDatetimeString {
  dateTime: string;
}

export const googleDatetimeStringToTimestamp = (
  datetime: GoogleDatetimeString
): number => {
  const date = new Date(datetime.dateTime);
  return date.getTime();
};
