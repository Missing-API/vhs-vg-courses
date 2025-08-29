/**
 * Type to structure typical metadata. Text as description and optional data.
 */
export interface TextWithData {
  description: string;
  url?: string;
  tags?: string[];
  scopes?: string[];
  image?: string;
  document?: string;
}
