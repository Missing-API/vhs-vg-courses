export interface Translation {
  language: string; // ISO 639-1
  title: string;
  text: string;
  tags?: string[];
}

export interface TranslatedContents {
  translations: Translation[];
}
