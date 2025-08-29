import { 
  SupportedLanguagesType,
  SupportedLanguagesParameter,
  TranslationData,
  TranslationDataSchema 
} from "@/src/app/api/translate/translate.schema";
import { getGoogleTranslateApiConfig, GoogleTranslateApiConfig } from "./helpers/config";
import { getLogger } from "../../logging/logger";

const log = getLogger("google-translate-json");

export interface TranslateJsonParams {
  content: unknown;
  language?: SupportedLanguagesParameter;
}

/**
 * Interface for Google Cloud Translate API request
 */
interface GoogleTranslateRequest {
  contents: string[];
  sourceLanguageCode?: string;
  targetLanguageCode: string;
  parent: string;
}

/**
 * Interface for Google Cloud Translate API response
 */
interface GoogleTranslateResponse {
  translations: Array<{
    translatedText: string;
    detectedLanguageCode?: string;
  }>;
}

/**
 * Interface for language detection response
 */
interface DetectLanguageResponse {
  languages: Array<{
    languageCode: string;
    confidence: number;
  }>;
}

/**
 * Extracts all translatable strings from a JSON object
 * @param obj - The object to extract strings from
 * @returns Array of strings to translate
 */
function extractStrings(obj: unknown): string[] {
  const strings: string[] = [];
  
  const extract = (value: unknown) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      strings.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(extract);
    } else if (value !== null && typeof value === 'object') {
      Object.values(value as Record<string, unknown>).forEach(extract);
    }
  };
  
  extract(obj);
  return strings;
}

/**
 * Replaces strings in a JSON object with translated versions
 * @param obj - The original object
 * @param originalStrings - Original strings that were translated
 * @param translatedStrings - Corresponding translated strings
 * @returns Object with translated strings
 */
function replaceStrings(obj: unknown, originalStrings: string[], translatedStrings: string[]): unknown {
  const stringMap = new Map(originalStrings.map((str, index) => [str, translatedStrings[index]]));
  
  const replace = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return stringMap.get(value) || value;
    } else if (Array.isArray(value)) {
      return value.map(replace);
    } else if (value !== null && typeof value === 'object') {
      const replaced: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        replaced[key] = replace(val);
      }
      return replaced;
    }
    return value;
  };
  
  return replace(obj);
}

/**
 * Detects the language of the given text using Google Cloud Translate API
 * @param text - Text to detect language for
 * @param config - Google Translate API configuration
 * @returns Detected language code
 */
async function detectLanguage(text: string, config: GoogleTranslateApiConfig): Promise<string> {
  try {
    log.debug({ data: { textLength: text.length } }, "Detecting language for text");
    
    const apiPath = `/v3/projects/${config.projectId}/locations/global:detectLanguage`;
    const url = new URL(apiPath, config.host);
    
    const requestBody = {
      parent: `projects/${config.projectId}/locations/global`,
      content: text.substring(0, 1000) // Limit text for detection
    };
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Use access token if available
    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    } else if (config.apiKey) {
      url.searchParams.set('key', config.apiKey);
    }
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      log.warn({ data: { status: response.status } }, "Language detection failed, defaulting to English");
      return 'en';
    }
    
    const data = await response.json() as DetectLanguageResponse;
    const detectedLang = data.languages?.[0]?.languageCode || 'en';
    
    log.debug({ data: { detectedLanguage: detectedLang } }, "Language detected successfully");
    return detectedLang;
    
  } catch (error) {
    log.warn({ error }, "Language detection error, defaulting to English");
    return 'en';
  }
}

/**
 * Translates an array of strings using Google Cloud Translate API
 * @param strings - Strings to translate
 * @param sourceLanguage - Source language code
 * @param targetLanguage - Target language code
 * @param config - Google Translate API configuration
 * @returns Array of translated strings
 */
