import { describe, it, expect } from "vitest";
import { buildCourseSearchRequest, courseSearchHeaders } from "./build-course-search-request";

describe("buildCourseSearchRequest", () => {
  it("should build correct URL-encoded body for a location", () => {
    const body = buildCourseSearchRequest("Anklam");

    // Order is defined in implementation to make tests deterministic
    expect(body).toBe(
      "katortfilter%5B%5D=Anklam" +
      "&katortfilter%5B%5D=__reset__" +
      "&katwotagefilter%5B%5D=__reset__" +
      "&katzeitraumfilter=__reset__" +
      "&katkeinebegonnenenfilter%5B%5D=1" +
      "&katkeinebegonnenenfilter%5B%5D=__reset__" +
      "&katneuerkursfilter%5B%5D=__reset__" +
      "&katnichtvollefilter%5B%5D=1" +
      "&katnichtvollefilter%5B%5D=__reset__"
    );
  });

  it("should provide appropriate headers", () => {
    const headers = courseSearchHeaders();
    expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
  });

  it("should throw for empty location", () => {
    expect(() => buildCourseSearchRequest("")).toThrow(/Location name is required/);
  });
});