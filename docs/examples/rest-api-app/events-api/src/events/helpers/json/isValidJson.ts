/**
 * Check if the input is a valid json object.
 * @param obj: any
 * @returns boolean
 */
export const isValidJson = (obj: unknown): boolean => {
  if (obj === undefined || obj === null || obj.constructor != Object)
    return false;
  if (Object.keys(obj).length === 0) return false;
  return true;
};
