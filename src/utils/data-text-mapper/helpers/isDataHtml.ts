/**
 * Checks if the given text matches the special HTML structure created by dataToHtml
 */
export const isDataHtml = (text: string): boolean => {
  if (!text) return false;

  // Check for any of the special classes used by dataToHtml
  const dataHtmlClasses = [
    "p-description",
    "u-photo",
    "u-url",
    "p-category",
    "p-scope",
    "taxonomy",
    "link",
  ];

  return dataHtmlClasses.some(
    (className) => text.includes(`class="`) && text.includes(className)
  );
};