async function translateStrings(
  strings: string[], 
  sourceLanguage: string, 
  targetLanguage: string, 
  config: GoogleTranslateApiConfig
): Promise<string[]> {
  if (strings.length === 0) {
    return [];
  }
  
  try {
    log.debug({ 
      data: {
        stringCount: strings.length,
        sourceLanguage,
        targetLanguage
      }
    }, "Starting string translations");    const apiPath = `/v3/projects/${config.projectId}/locations/global:translateText`;
    const url = new URL(apiPath, config.host);
    
    const requestBody: GoogleTranslateRequest = {
      parent: `projects/${config.projectId}/locations/global`,
      contents: strings,
      sourceLanguageCode: sourceLanguage,
      targetLanguageCode: targetLanguage,
    };
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Use access token if available
    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    } else if (config.apiKey) {
      url.searchParams.set('key', config.apiKey);
    }
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      log.error({ 
        status: response.status, 
        error: errorText 
      }, "Translation request failed");
      throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as GoogleTranslateResponse;
    const translatedStrings = data.translations.map(t => t.translatedText);
    
    log.debug({ 
      data: {
        translatedCount: translatedStrings.length,
        sourceLanguage,
        targetLanguage
      }
    }, "Translation completed successfully");
    
    return translatedStrings;
    
  } catch (error) {
    log.error({ error, sourceLanguage, targetLanguage }, "Translation error");
    throw error;
  }
}

/**
 * Translates JSON content using Google Cloud Translate API
 * @param params - Translation parameters
 * @returns Translation data with all supported languages
 */
export async function translateJson(params: TranslateJsonParams): Promise<TranslationData> {
  "use cache";
  
  const { content, language } = params;
  const startTime = Date.now();
  
  try {
    // TRACE: Function call with input parameters according to logging guideline
    log.trace({ 
      query: { 
        contentType: typeof content,
        hasContent: !!content,
        language: language || "auto"
      } 
    }, "translateJson called");
    
    log.info({}, "Starting JSON translation");
    
    // Get Google Translate API configuration
    const config = await getGoogleTranslateApiConfig();
    
    // Extract all translatable strings from the content
    const originalStrings = extractStrings(content);
    
    if (originalStrings.length === 0) {
      log.warn({ data: { stringsFound: 0 } }, "No translatable strings found in content");
      // Return content as-is for all languages if no strings to translate
      const supportedLanguages: SupportedLanguagesType[] = ["de", "en", "pl", "uk", "ru"];
      const result: TranslationData = supportedLanguages.map(lang => ({
        language: lang,
        original: true,
        content: content
      }));
      return TranslationDataSchema.parse(result);
    }
    
    // Detect source language if not provided or if "auto" is specified
    let sourceLanguage: string;
    if (!language || language === "auto") {
      // Use the first string for language detection
      const sampleText = originalStrings.slice(0, 3).join(' '); // Use first few strings
      sourceLanguage = await detectLanguage(sampleText, config);
      log.info({ data: { detectedLanguage: sourceLanguage } }, "Language auto-detected");
    } else {
      sourceLanguage = language;
      log.info({ data: { sourceLanguage } }, "Using provided source language");
    }
    
    // Supported languages list
    const supportedLanguages: SupportedLanguagesType[] = ["de", "en", "pl", "uk", "ru"];
    
    // Create translation results
    const result: TranslationData = [];
    
    for (const targetLanguage of supportedLanguages) {
      const isOriginal = targetLanguage === sourceLanguage;
      
      if (isOriginal) {
        // Use original content for the source language
        result.push({
          language: targetLanguage,
          original: true,
          content: content
        });
      } else {
        // Translate to target language
        try {
          log.debug({ data: { targetLanguage } }, "Translating to target language");
          
          const translatedStrings = await translateStrings(
            originalStrings,
            sourceLanguage,
            targetLanguage,
            config
          );
          
          // Replace original strings with translated ones in the content structure
          const translatedContent = replaceStrings(content, originalStrings, translatedStrings);
          
          result.push({
            language: targetLanguage,
            original: false,
            content: translatedContent
          });
          
          log.debug({ data: { targetLanguage } }, "Translation completed for target language");
          
        } catch (error) {
          log.error({ 
            error, 
            targetLanguage 
          }, "Failed to translate to target language, using original content");
          
          // Fall back to original content if translation fails
          result.push({
            language: targetLanguage,
            original: false,
            content: content
          });
        }
      }
    }
    
    log.info({ 
      data: {
        translatedLanguages: result.length,
        sourceLanguage,
        duration: Date.now() - startTime
      }
    }, "JSON translation completed successfully");
    
    // Validate and return the result
    return TranslationDataSchema.parse(result);
    
  } catch (error) {
    log.error({ error }, "JSON translation failed");
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
