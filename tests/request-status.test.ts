import { describe, expect, it } from "vitest";
import { REQUEST_STATUS_TRANSITIONS, REQUEST_STATUSES } from "@/lib/constants";

describe("REQUEST_STATUS_TRANSITIONS", () => {
  it("allows claimed requests to move to in-progress or cancelled", () => {
    expect(REQUEST_STATUS_TRANSITIONS.CLAIMED).toEqual(
      expect.arrayContaining(["IN_PROGRESS", "CANCELLED"]),
    );
  });

  it("allows in-progress requests to move to completed or cancelled", () => {
    expect(REQUEST_STATUS_TRANSITIONS.IN_PROGRESS).toEqual(
      expect.arrayContaining(["COMPLETED", "CANCELLED"]),
    );
  });

  it("never allows an open request to skip straight to a terminal status", () => {
    expect(REQUEST_STATUS_TRANSITIONS.OPEN).toEqual([]);
  });

  it("has no outgoing transitions from terminal statuses", () => {
    expect(REQUEST_STATUS_TRANSITIONS.COMPLETED).toEqual([]);
    expect(REQUEST_STATUS_TRANSITIONS.CANCELLED).toEqual([]);
  });

  it("only lists transitions to statuses that actually exist", () => {
    for (const status of REQUEST_STATUSES) {
      for (const next of REQUEST_STATUS_TRANSITIONS[status]) {
        expect(REQUEST_STATUSES).toContain(next);
      }
    }
  });
});
