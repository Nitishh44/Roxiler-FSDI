import assert from "node:assert/strict";
import test from "node:test";
import { sortRows } from "./sortRows.js";

test("sortRows sorts text without mutating the source array", () => {
  const rows = [{ name: "Willow" }, { name: "cedar" }, { name: "Alder" }];

  assert.deepEqual(
    sortRows(rows, "name", "asc").map((row) => row.name),
    ["Alder", "cedar", "Willow"]
  );
  assert.deepEqual(
    sortRows(rows, "name", "desc").map((row) => row.name),
    ["Willow", "cedar", "Alder"]
  );
  assert.deepEqual(rows.map((row) => row.name), ["Willow", "cedar", "Alder"]);
});

test("sortRows sorts numeric-string ratings and keeps missing values last", () => {
  const rows = [
    { average_rating: "4.25" },
    { average_rating: null },
    { average_rating: "1.50" },
  ];

  assert.deepEqual(
    sortRows(rows, "average_rating", "asc").map((row) => row.average_rating),
    ["1.50", "4.25", null]
  );
});

test("sortRows sorts timestamp fields chronologically", () => {
  const rows = [
    { created_at: "2025-02-01T00:00:00Z" },
    { created_at: "2024-12-01T00:00:00Z" },
  ];

  assert.deepEqual(
    sortRows(rows, "created_at", "desc").map((row) => row.created_at),
    ["2025-02-01T00:00:00Z", "2024-12-01T00:00:00Z"]
  );
});
