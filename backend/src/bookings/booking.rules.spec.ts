import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nightsBetweenDates, parseIsoDate, rangesOverlap } from "../common/dates.js";
import { canTransition, capacityError, createReference, estimateTotal } from "./booking.rules.js";

void describe("booking rules", () => {
  void it("rejects overlapping confirmed ranges and allows a same-day turnover", () => {
    const oct18 = parseIsoDate("2026-10-18");
    const oct21 = parseIsoDate("2026-10-21");
    const oct21b = parseIsoDate("2026-10-21");
    const oct24 = parseIsoDate("2026-10-24");
    const oct20 = parseIsoDate("2026-10-20");
    assert.ok(oct18 && oct21 && oct21b && oct24 && oct20);
    assert.equal(rangesOverlap(oct18, oct21, oct20, oct24), true);
    assert.equal(rangesOverlap(oct18, oct21, oct21b, oct24), false);
    assert.equal(nightsBetweenDates(oct18, oct21), 3);
  });

  void it("only allows the booking request lifecycle", () => {
    assert.equal(canTransition("REQUESTED", "REVIEWING"), true);
    assert.equal(canTransition("REVIEWING", "CONFIRMED"), true);
    assert.equal(canTransition("CONFIRMED", "DECLINED"), false);
    assert.equal(canTransition("DECLINED", "CONFIRMED"), false);
    assert.equal(canTransition("CANCELLED", "REQUESTED"), false);
    assert.equal(canTransition("CONFIRMED", "CANCELLED"), true);
  });

  void it("calculates the estimate from the nightly rate and enforces capacity", () => {
    assert.equal(estimateTotal(620, 3), 1860);
    assert.equal(capacityError(9, 8), "This stay accepts up to 8 guests.");
    assert.equal(capacityError(2, 8), null);
  });

  void it("builds an unguessable reference without ambiguous characters", () => {
    const reference = createReference(Uint8Array.from([0, 1, 2, 3, 4, 5]));
    assert.match(reference, /^HBP-[A-Z2-9]{6}$/);
    assert.equal(reference.includes("0"), false);
    assert.equal(reference.includes("1"), false);
  });
});
