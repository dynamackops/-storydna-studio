import { describe, expect, it } from "vitest";
import { commentarySampleTimes } from "./videoFrames";

describe("commentarySampleTimes", () => {
  it("samples the entire clip in chronological order", () => {
    const times = commentarySampleTimes(60);
    expect(times).toHaveLength(8);
    expect(times[0]).toBeGreaterThanOrEqual(0);
    expect(times.at(-1)).toBeLessThanOrEqual(60);
    expect(times.every((time, index) => index === 0 || time > times[index - 1])).toBe(true);
  });

  it("keeps very short clips inside their duration", () => {
    const times = commentarySampleTimes(1, 4);
    expect(times).toHaveLength(4);
    expect(Math.max(...times)).toBeLessThanOrEqual(1);
  });
});
