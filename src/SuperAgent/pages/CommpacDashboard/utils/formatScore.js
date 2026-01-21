// Helper function to format score to one decimal place
export const formatScore = (score) => {
  // Handle null, undefined, or object types
  if (
    score === null ||
    score === undefined ||
    (typeof score === "object" && !Array.isArray(score))
  ) {
    return "0.0";
  }

  // Convert to number if it's a string
  const numScore =
    typeof score === "string" ? parseFloat(score) : Number(score);

  // Check if it's a valid number
  if (isNaN(numScore) || !isFinite(numScore)) {
    return "0.0";
  }

  // Format to one decimal place
  return numScore.toFixed(1);
};

