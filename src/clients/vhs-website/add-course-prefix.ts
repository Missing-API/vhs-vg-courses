/**
 * Add "vhs Kurs: " prefix to course titles for consistency across all outputs.
 * Only adds prefix if not already present to avoid duplication.
 */
export function addCoursePrefix(title: string): string {
  if (!title) return title;
  
  // Normalize and check if prefix already exists (case-insensitive)
  const normalizedTitle = title.trim();
  
  // Don't add prefix to whitespace-only strings
  if (!normalizedTitle) return title;
  
  const prefix = "vhs Kurs: ";
  
  // Check if prefix already exists (case-insensitive)
  if (normalizedTitle.toLowerCase().startsWith(prefix.toLowerCase())) {
    return title; // Return original title to preserve formatting
  }
  
  return `${prefix}${normalizedTitle}`;
}
