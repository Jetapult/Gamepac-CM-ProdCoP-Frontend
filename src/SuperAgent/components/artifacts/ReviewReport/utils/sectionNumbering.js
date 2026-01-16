/**
 * Utility to handle dynamic section numbering when sections are missing
 */

/**
 * Strips the existing number prefix from a title and replaces it with a new number
 * Handles formats like "1. Title", "1.1 Title", "2.3.4 Title"
 * @param {string} title - The original title with embedded number
 * @param {string} newNumber - The new number to use (e.g., "1", "1.1", "2.3")
 * @returns {string} - The title with the new number
 */
export const replaceNumberInTitle = (title, newNumber) => {
  if (!title) return title;

  // Match patterns like "1. ", "1.1 ", "2.3.4 " at the start of the string
  const numberPattern = /^[\d.]+\s*/;
  const strippedTitle = title.replace(numberPattern, "").trim();

  return `${newNumber} ${strippedTitle}`;
};

/**
 * Checks if a section has meaningful data
 * @param {any} data - The section data
 * @returns {boolean}
 */
export const hasData = (data) => {
  if (!data) return false;
  if (typeof data !== "object") return true;

  // Check if it has a title or any non-empty arrays/values
  const keys = Object.keys(data);
  return keys.some((key) => {
    const value = data[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "object" && value !== null) return hasData(value);
    return value !== null && value !== undefined;
  });
};

/**
 * Calculates dynamic section numbers based on which sections have data
 * @param {Object} data - The full report data
 * @returns {Object} - Map of section keys to their dynamic numbers
 */
export const calculateSectionNumbers = (data) => {
  const numbers = {};

  // Main sections (1, 2, 3, 4)
  const mainSections = [
    {
      key: "section1",
      subsections: ["section1_1", "section1_2", "section1_3", "section1_4"],
    },
    {
      key: "section2",
      subsections: [
        "section2_1",
        "section2_2",
        "section2_3",
        "section2_4",
        "section2_5",
      ],
    },
    {
      key: "section3",
      subsections: ["section3_1", "section3_2", "section3_3"],
    },
    {
      key: "section4",
      subsections: ["section4_1", "section4_2", "section4_3", "section4_4"],
    },
  ];

  let mainNumber = 0;

  for (const section of mainSections) {
    // Check if main section or any of its subsections have data
    const mainHasData = hasData(data[section.key]);
    const anySubsectionHasData = section.subsections.some((sub) =>
      hasData(data[sub])
    );

    if (mainHasData || anySubsectionHasData) {
      mainNumber++;
      numbers[section.key] = `${mainNumber}.`;

      // Calculate subsection numbers
      let subNumber = 0;
      for (const subKey of section.subsections) {
        if (hasData(data[subKey])) {
          subNumber++;
          numbers[subKey] = `${mainNumber}.${subNumber}`;
        }
      }
    }
  }

  return numbers;
};
