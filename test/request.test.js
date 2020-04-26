import get from "../src";
import __fetch from "../src/fetch";
import createError from "http-errors";

jest.mock("../src/fetch", () => jest.fn());
jest.mock("../src/body-reader", () => ({
  getBodyReader: jest.fn().mockImplementation(() => "reader"),
}));

describe("request", () => {
  beforeEach(() => {
    __fetch.mockClear();
  });

  it("rejects if request is not ok", async () => {
    __fetch.mockImplementationOnce(() => ({
      ok: false,
      status: 420,
      statusText: "status",
    }));

    const promise = get("/");

    await expect(promise).rejects.toEqual(createError(420, "status"));
  });

  it("passes request init to fetch", async () => {
    __fetch.mockImplementationOnce(() => ({ ok: true }));
    const requestInit = {};
    const promise = get("/url", requestInit);

    const {
      calls: [[url, opts]],
    } = __fetch.mock;
    expect(url).toEqual("/url");
    expect(opts).toBe(requestInit);

    await expect(promise).resolves.toEqual("reader");
  });
});
