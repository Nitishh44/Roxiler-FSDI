export function sortRows(rows, key, direction) {
  const multiplier = direction === "desc" ? -1 : 1;

  return [...rows].sort((left, right) => {
    const leftValue = left[key];
    const rightValue = right[key];

    if (leftValue == null || rightValue == null) {
      if (leftValue == null && rightValue == null) return 0;
      return leftValue == null ? 1 : -1;
    }

    if (/(date|_at)$/i.test(key)) {
      return (
        (new Date(leftValue).getTime() - new Date(rightValue).getTime()) *
        multiplier
      );
    }

    if (
      typeof leftValue === "number" ||
      typeof rightValue === "number" ||
      key.toLowerCase().includes("rating")
    ) {
      return (Number(leftValue) - Number(rightValue)) * multiplier;
    }

    return (
      String(leftValue).localeCompare(String(rightValue), undefined, {
        numeric: true,
        sensitivity: "base",
      }) * multiplier
    );
  });
}
